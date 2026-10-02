import { Module } from '@nestjs/common';
import { EmailVerificationModule } from '../auth/email-verification/email-verification.module.js';
import { PasswordResetTokenModule } from '../auth/password-reset/password-reset-token.module.js';
import { MailModule } from '../infrastructure/mail/mail.module.js';
import { RedisModule } from '../infrastructure/redis/redis.module.js';
import { OtpController } from './otp.controller.js';
import { OtpService } from './otp.service.js';
import { OtpProofService } from './otp-proof.service.js';

// Imports the shared proof service so OTP can issue the registration bridge,
// while Redis state and provider-specific email delivery remain separate concerns.
@Module({
  imports: [
    RedisModule,
    MailModule,
    EmailVerificationModule,
    PasswordResetTokenModule,
  ],
  controllers: [OtpController],
  providers: [OtpService, OtpProofService],
  exports: [OtpService],
})
export class OtpModule {}
