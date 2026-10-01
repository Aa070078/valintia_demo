import { Module } from '@nestjs/common';
import { MailModule } from '../infrastructure/mail/mail.module.js';
import { RedisModule } from '../infrastructure/redis/redis.module.js';
import { OtpController } from './otp.controller.js';
import { OtpService } from './otp.service.js';

@Module({
  imports: [RedisModule, MailModule],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
