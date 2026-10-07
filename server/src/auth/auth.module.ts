import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule } from '../infrastructure/database/prisma.module.js';
import { OtpModule } from '../otp/otp.module.js';
import { PasswordResetTokenModule } from './password-reset/password-reset-token.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { EmailVerificationModule } from './email-verification/email-verification.module.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { OnboardingService } from './onboarding.service.js';
import { TemporaryLoginLimiter } from './temporary-login-limiter.service.js';
import { RedisModule } from '../infrastructure/redis/redis.module.js';
import { MailModule } from '../infrastructure/mail/mail.module.js';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    RedisModule,
    EmailVerificationModule,
    OtpModule,
    PasswordResetTokenModule,
    // Login/access JwtService: user identity and role, normal JWT secret, 1h expiry.
    // EmailVerificationModule privately configures its own JwtService for proofs.
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret =
          configService.get<string>('jwt.secret') ||
          configService.get<string>('JWT_SECRET');
        if (!secret || secret.trim().length === 0) {
          throw new Error(
            'JWT_SECRET environment variable is missing or empty',
          );
        }
        return {
          secret,
          signOptions: {
            expiresIn: '1h',
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    OnboardingService,
    TemporaryLoginLimiter,
  ],
  exports: [AuthService, JwtModule, JwtAuthGuard],
})
export class AuthModule {}
