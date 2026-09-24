import { registerAs } from '@nestjs/config';

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

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD ?? '',
  ttlDefault: parseInt(process.env.REDIS_TTL_DEFAULT ?? '3600', 10),
}));

export const jwtConfig = registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
}));

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

/** Used for HTTP Basic Auth on /docs (+ OpenAPI YAML) when NODE_ENV=production. */
export const swaggerConfig = registerAs('swagger', () => ({
  user: process.env.SWAGGER_USER ?? 'admin',
  password: process.env.SWAGGER_PASSWORD ?? 'change-me',
}));
