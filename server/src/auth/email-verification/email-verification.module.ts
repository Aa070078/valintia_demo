import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { EmailVerificationService } from './email-verification.service.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('emailVerificationToken.secret');
        if (!secret?.trim()) {
          throw new Error(
            'EMAIL_VERIFICATION_TOKEN_SECRET is missing or empty',
          );
        }
        if (
          [
            config.get<string>('jwt.secret'),
            config.get<string>('jwt.accessSecret'),
          ].includes(secret)
        ) {
          throw new Error(
            'EMAIL_VERIFICATION_TOKEN_SECRET must differ from the access JWT secret',
          );
        }
        return {
          secret,
          signOptions: {
            algorithm: 'HS256' as const,
            expiresIn: config.getOrThrow<JwtSignOptions['expiresIn']>(
              'emailVerificationToken.expiresIn',
            ),
          },
          verifyOptions: { algorithms: ['HS256' as const] },
        };
      },
    }),
  ],
  providers: [EmailVerificationService],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
