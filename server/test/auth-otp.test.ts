import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { AuthModule } from '../dist/auth/auth.module.js';
import { PrismaService } from '../dist/infrastructure/database/prisma.service.js';
import { RedisService } from '../dist/infrastructure/redis/redis.service.js';
import { MailService } from '../dist/infrastructure/mail/mail.service.js';
import { PasswordResetTokenService } from '../dist/auth/password-reset/password-reset-token.service.js';
import { PasswordResetTokenModule } from '../dist/auth/password-reset/password-reset-token.module.js';

// Exercise compiled controllers/DTO metadata, real module wiring, bcrypt and JWTs.
// External adapters are deterministic; no real inbox, database or Redis is touched.
const email = 'customer@example.com';
const accessSecret = 'test-only-access-secret';
const verificationSecret = 'test-only-email-proof-secret';
const resetSecret = 'test-only-reset-proof-secret';
let app: INestApplication;
let databaseReads = 0;
let failMail = false;
let databaseGate: Promise<void> | undefined;
let mailGate: Promise<void> | undefined;
const users = new Map<number, any>();
const store = new Map<string, { value: string; deadline: number }>();
const messages: Array<{ email: string; code: string; purpose: string }> = [];
const live = (key: string) => {
  const record = store.get(key);
  if (record && record.deadline <= Date.now()) {
    store.delete(key);
    return undefined;
  }
  return record;
};
const redis = {
  setIfAbsent: async (key: string, value: string, ttl: number) => {
    if (live(key)) return false;
    store.set(key, { value, deadline: Date.now() + ttl * 1000 });
    return true;
  },
  exists: async (key: string) => !!live(key),
  getJSON: async (key: string) => {
    const record = live(key);
    return record ? JSON.parse(record.value) : null;
  },
  setJSON: async (key: string, value: unknown, ttl: number) => {
    store.set(key, {
      value: JSON.stringify(value),
      deadline: Date.now() + ttl * 1000,
    });
  },
  set: async (key: string, value: string, ttl: number) => {
    store.set(key, { value, deadline: Date.now() + ttl * 1000 });
    return 'OK';
  },
  del: async (key: string) => Number(store.delete(key)),
  compareAndSwapJSON: async (
    key: string,
    expected: unknown,
    replacement?: unknown,
  ) => {
    const record = live(key);
    if (!record || record.value !== JSON.stringify(expected)) return false;
    if (replacement === undefined) store.delete(key);
    else store.set(key, { ...record, value: JSON.stringify(replacement) });
    return true;
  },
  raw: {
    ttl: async (key: string) => {
      const record = live(key);
      return record ? Math.ceil((record.deadline - Date.now()) / 1000) : -2;
    },
  },
};
const prisma = {
  user: {
    findUnique: async ({ where }: any) => {
      if (databaseGate) await databaseGate;
      databaseReads++;
      const user = where.id
        ? users.get(where.id)
        : [...users.values()].find((user) => user.username === where.username);
      return user ? { ...user } : null;
    },
    create: async ({ data }: any) => {
      const user = { ...data, id: users.size + 1, createdAt: new Date() };
      users.set(user.id, user);
      return { ...user };
    },
    updateMany: async ({ where, data }: any) => {
      const user = users.get(where.id);
      if (
        !user ||
        user.username !== where.username ||
        user.passwordHash !== where.passwordHash
      )
        return { count: 0 };
      users.set(user.id, { ...user, ...data });
      return { count: 1 };
    },
    update: async ({ where, data }: any) => {
      const user = { ...users.get(where.id), ...data };
      users.set(where.id, user);
      return { ...user };
    },
  },
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
            passwordResetToken: { secret: resetSecret, expiresIn: '15m' },
            otp: { ttlSeconds: 300, cooldownSeconds: 60, maxAttempts: 5 },
          }),
        ],
      }),
      AuthModule,
    ],
  })
    .overrideProvider(PrismaService)
    .useValue(prisma)
    .overrideProvider(RedisService)
    .useValue(redis)
    .overrideProvider(MailService)
    .useValue({
      sendOtpEmail: async (email: string, code: string, purpose: string) => {
        if (mailGate) await mailGate;
        if (failMail) throw new Error('Simulated delivery failure');
        messages.push({ email, code, purpose });
      },
    })
    .compile();
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
beforeEach(async () => {
  users.clear();
  store.clear();
  messages.length = 0;
  databaseReads = 0;
  failMail = false;
  databaseGate = undefined;
  mailGate = undefined;
  users.set(1, {
    id: 1,
    username: email,
    passwordHash: await bcrypt.hash('Password123!', 10),
    role: 'CUSTOMER',
    mustChangePassword: false,
  });
  users.set(2, {
    id: 2,
    username: 'other@example.com',
    passwordHash: await bcrypt.hash('OtherPassword!', 10),
    role: 'ENGINEER',
    mustChangePassword: true,
  });
});
after(async () => {
  await app?.close();
});
const post = (path: string, body: object) =>
  request(app.getHttpServer()).post(`/api/${path}`).send(body);
