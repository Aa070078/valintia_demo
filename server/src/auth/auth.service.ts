import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
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
import { isRealEmail, requiresOnboarding } from './identity-policy.js';
import { TemporaryLoginLimiter } from './temporary-login-limiter.service.js';
import { OnboardingService } from './onboarding.service.js';
import type { RequestUser } from '../common/decorators/current-user.decorator.js';

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
    @Inject(TemporaryLoginLimiter)
    private readonly temporaryLimiter: TemporaryLoginLimiter,
    @Inject(OnboardingService) private readonly onboarding: OnboardingService,
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
    if (!isRealEmail(normalizedEmail)) return;
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (user?.emailVerified && !requiresOnboarding(user)) {
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
      user = await this.prisma.user.findUnique({ where: { email } });
      if (
        !user?.emailVerified ||
        requiresOnboarding(user) ||
        !isRealEmail(email)
      )
        throw new Error('No matching account');
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
      user.email !== claims.email ||
      !user.emailVerified ||
      requiresOnboarding(user) ||
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
        email: claims.email,
        emailVerified: true,
        passwordHash: user.passwordHash,
      },
      data: { passwordHash, mustChangePassword: false },
    });
    if (updated.count !== 1) throw this.passwordResetTokens.invalidToken();
    // Existing stateless access JWTs remain valid until expiry; no revocation is implied.
    return { success: true, message: 'Password reset successfully' };
  }

  async login(loginDto: LoginDto) {
    const identifier = loginDto.email.trim().toLowerCase();
    const temporary = identifier.endsWith('@internal.local');
    if (!temporary && !isRealEmail(identifier)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (temporary) await this.temporaryLimiter.consume(identifier);
    const user = await this.prisma.user.findUnique({
      where: temporary ? { temporaryLogin: identifier } : { email: identifier },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (
      temporary &&
      (!requiresOnboarding(user) ||
        !user.onboardingVersion ||
        !user.temporaryCredentialsExpiresAt ||
        user.temporaryCredentialsExpiresAt.getTime() <= Date.now())
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // The same account budget applies if an email-first user logs in via real email.
    if (!temporary && requiresOnboarding(user) && user.temporaryLogin) {
      await this.temporaryLimiter.consume(user.temporaryLogin);
    }
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (requiresOnboarding(user)) {
      if (
        !user.onboardingVersion ||
        !user.temporaryCredentialsExpiresAt ||
        user.temporaryCredentialsExpiresAt.getTime() <= Date.now()
      ) {
        throw new UnauthorizedException(
          'Provisioning credentials expired. Contact an administrator.',
        );
      }
      const onboardingToken = await this.jwtService.signAsync(
        {
          sub: user.id,
          role: user.role,
          scope: 'onboarding',
          version: user.onboardingVersion,
        },
        { expiresIn: '15m' },
      );
      return {
        onboardingToken,
        onboardingRequired: true,
        user: this.identity(user),
      };
    }
    return this.issueAccessToken(user);
  }

  private identity(user: User) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      emailVerified: user.emailVerified,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      onboardingRequired: requiresOnboarding(user),
    };
  }

  /** Authentication credential shared by password login and OTP login. */
  private async issueAccessToken(user: User) {
    if (requiresOnboarding(user))
      throw new UnauthorizedException('Onboarding is incomplete');
    // JWT timestamps have second precision. Wait at most one second so newly
    // issued tokens clear the cutoff without accepting older tokens from that second.
    if (user.accessTokensValidAfter) {
      const boundary =
        Math.ceil(user.accessTokensValidAfter.getTime() / 1000) * 1000;
      if (boundary > Date.now())
        await new Promise((done) => setTimeout(done, boundary - Date.now()));
    }
    const payload = {
      sub: user.id,
      role: user.role,
    };

    // Login's access JWT represents authenticated identity (sub/role), using
    // AuthModule's normal secret; email verification proof cannot log a user in.
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: this.identity(user),
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
    if (!isRealEmail(username))
      throw new BadRequestException('A real email address is required');

    // Security gate BEFORE any database access: this exact normalized email must
    // have passed EMAIL_VERIFICATION. Client verification booleans are not proof.
    await this.emailVerification.verify(verificationToken, username);

    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('Username is already taken');
    }
    if (await this.prisma.user.findUnique({ where: { email: username } }))
      throw new ConflictException('Email is already assigned');

    const passwordHash = await bcrypt.hash(password, 10);

    let newUser: User;
    try {
      newUser = await this.prisma.user.create({
        data: {
          username,
          email: username,
          emailVerified: true,
          passwordHash,
          role: Role.CUSTOMER,
          mustChangePassword: false,
        },
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002')
        throw new ConflictException('Email or username is already assigned');
      throw error;
    }

    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      emailVerified: newUser.emailVerified,
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

    return this.identity(user);
  }

  async changePassword(
    actor: RequestUser,
    changePasswordDto: ChangePasswordDto,
  ) {
    return this.onboarding.changePassword(actor, changePasswordDto.newPassword);
  }
}
