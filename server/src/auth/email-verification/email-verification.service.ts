import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OtpPurpose } from '../../otp/enums/otp-purpose.enum.js';

@Injectable()
export class EmailVerificationService {
  constructor(@Inject(JwtService) private readonly jwt: JwtService) {}

  issue(email: string): Promise<string> {
    return this.jwt.signAsync({
      email: email.trim().toLowerCase(),
      purpose: OtpPurpose.EMAIL_VERIFICATION,
      type: 'email_verification',
    });
  }

  async verify(token: string, email: string): Promise<void> {
    try {
      if (typeof token !== 'string' || !token.trim()) {
        throw new Error('Missing token');
      }
      const payload =
        await this.jwt.verifyAsync<Record<string, unknown>>(token);
      if (
        payload.type !== 'email_verification' ||
        payload.purpose !== OtpPurpose.EMAIL_VERIFICATION ||
        payload.email !== email.trim().toLowerCase() ||
        typeof payload.exp !== 'number' ||
        !Number.isFinite(payload.exp)
      ) {
        throw new Error('Invalid verification claims');
      }
    } catch {
      throw new BadRequestException(
        'Invalid or expired email verification token',
      );
    }
  }
}
