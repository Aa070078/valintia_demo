import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EmailVerificationService } from '../auth/email-verification/email-verification.service.js';
import { PasswordResetTokenService } from '../auth/password-reset/password-reset-token.service.js';
import { SendOtpDto } from './dto/send-otp.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { OtpPurpose } from './enums/otp-purpose.enum.js';
import { OtpService } from './otp.service.js';

/** Orchestrates purpose-specific proof without putting auth policy in OTP mechanics. */
@Injectable()
export class OtpProofService {
  constructor(
    @Inject(OtpService) private readonly otp: OtpService,
    @Inject(EmailVerificationService)
    private readonly emailVerification: EmailVerificationService,
    @Inject(PasswordResetTokenService)
    private readonly resetTokens: PasswordResetTokenService,
  ) {}

  sendRegistrationOtp(dto: SendOtpDto) {
    // Account-bound requests must use the auth endpoints' generic response path.
    if (
      (dto.purpose ?? OtpPurpose.EMAIL_VERIFICATION) !==
      OtpPurpose.EMAIL_VERIFICATION
    ) {
      throw new BadRequestException(
        'Use the dedicated auth request endpoint for this OTP purpose',
      );
    }
    return this.otp.generateAndSendOtp(dto);
  }

  async verifyAndIssueProof(dto: VerifyOtpDto) {
    const purpose = dto.purpose ?? OtpPurpose.EMAIL_VERIFICATION;
    if (
      purpose !== OtpPurpose.EMAIL_VERIFICATION &&
      purpose !== OtpPurpose.PASSWORD_RESET
    ) {
      throw new BadRequestException('Use /api/auth/login/otp/verify for LOGIN');
    }
    const result = await this.otp.verifyOtp(dto);
    // NEW signed proof bridges separate requests; LOGIN authenticates through AuthService.
    return purpose === OtpPurpose.EMAIL_VERIFICATION
      ? {
          ...result,
          verificationToken: await this.emailVerification.issue(dto.email),
        }
      : {
          ...result,
          passwordResetToken: await this.resetTokens.issue(dto.email),
        };
  }
}