const otpKey = (purpose: string, address = email) =>
  `otp:code:${purpose}:${address}`;
const verify = (purpose: string, code: string, address = email) =>
  post('otp/verify', { email: address, otp: code, purpose });
const reset = (passwordResetToken: string, newPassword = 'ChangedPassword!') =>
  post('auth/reset-password', { passwordResetToken, newPassword });
const register = (verificationToken: string, username = 'new@example.com') =>
  post('auth/register', {
    username,
    password: 'Password123!',
    verificationToken,
  });
const requestReset = () => post('auth/forgot-password', { email });
const getResetProof = async () => {
  await requestReset().expect(200);
  const response = await verify('PASSWORD_RESET', messages.at(-1)!.code).expect(
    200,
  );
  return response.body.passwordResetToken as string;
};

test('email verification retains registration bridge, normalization, 15m expiry and single-use OTP', async () => {
  await post('otp/send', {
    email: ' New@Example.COM ',
    purpose: 'EMAIL_VERIFICATION',
  }).expect(200);
  const code = messages.at(-1)!.code;
  const response = await verify(
    'EMAIL_VERIFICATION',
    code,
    ' New@Example.COM ',
  ).expect(200);
  assert.equal(response.body.passwordResetToken, undefined);
  const claims = await new JwtService({
    secret: verificationSecret,
  }).verifyAsync(response.body.verificationToken);
  assert.equal(claims.email, 'new@example.com');
  assert.equal(claims.type, 'email_verification');
  assert.equal(claims.exp - claims.iat, 900);
  await verify('EMAIL_VERIFICATION', code, 'new@example.com').expect(400);
  await reset(response.body.verificationToken).expect(400);
  await register(
    response.body.verificationToken,
    'OTHER-new@example.com',
  ).expect(400);
  const created = await register(
    response.body.verificationToken,
    ' New@Example.COM ',
  ).expect(201);
  assert.equal(created.body.username, 'new@example.com');
  assert.equal(created.body.role, 'CUSTOMER');
  assert.equal(created.body.passwordHash, undefined);
  await register(response.body.verificationToken).expect(409);
  await post('auth/register', {
    username: 'new@example.com',
    password: 'Password123!',
  }).expect(400);
});

test('forgot-password hides existing/unknown accounts, cooldown and mail failures', async () => {
  const known = await requestReset().expect(200);
  const unknown = await post('auth/forgot-password', {
    email: 'unknown@example.com',
  }).expect(200);
  const cooldown = await requestReset().expect(200);
  assert.deepEqual(known.body, unknown.body);
  assert.deepEqual(known.body, cooldown.body);
  assert.equal(messages.length, 1);
  assert.equal(
    await redis.exists(otpKey('PASSWORD_RESET', 'unknown@example.com')),
    false,
  );
  failMail = true;
  const failed = await post('auth/forgot-password', {
    email: 'other@example.com',
  }).expect(200);
  assert.deepEqual(failed.body, known.body);
  await post('auth/forgot-password', {
    email,
    purpose: 'EMAIL_VERIFICATION',
  }).expect(400);
  await post('otp/send', { email, purpose: 'PASSWORD_RESET' }).expect(400);
});

