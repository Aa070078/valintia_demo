import { registerAs } from '@nestjs/config';
import { resolve } from 'node:path';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '5000', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api',
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  version: process.env.APP_VERSION ?? '0.0.1',
}));

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL ?? '',
}));

export const provisioningConfig = registerAs('provisioning', () => {
  const ttlHours = Number(process.env.INTERNAL_PROVISIONING_TTL_HOURS ?? '48');
  if (!Number.isInteger(ttlHours) || ttlHours < 24 || ttlHours > 72) {
    throw new Error(
      'INTERNAL_PROVISIONING_TTL_HOURS must be an integer between 24 and 72',
    );
  }
  return { ttlHours };
});

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD ?? '',
  ttlDefault: parseInt(process.env.REDIS_TTL_DEFAULT ?? '3600', 10),
}));

// Access JWTs represent login identity (sub/role); email proofs use separate config.
export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET ?? process.env.JWT_ACCESS_SECRET ?? '',
  accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
}));

// Short-lived registration proof settings, loaded through ConfigService.
// SECRET is private signing material, never a token or frontend response field.
// EXPIRES_IN is a duration (15m by default); JwtService derives iat/exp timestamps.
export const emailVerificationTokenConfig = registerAs(
  'emailVerificationToken',
  () => ({
    secret: process.env.EMAIL_VERIFICATION_TOKEN_SECRET ?? '',
    expiresIn: process.env.EMAIL_VERIFICATION_TOKEN_EXPIRES_IN ?? '15m',
  }),
);

// Reset proof has its own cryptographic purpose, separate from registration/login.
export const passwordResetTokenConfig = registerAs(
  'passwordResetToken',
  () => ({
    secret: process.env.PASSWORD_RESET_TOKEN_SECRET ?? '',
    expiresIn: process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN ?? '15m',
  }),
);

export const throttleConfig = registerAs('throttle', () => ({
  defaultTtlMs: parseInt(process.env.THROTTLE_DEFAULT_TTL_MS ?? '60000', 10),
  defaultLimit: parseInt(process.env.THROTTLE_DEFAULT_LIMIT ?? '120', 10),
  ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
  loginLimit: parseInt(process.env.THROTTLE_LOGIN_LIMIT ?? '10', 10),
  registerLimit: parseInt(process.env.THROTTLE_REGISTER_LIMIT ?? '5', 10),
}));

export const r2Config = registerAs('r2', () => ({
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT ?? '',
  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? '',
  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? '',
  bucket: process.env.CLOUDFLARE_R2_BUCKET ?? '',
  publicBaseUrl: process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL ?? '',
}));

// Independent Redis lifetimes: 300s challenge validity vs 60s resend blocking.
// maxAttempts bounds guessing; neither retrying nor cooldown extends OTP validity.
export const otpConfig = registerAs('otp', () => ({
  ttlSeconds: parseInt(process.env.OTP_TTL_SECONDS ?? '300', 10),
  cooldownSeconds: parseInt(process.env.OTP_COOLDOWN_SECONDS ?? '60', 10),
  maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS ?? '5', 10),
}));

export const mailConfig = registerAs('mail', () => ({
  from: process.env.SMTP_FROM,
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    secure: process.env.SMTP_SECURE,
  },
}));

export const welcomeConfig = registerAs('welcome', () => ({
  enabled: process.env.WELCOME_EMAIL_ENABLED ?? 'false',
  frontendLoginUrl: process.env.WELCOME_FRONTEND_LOGIN_URL,
  logoPath:
    process.env.WELCOME_LOGO_PATH ??
    resolve(__dirname, '../../assets/brand/valentia-logo.png'),
}));

/** Used for HTTP Basic Auth on /docs (+ OpenAPI YAML) when NODE_ENV=production. */
export const swaggerConfig = registerAs('swagger', () => ({
  user: process.env.SWAGGER_USER ?? 'admin',
  password: process.env.SWAGGER_PASSWORD ?? 'change-me',
}));
