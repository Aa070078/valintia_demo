import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';

import { Role } from '../generated/prisma/client.js';
import { PrismaService } from '../infrastructure/database/prisma.service.js';
import { OtpService } from '../otp/otp.service.js';
import { OtpPurpose } from '../otp/enums/otp-purpose.enum.js';
import { EmailOtpRequestDto } from './dto/email-otp-request.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { LoginOtpVerifyDto } from './dto/login-otp-verify.dto.js';
import type { User } from '../generated/prisma/client.js';
import { PasswordResetTokenService } from './password-reset/password-reset-token.service.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { EmailVerificationService } from './email-verification/email-verification.service.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(EmailVerificationService)
    private readonly emailVerification: EmailVerificationService,
    @Inject(OtpService) private readonly otpService: OtpService,
    @Inject(PasswordResetTokenService)
    private readonly passwordResetTokens: PasswordResetTokenService,
  ) {}

  /** Respond independently of account lookup/mail latency; no account-existence signal. */
  private async requestAccountOtp(email: string, purpose: OtpPurpose) {
    const normalizedEmail = email.trim().toLowerCase();
    // Best-effort in-process work, with rejection handling. No durable queue is implied.
    void this.deliverAccountOtp(normalizedEmail, purpose).catch(() => {
      this.logger.warn(
        `Account OTP request could not be delivered (${purpose})`,
      );
    });
    return {
      success: true,
      message:
        'If the account exists, a verification code will be sent to its email.',
    };
  }

  private async deliverAccountOtp(
    normalizedEmail: string,
    purpose: OtpPurpose,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { username: normalizedEmail },
    });
    if (user) {
      await this.otpService.generateAndSendOtp({
        email: normalizedEmail,
        purpose,
      });
    }
  }

  forgotPassword(dto: EmailOtpRequestDto) {
    return this.requestAccountOtp(dto.email, OtpPurpose.PASSWORD_RESET);
  }

  requestLoginOtp(dto: EmailOtpRequestDto) {
    return this.requestAccountOtp(dto.email, OtpPurpose.LOGIN);
  }

  /** Consume only a LOGIN challenge, then authenticate the registered account. */
  async loginWithOtp(dto: LoginOtpVerifyDto) {
    const email = dto.email.trim().toLowerCase();
    let user: User | null;
    try {
      await this.otpService.verifyOtp({
        email,
        otp: dto.otp,
        purpose: OtpPurpose.LOGIN,
      });
      user = await this.prisma.user.findUnique({ where: { username: email } });
      if (!user) throw new Error('No matching account');
    } catch {
      // Invalid codes and absent accounts produce the same authentication failure.
      throw new UnauthorizedException('Invalid or expired login code');
    }
    return this.issueAccessToken(user);
  }

  /** Reset proof is not an access credential; it only authorizes this password update. */
  async resetPassword(dto: ResetPasswordDto) {
    const claims = await this.passwordResetTokens.verify(
      dto.passwordResetToken,
    );
    const user = await this.prisma.user.findUnique({
      where: { id: claims.sub },
    });
    if (
      !user ||
      user.username !== claims.email ||
      this.passwordResetTokens.passwordVersion(user.passwordHash) !==
        claims.passwordVersion
    ) {
      throw this.passwordResetTokens.invalidToken();
    }
    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    // Compare-and-update makes competing resets single-use without a new session store.
    // Any password change invalidates proofs bound to the previous bcrypt hash.
    const updated = await this.prisma.user.updateMany({
      where: {
        id: user.id,
        username: claims.email,
        passwordHash: user.passwordHash,
      },
      data: { passwordHash, mustChangePassword: false },
    });
    if (updated.count !== 1) throw this.passwordResetTokens.invalidToken();
    // Existing stateless access JWTs remain valid until expiry; no revocation is implied.
    return { success: true, message: 'Password reset successfully' };
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueAccessToken(user);
  }

  /** Authentication credential shared by password login and OTP login. */
  private async issueAccessToken(user: User) {
    const payload = {
      sub: user.id,
      role: user.role,
    };

    // Login's access JWT represents authenticated identity (sub/role), using
    // AuthModule's normal secret; email verification proof cannot log a user in.
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    };
  }

  /**
   * Consumes recent email-verification proof from a separate OTP HTTP request.
   * Input is the existing username/password contract plus verificationToken;
   * output is the created CUSTOMER identity, not an access JWT or login session.
   * Once proof passes, retain duplicate rejection, bcrypt hashing, CUSTOMER-only
   * creation, mustChangePassword=false, and the response without a password hash.
   */
  async register(registerDto: RegisterDto) {
    const { password, verificationToken } = registerDto;
    // Match the representation used by the OTP Redis keys and signed email claim.
    const username = registerDto.username.trim().toLowerCase();

    // Security gate BEFORE any database access: this exact normalized email must
    // have passed EMAIL_VERIFICATION. Client verification booleans are not proof.
    await this.emailVerification.verify(verificationToken, username);

    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('Username is already taken');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        username,
        passwordHash,
        role: Role.CUSTOMER,
        mustChangePassword: false,
      },
    });

    return {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      mustChangePassword: newUser.mustChangePassword,
      createdAt: newUser.createdAt,
    };
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { newPassword } = changePasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustChangePassword: false,
      },
    });

    return {
      message: 'Password changed successfully',
      mustChangePassword: false,
    };
  }
}