test('account OTP requests return without awaiting account lookup or mail delivery', async () => {
  let releaseDatabase!: () => void;
  let releaseMail!: () => void;
  databaseGate = new Promise<void>((resolve) => {
    releaseDatabase = resolve;
  });
  mailGate = new Promise<void>((resolve) => {
    releaseMail = resolve;
  });
  try {
    const known = await requestReset().timeout({ deadline: 2000 }).expect(200);
    const unknown = await post('auth/forgot-password', {
      email: 'unknown@example.com',
    })
      .timeout({ deadline: 2000 })
      .expect(200);
    assert.deepEqual(known.body, unknown.body);
    assert.equal(messages.length, 0);
    releaseDatabase();
    databaseGate = undefined;
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.ok(live(otpKey('PASSWORD_RESET'))); // Delivery remains suspended.
    const login = await post('auth/login/otp/request', { email })
      .timeout({ deadline: 2000 })
      .expect(200);
    assert.deepEqual(login.body, known.body);
    assert.equal(messages.length, 0);
  } finally {
    releaseDatabase();
    releaseMail();
    databaseGate = undefined;
    mailGate = undefined;
    await new Promise<void>((resolve) => setImmediate(resolve));
  }
  assert.equal(messages.length, 2);
});

test('reset-token module rejects missing and shared signing secrets', async () => {
  for (const secret of ['', accessSecret, verificationSecret]) {
    await assert.rejects(
      Test.createTestingModule({ imports: [PasswordResetTokenModule] })
        .overrideProvider(PrismaService)
        .useValue(prisma)
        .useMocker((token) =>
          token === ConfigService
            ? new ConfigService({
                jwt: { secret: accessSecret },
                emailVerificationToken: { secret: verificationSecret },
                passwordResetToken: { secret, expiresIn: '15m' },
              })
            : undefined,
        )
        .compile(),
      /PASSWORD_RESET_TOKEN_SECRET/,
    );
  }
});

test('PASSWORD_RESET OTP produces only reset proof; wrong/expired/mismatched-purpose OTPs fail', async () => {
  await requestReset().expect(200);
  const code = messages.at(-1)!.code;
  const wrong = code === '100000' ? '100001' : '100000';
  await verify('PASSWORD_RESET', wrong).expect(400);
  await verify('EMAIL_VERIFICATION', code).expect(400);
  const response = await verify('PASSWORD_RESET', code).expect(200);
  assert.equal(response.body.verificationToken, undefined);
  const claims = await new JwtService({ secret: resetSecret }).verifyAsync(
    response.body.passwordResetToken,
  );
  assert.equal(claims.type, 'password_reset');
  assert.equal(claims.purpose, 'PASSWORD_RESET');
  assert.equal(claims.email, email);
  assert.equal(claims.sub, 1);
  assert.equal(claims.exp - claims.iat, 900);
  assert.equal(claims.passwordHash, undefined);
  await verify('PASSWORD_RESET', code).expect(400);
  await redis.setJSON(otpKey('PASSWORD_RESET'), { code, attempts: 0 }, -1);
  await verify('PASSWORD_RESET', code).expect(400);
});

test('reset changes password, rejects replay and cannot register or authenticate; stateless sessions persist', async () => {
  const login = await post('auth/login', {
    username: email,
    password: 'Password123!',
  }).expect(200);
  const token = await getResetProof();
  await register(token, email).expect(400);
  await request(app.getHttpServer())
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${token}`)
    .expect(401);
  await reset(token).expect(200);
  assert.ok(
    await bcrypt.compare('ChangedPassword!', users.get(1).passwordHash),
  );
  assert.equal(users.get(1).mustChangePassword, false);
  await reset(token, 'AnotherPassword!').expect(400);
  await post('auth/login', {
    username: email,
    password: 'Password123!',
  }).expect(401);
  await post('auth/login', {
    username: email,
    password: 'ChangedPassword!',
  }).expect(200);
  await request(app.getHttpServer())
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${login.body.accessToken}`)
    .expect(200);
});

