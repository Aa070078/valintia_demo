import { Module } from '@nestjs/common';
import { EmailVerificationModule } from '../auth/email-verification/email-verification.module.js';
import { MailModule } from '../infrastructure/mail/mail.module.js';
import { RedisModule } from '../infrastructure/redis/redis.module.js';
import { OtpController } from './otp.controller.js';
import { OtpService } from './otp.service.js';

@Module({
  imports: [RedisModule, MailModule, EmailVerificationModule],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
