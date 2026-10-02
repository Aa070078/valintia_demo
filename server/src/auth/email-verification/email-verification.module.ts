import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { EmailVerificationService } from './email-verification.service.js';

/**
 * Configures (does not sign) the dedicated JwtService used by the shared proof
 * service. Exporting only EmailVerificationService keeps OTP and registration
 * consumers separate from AuthModule's access-JWT configuration.
 */
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
          // Separate cryptographic purposes reduce access/proof token confusion.
          throw new Error(
            'EMAIL_VERIFICATION_TOKEN_SECRET must differ from the access JWT secret',
          );
        }
        return {
          // Server-side signing/verification secret, NOT the verificationToken.
          secret,
          signOptions: {
            algorithm: 'HS256' as const,
            // A duration such as 15m produces exp = issuance time + 15 minutes
            // (a Unix timestamp in seconds), not an exp claim of 15.
            expiresIn: config.getOrThrow<JwtSignOptions['expiresIn']>(
              'emailVerificationToken.expiresIn',
            ),
          },
          // Accept only the signing algorithm used for these email proofs.
          verifyOptions: { algorithms: ['HS256' as const] },
        };
      },
    }),
  ],
  providers: [EmailVerificationService],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