test('reset rejects invalid signatures, expired/missing claims, wrong purpose/type, user/email mismatch and tampering', async () => {
  const signer = new JwtService({ secret: resetSecret });
  const claims = {
    sub: 1,
    email,
    type: 'password_reset',
    purpose: 'PASSWORD_RESET',
    passwordVersion: app
      .get(PasswordResetTokenService)
      .passwordVersion(users.get(1).passwordHash),
  };
  const tokens = [
    'not-a-token',
    await signer.signAsync(claims, { expiresIn: -1 }),
    await signer.signAsync(claims),
    await signer.signAsync(
      { ...claims, email: 'other@example.com' },
      { expiresIn: '15m' },
    ),
    await signer.signAsync({ ...claims, sub: 2 }, { expiresIn: '15m' }),
    await signer.signAsync(
      { ...claims, type: 'email_verification' },
      { expiresIn: '15m' },
    ),
    await signer.signAsync(
      { ...claims, purpose: 'LOGIN' },
      { expiresIn: '15m' },
    ),
    await signer.signAsync({ ...claims, sub: 999 }, { expiresIn: '15m' }),
    await new JwtService({ secret: verificationSecret }).signAsync(claims, {
      expiresIn: '15m',
    }),
    await new JwtService({ secret: accessSecret }).signAsync(claims, {
      expiresIn: '15m',
    }),
  ];
  const valid = await signer.signAsync(claims, { expiresIn: '15m' });
  tokens.push(`${valid.slice(0, valid.lastIndexOf('.') + 1)}AAAA`);
  const hash = users.get(1).passwordHash;
  for (const token of tokens) await reset(token).expect(400);
  assert.equal(users.get(1).passwordHash, hash);
  await post('auth/reset-password', { newPassword: 'ChangedPassword!' }).expect(
    400,
  );
  await reset(valid, 'short').expect(400);
  await post('auth/reset-password', {
    passwordResetToken: valid,
    newPassword: 'ChangedPassword!',
    email: 'other@example.com',
  }).expect(400);
});

test('parallel reset consumers allow one password update only', async () => {
  const token = await getResetProof();
  const responses = await Promise.all([
    reset(token, 'PasswordOne!'),
    reset(token, 'PasswordTwo!'),
  ]);
  assert.deepEqual(
    responses.map((response) => response.status).sort(),
    [200, 400],
  );
});

