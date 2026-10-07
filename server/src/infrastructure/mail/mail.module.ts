import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service.js';
import { WelcomeService } from './welcome.service.js';

@Global()
@Module({
  providers: [MailService, WelcomeService],
  exports: [MailService, WelcomeService],
})
export class MailModule {}
