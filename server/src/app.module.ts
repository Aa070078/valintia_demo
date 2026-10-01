import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { HealthModule } from './health/health.module.js';
import { AppConfigModule } from './infrastructure/config/config.module.js';
import { PrismaModule } from './infrastructure/database/prisma.module.js';
import { MailModule } from './infrastructure/mail/mail.module.js';
import { RedisModule } from './infrastructure/redis/redis.module.js';
import { OtpModule } from './otp/otp.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    RedisModule,
    MailModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    OtpModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