test('LOGIN OTP authenticates with existing access JWT and preserves password login', async () => {
  const normal = await post('auth/login', {
    username: email,
    password: 'Password123!',
  }).expect(200);
  const known = await post('auth/login/otp/request', {
    email: ' Customer@Example.COM ',
  }).expect(200);
  const unknown = await post('auth/login/otp/request', {
    email: 'unknown@example.com',
  }).expect(200);
  const cooldown = await post('auth/login/otp/request', { email }).expect(200);
  assert.deepEqual(known.body, unknown.body);
  assert.deepEqual(known.body, cooldown.body);
  assert.equal(messages.length, 1);
  const code = messages.at(-1)!.code;
  await verify('LOGIN', code).expect(400); // Wrong route must not consume LOGIN.
  assert.ok(live(otpKey('LOGIN')));
  const loggedIn = await post('auth/login/otp/verify', {
    email,
    otp: code,
  }).expect(200);
  assert.deepEqual(loggedIn.body.user, normal.body.user);
  assert.equal(loggedIn.body.verificationToken, undefined);
  assert.equal(loggedIn.body.passwordResetToken, undefined);
  const signer = new JwtService({ secret: accessSecret });
  const claims = await signer.verifyAsync(loggedIn.body.accessToken);
  assert.deepEqual(Object.keys(claims).sort(), ['exp', 'iat', 'role', 'sub']);
  assert.equal(claims.sub, 1);
  assert.equal(claims.role, 'CUSTOMER');
  assert.equal(claims.exp - claims.iat, 3600);
  await register(loggedIn.body.accessToken, email).expect(400);
  await reset(loggedIn.body.accessToken).expect(400);
  await request(app.getHttpServer())
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${loggedIn.body.accessToken}`)
    .expect(200);
  await post('auth/login/otp/verify', { email, otp: code }).expect(401);
});

test('LOGIN rejects wrong, expired, wrong-purpose and unknown-account codes without granting other proofs', async () => {
  await post('auth/login/otp/request', { email }).expect(200);
  const code = messages.at(-1)!.code;
  const wrong = code === '100000' ? '100001' : '100000';
  const bad = await post('auth/login/otp/verify', { email, otp: wrong }).expect(
    401,
  );
  const absent = await post('auth/login/otp/verify', {
    email: 'unknown@example.com',
    otp: wrong,
  }).expect(401);
  assert.deepEqual(bad.body, absent.body);
  await verify('EMAIL_VERIFICATION', code).expect(400);
  await verify('PASSWORD_RESET', code).expect(400);
  await post('auth/login/otp/verify', {
    email,
    otp: code,
    purpose: 'EMAIL_VERIFICATION',
  }).expect(400);
  await redis.setJSON(otpKey('LOGIN'), { code, attempts: 0 }, -1);
  await post('auth/login/otp/verify', { email, otp: code }).expect(401);
  await post('otp/send', { email }).expect(200);
  await post('auth/login/otp/verify', {
    email,
    otp: messages.at(-1)!.code,
  }).expect(401);
  failMail = true;
  const failed = await post('auth/login/otp/request', {
    email: 'other@example.com',
  }).expect(200);
  assert.deepEqual(
    failed.body,
    (
      await post('auth/login/otp/request', {
        email: 'unknown@example.com',
      }).expect(200)
    ).body,
  );
  await post('otp/send', { email, purpose: 'LOGIN' }).expect(400);
});

test('LOGIN preserves staff role and mustChangePassword flag', async () => {
  await post('auth/login/otp/request', { email: 'other@example.com' }).expect(
    200,
  );
  const response = await post('auth/login/otp/verify', {
    email: 'other@example.com',
    otp: messages.at(-1)!.code,
  }).expect(200);
  assert.equal(response.body.user.role, 'ENGINEER');
  assert.equal(response.body.user.mustChangePassword, true);
});

test('concurrent successful OTP submissions authenticate once; concurrent guesses consume the attempt budget', async () => {
  await post('auth/login/otp/request', { email }).expect(200);
  const code = messages.at(-1)!.code;
  const responses = await Promise.all([
    post('auth/login/otp/verify', { email, otp: code }),
    post('auth/login/otp/verify', { email, otp: code }),
  ]);
  assert.deepEqual(
    responses.map((response) => response.status).sort(),
    [200, 401],
  );
  await redis.setJSON(
    otpKey('LOGIN'),
    { code, attempts: 0, createdAt: Date.now() },
    300,
  );
  const wrong = code === '100000' ? '100001' : '100000';
  const guesses = await Promise.all(
    Array.from({ length: 6 }, () =>
      post('auth/login/otp/verify', { email, otp: wrong }),
    ),
  );
  assert.ok(guesses.every((response) => response.status === 401));
  assert.equal(live(otpKey('LOGIN')), undefined);
});

test('GENERAL is no longer accepted', async () => {
  await post('otp/send', { email, purpose: 'GENERAL' }).expect(400);
  await verify('GENERAL', '123456').expect(400);
});

test('concurrent OTP requests reserve one cooldown and send one challenge', async () => {
  const responses = await Promise.all([
    post('otp/send', { email }),
    post('otp/send', { email }),
  ]);
  assert.deepEqual(
    responses.map((response) => response.status).sort(),
    [200, 429],
  );
  assert.equal(messages.length, 1);
  assert.equal(
    JSON.parse(live(otpKey('EMAIL_VERIFICATION'))!.value).code,
    messages[0].code,
  );
});

test('OTP cooldown preserves existing challenge and failed attempts preserve TTL; current sixth-request invalidation is explicit', async () => {
  await post('otp/send', { email }).expect(200);
  const first = live(otpKey('EMAIL_VERIFICATION'))!;
  await post('otp/send', { email }).expect(429);
  assert.equal(live(otpKey('EMAIL_VERIFICATION'))!.value, first.value);
  const code = messages.at(-1)!.code;
  const wrong = code === '100000' ? '100001' : '100000';
  for (let attempt = 1; attempt <= 5; attempt++) {
    await verify('EMAIL_VERIFICATION', wrong).expect(400);
    assert.equal(
      JSON.parse(live(otpKey('EMAIL_VERIFICATION'))!.value).attempts,
      attempt,
    );
  }
  assert.ok(
    live(otpKey('EMAIL_VERIFICATION'))!.deadline <= first.deadline + 1000,
  );
  // At maxAttempts=5 the sixth request revokes the record, even with the correct code.
  await verify('EMAIL_VERIFICATION', code).expect(400);
  assert.equal(live(otpKey('EMAIL_VERIFICATION')), undefined);
});
