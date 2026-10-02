import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'node:crypto';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';
import { OtpPurpose } from '../../otp/enums/otp-purpose.enum.js';

interface PasswordResetClaims {
  sub: number;
  email: string;
  passwordVersion: string;
}

@Injectable()
export class PasswordResetTokenService {
  constructor(
    @Inject(JwtService) private readonly jwt: JwtService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  /** Fingerprint the bcrypt hash, never include plaintext or the bcrypt hash in proof. */
  passwordVersion(passwordHash: string): string {
    return createHash('sha256').update(passwordHash).digest('hex');
  }

  /** Proof that PASSWORD_RESET OTP succeeded; only reset-password may consume it. */
  async issue(email: string): Promise<string> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { username: normalizedEmail },
    });
    if (!user) throw this.invalidToken();
    return this.jwt.signAsync({
      sub: user.id,
      email: normalizedEmail,
      purpose: OtpPurpose.PASSWORD_RESET,
      type: 'password_reset',
      passwordVersion: this.passwordVersion(user.passwordHash),
    });
  }

  /** Checks authenticity and claims; AuthService also checks current account/password binding. */
  async verify(token: string): Promise<PasswordResetClaims> {
    try {
      if (typeof token !== 'string' || !token.trim())
        throw new Error('Missing token');
      const claims = await this.jwt.verifyAsync<Record<string, unknown>>(token);
      if (
        claims.type !== 'password_reset' ||
        claims.purpose !== OtpPurpose.PASSWORD_RESET ||
        typeof claims.sub !== 'number' ||
        !Number.isSafeInteger(claims.sub) ||
        claims.sub <= 0 ||
        typeof claims.email !== 'string' ||
        !claims.email ||
        claims.email !== claims.email.trim().toLowerCase() ||
        typeof claims.passwordVersion !== 'string' ||
        !/^[a-f0-9]{64}$/.test(claims.passwordVersion) ||
        typeof claims.exp !== 'number' ||
        !Number.isFinite(claims.exp)
      )
        throw new Error('Invalid reset claims');
      return {
        sub: claims.sub,
        email: claims.email,
        passwordVersion: claims.passwordVersion,
      };
    } catch {
      throw this.invalidToken();
    }
  }

  invalidToken(): BadRequestException {
    return new BadRequestException('Invalid or expired password reset token');
  }
}
