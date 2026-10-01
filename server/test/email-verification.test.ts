import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { AuthController } from '../dist/auth/auth.controller.js';
import { AuthService } from '../dist/auth/auth.service.js';
import { EmailVerificationModule } from '../dist/auth/email-verification/email-verification.module.js';
import { EmailVerificationService } from '../dist/auth/email-verification/email-verification.service.js';
import { PrismaService } from '../dist/infrastructure/database/prisma.service.js';
import { MailService } from '../dist/infrastructure/mail/mail.service.js';
import { RedisService } from '../dist/infrastructure/redis/redis.service.js';
import { OtpController } from '../dist/otp/otp.controller.js';
import { OtpService } from '../dist/otp/otp.service.js';

// In-process HTTP tests: real validation, controllers, services, and JWTs;
// database, Redis, and email delivery are isolated from external services.
const verificationSecret = 'test-only-verification-secret';
const accessSecret = 'test-only-access-secret';
let app: INestApplication;
let databaseReads = 0;
let createdUser: Record<string, any> | undefined;
const records = new Map<string, any>();
const signer = new JwtService({ secret: verificationSecret });
const payload = {
  email: 'customer@example.com',
  purpose: 'EMAIL_VERIFICATION',
  type: 'email_verification',
};

before(async () => {
  const module = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
        load: [
          () => ({
            jwt: { secret: accessSecret },
            emailVerificationToken: {
              secret: verificationSecret,
              expiresIn: '15m',
            },
          }),
        ],
      }),
      JwtModule.register({
        secret: accessSecret,
        signOptions: { expiresIn: '1h' },
      }),
      EmailVerificationModule,
    ],
    controllers: [AuthController, OtpController],
    providers: [
      AuthService,
      OtpService,
      {
        provide: PrismaService,
        useValue: {
          user: {
            findUnique: () => {
              databaseReads++;
              return createdUser;
            },
            create: ({ data }: { data: Record<string, any> }) => {
              createdUser = { ...data, id: 1, createdAt: new Date() };
              return createdUser;
            },
          },
        },
      },
      {
        provide: RedisService,
        useValue: {
          getJSON: (key: string) => records.get(key),
          del: (key: string) => records.delete(key),
          setJSON: (key: string, value: unknown) => records.set(key, value),
          raw: { ttl: () => 300 },
        },
      },
      { provide: MailService, useValue: {} },
    ],
  }).compile();
  app = module.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();
});

after(async () => {
  await app?.close();
});

const register = (token?: string, username = payload.email, extra = {}) =>
  request(app.getHttpServer())
    .post('/api/auth/register')
    .send({
      username,
      password: 'Password123!',
      ...(token === undefined ? {} : { verificationToken: token }),
      ...extra,
    });

test('correct OTP returns a normalized, 15-minute token and consumes the OTP', async () => {
  const key = 'otp:code:EMAIL_VERIFICATION:customer@example.com';
  records.set(key, { code: '123456', attempts: 0, createdAt: Date.now() });
  const response = await request(app.getHttpServer())
    .post('/api/otp/verify')
    .send({
      email: ' Customer@Example.COM ',
      otp: '123456',
      purpose: payload.purpose,
    })
    .expect(200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.verified, true);
  const claims = await signer.verifyAsync(response.body.verificationToken);
  assert.equal(claims.email, payload.email);
  assert.equal(claims.type, payload.type);
  assert.equal(claims.purpose, payload.purpose);
  assert.equal(claims.exp - claims.iat, 900);
  assert.equal(records.has(key), false);
  await request(app.getHttpServer())
    .post('/api/otp/verify')
    .send({ email: payload.email, otp: '123456' })
    .expect(400);
  await assert.rejects(
    new JwtService({ secret: accessSecret }).verifyAsync(
      response.body.verificationToken,
    ),
  );
});

test('invalid OTP and other purposes do not issue registration tokens', async () => {
  records.set('otp:code:LOGIN:customer@example.com', {
    code: '123456',
    attempts: 0,
  });
  const invalid = await request(app.getHttpServer())
    .post('/api/otp/verify')
    .send({ email: payload.email, otp: '654321', purpose: 'LOGIN' })
    .expect(400);
  assert.equal(invalid.body.verificationToken, undefined);
  const valid = await request(app.getHttpServer())
    .post('/api/otp/verify')
    .send({ email: payload.email, otp: '123456', purpose: 'LOGIN' })
    .expect(200);
  assert.equal(valid.body.verificationToken, undefined);
});

test('missing, malformed, tampered, expired, mismatched and wrong-claim tokens are rejected before database access', async () => {
  const valid = await signer.signAsync(payload, { expiresIn: '15m' });
  const tampered = `${valid.slice(0, valid.lastIndexOf('.') + 1)}AAAA`;
  const cases: Array<[string | undefined, string?]> = [
    [undefined],
    [''],
    ['not-a-jwt'],
    [tampered],
    [await signer.signAsync(payload, { expiresIn: -1 })],
    [valid, 'other@example.com'],
    [
      await signer.signAsync(
        { ...payload, type: 'access' },
        { expiresIn: '15m' },
      ),
    ],
    [
      await signer.signAsync(
        { ...payload, purpose: 'PASSWORD_RESET' },
        { expiresIn: '15m' },
      ),
    ],
    [await signer.signAsync(payload)], // Signed but has no expiration.
    [
      await new JwtService({ secret: accessSecret }).signAsync(payload, {
        expiresIn: '15m',
      }),
    ],
  ];
  const readsBefore = databaseReads;
  for (const [token, email] of cases) await register(token, email).expect(400);
  await register(valid, payload.email, { emailVerified: true }).expect(400);
  await register(valid, payload.email, { verified: true }).expect(400);
  assert.equal(databaseReads, readsBefore);
  assert.equal(createdUser, undefined);
});

test('same normalized email registers a CUSTOMER with hashed password; duplicates and login behavior are preserved', async () => {
  const token = await app
    .get(EmailVerificationService)
    .issue(' Customer@Example.COM ');
  const response = await register(token, ' Customer@Example.COM ').expect(201);
  assert.equal(response.body.username, payload.email);
  assert.equal(response.body.role, 'CUSTOMER');
  assert.equal(response.body.mustChangePassword, false);
  assert.equal(response.body.passwordHash, undefined);
  assert.ok(await bcrypt.compare('Password123!', createdUser!.passwordHash));
  await register(token).expect(409);
  const login = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ username: payload.email, password: 'Password123!' })
    .expect(200);
  const claims = await new JwtService({ secret: accessSecret }).verifyAsync(
    login.body.accessToken,
  );
  assert.equal(claims.sub, 1);
  assert.equal(claims.role, 'CUSTOMER');
  assert.equal(claims.exp - claims.iat, 3600);
  await register(login.body.accessToken).expect(400);
});

test('module refuses missing or reused verification secrets', async () => {
  for (const secret of ['', accessSecret]) {
    await assert.rejects(
      Test.createTestingModule({ imports: [EmailVerificationModule] })
        .useMocker((token) =>
          token === ConfigService
            ? new ConfigService({
                jwt: { secret: accessSecret },
                emailVerificationToken: { secret, expiresIn: '15m' },
              })
            : undefined,
        )
        .compile(),
      /EMAIL_VERIFICATION_TOKEN_SECRET/,
    );
  }
});
