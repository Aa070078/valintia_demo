import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OtpPurpose } from '../../otp/enums/otp-purpose.enum.js';

@Injectable()
export class EmailVerificationService {
  // This module-scoped JwtService uses EmailVerificationModule's dedicated secret,
  // HS256, and short expiry; it is separate from AuthModule's access-JWT instance.
  constructor(@Inject(JwtService) private readonly jwt: JwtService) {}

  /**
   * Takes the email that passed EMAIL_VERIFICATION and returns a new signed proof.
   * The module configures JwtService; signAsync() performs the actual signing.
   * The library adds iat/exp to these application-specific email/purpose/type claims
   * and computes an HS256 signature with the secret, which is never embedded in
   * the JWT or returned to the frontend. This proof grants no login/session access.
   * Unlike the consumed OTP, verificationToken is currently reusable until expiry.
   */
  issue(email: string): Promise<string> {
    return this.jwt.signAsync({
      email: email.trim().toLowerCase(),
      purpose: OtpPurpose.EMAIL_VERIFICATION,
      type: 'email_verification',
    });
  }

  /**
   * SECOND verification stage: validate the proof carried into registration.
   * Takes verificationToken and the registration email; returns no value on success.
   * Requires genuine, unmodified, unexpired backend proof for this exact email,
   * rather than trusting client-supplied verified/emailVerified booleans.
   */
  async verify(token: string, email: string): Promise<void> {
    try {
      if (typeof token !== 'string' || !token.trim()) {
        throw new Error('Missing token');
      }
      // Verification is not decoding: JwtService checks the configured signature,
      // allowed HS256 algorithm, and expiration before claims are trusted below.
      const payload =
        await this.jwt.verifyAsync<Record<string, unknown>>(token);
      // type identifies email proof; purpose restricts it to EMAIL_VERIFICATION.
      // Exact normalized-email equality prevents A's proof from registering B.
      // exp must exist as a finite number; verifyAsync already enforces its deadline.
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
      // One public error avoids exposing unnecessary token-validation details.
      throw new BadRequestException(
        'Invalid or expired email verification token',
      );
    }
  }
}
