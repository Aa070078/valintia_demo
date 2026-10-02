import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { PrismaModule } from '../../infrastructure/database/prisma.module.js';
import { PasswordResetTokenService } from './password-reset-token.service.js';

/** Dedicated signing configuration; reset proofs cannot become access or registration JWTs. */
@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('passwordResetToken.secret');
        if (!secret?.trim()) {
          throw new Error('PASSWORD_RESET_TOKEN_SECRET is missing or empty');
        }
        if (
          [
            config.get<string>('jwt.secret'),
            config.get<string>('jwt.accessSecret'),
            config.get<string>('emailVerificationToken.secret'),
          ].includes(secret)
        ) {
          throw new Error(
            'PASSWORD_RESET_TOKEN_SECRET must differ from access and email verification secrets',
          );
        }
        return {
          secret,
          signOptions: {
            algorithm: 'HS256' as const,
            expiresIn: config.getOrThrow<JwtSignOptions['expiresIn']>(
              'passwordResetToken.expiresIn',
            ),
          },
          verifyOptions: { algorithms: ['HS256' as const] },
        };
      },
    }),
  ],
  providers: [PasswordResetTokenService],
  exports: [PasswordResetTokenService],
})
export class PasswordResetTokenModule {}
