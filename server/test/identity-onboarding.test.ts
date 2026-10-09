import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { after, before, beforeEach, test } from 'node:test';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { PrismaClient, Role } from '../dist/generated/prisma/client.js';
import { PrismaService } from '../dist/infrastructure/database/prisma.service.js';
import { RedisService } from '../dist/infrastructure/redis/redis.service.js';
import { MailService } from '../dist/infrastructure/mail/mail.service.js';
import { UsersModule } from '../dist/users/users.module.js';
import { ProjectsModule } from '../dist/projects/projects.module.js';
import { TemporaryLoginLimiter } from '../dist/auth/temporary-login-limiter.service.js';

// Actual PostgreSQL migrations/constraints/transactions and Nest HTTP/JWT/bcrypt.
// Redis/mail are deterministic adapters; no normal schema or real inbox is touched.
const schema = `identity_test_${randomUUID().replaceAll('-', '')}`;
const migration = '20261004120000_user_email_identity';
const secret = 'test-only-identity-access-secret';
const jwt = new JwtService({ secret });
const store = new Map<string, { value: string; deadline: number }>();
const messages: Array<{ email: string; code: string }> = [];
const live = (key: string) => {
  const value = store.get(key);
  if (value && value.deadline <= Date.now()) {
    store.delete(key);
    return undefined;
  }
  return value;
};
const redis = {
  setIfAbsent: async (key: string, value: string, ttl: number) => {
    if (live(key)) return false;
    store.set(key, { value, deadline: Date.now() + ttl * 1000 });
    return true;
  },
  getJSON: async (key: string) => {
    const v = live(key);
    return v ? JSON.parse(v.value) : null;
  },
  setJSON: async (key: string, value: unknown, ttl: number) => {
    store.set(key, {
      value: JSON.stringify(value),
      deadline: Date.now() + ttl * 1000,
    });
  },
  compareAndSwapJSON: async (
    key: string,
    expected: unknown,
    replacement?: unknown,
  ) => {
    const v = live(key);
    if (!v || v.value !== JSON.stringify(expected)) return false;
    if (replacement === undefined) store.delete(key);
    else store.set(key, { ...v, value: JSON.stringify(replacement) });
    return true;
  },
  raw: {
    ttl: async (key: string) => {
      const v = live(key);
      return v ? Math.ceil((v.deadline - Date.now()) / 1000) : -2;
    },
  },
};
let pool: Pool;
let prisma: PrismaClient;
let app: INestApplication;
let schemaCreated = false;
let admin: { id: number; token: string };
let customer: { id: number; token: string };
let activeEngineer: { id: number; token: string };
let migrated: any;
const file = (name: string) =>
  readFileSync(resolve('prisma/migrations', name, 'migration.sql'), 'utf8');

before(async () => {
  assert.ok(
    process.env.DATABASE_URL,
    'DATABASE_URL required for isolated tests',
  );
  assert.match(schema, /^identity_test_[a-f0-9]{32}$/);
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    options: `-c search_path=${schema}`,
    connectionTimeoutMillis: 5000,
  });
  await pool.query(`CREATE SCHEMA "${schema}"`);
  schemaCreated = true;
  for (const name of readdirSync(resolve('prisma/migrations'))
    .filter((n) => /^\d/.test(n) && n < migration)
    .sort())
    await pool.query(file(name));
  const hash = await bcrypt.hash('LegacyPassword123!', 10);
  const oldCustomer = (
    await pool.query(
      'INSERT INTO users (username, "passwordHash", role, "mustChangePassword", "updatedAt") VALUES ($1,$2,\'CUSTOMER\',false,now()) RETURNING id',
      ['OldCustomer@Example.COM', hash],
    )
  ).rows[0];
  const oldEngineer = (
    await pool.query(
      'INSERT INTO users (username, "passwordHash", role, "mustChangePassword", "updatedAt") VALUES ($1,$2,\'ENGINEER\',false,now()) RETURNING id',
      ['PlainEngineer', hash],
    )
  ).rows[0];
  const project = (
    await pool.query(
      'INSERT INTO projects (title,status,"clientId","updatedAt") VALUES (\'Legacy\',\'SUBMITTED\',$1,now()) RETURNING id',
      [oldCustomer.id],
    )
  ).rows[0];
  await pool.query(
    'INSERT INTO project_assignments ("projectId","engineerId","updatedAt") VALUES ($1,$2,now())',
    [project.id, oldEngineer.id],
  );
  await pool.query(file(migration));
  migrated = {
    customer: (
      await pool.query('SELECT * FROM users WHERE id=$1', [oldCustomer.id])
    ).rows[0],
    engineer: (
      await pool.query('SELECT * FROM users WHERE id=$1', [oldEngineer.id])
    ).rows[0],
    assignment: (
      await pool.query(
        'SELECT * FROM project_assignments WHERE "projectId"=$1',
        [project.id],
      )
    ).rows[0],
    hash,
  };
  prisma = new PrismaClient({ adapter: new PrismaPg(pool, { schema }) });
  const module = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
        load: [
          () => ({
            jwt: { secret },
            emailVerificationToken: {
              secret: 'test-only-identity-email-secret',
              expiresIn: '15m',
            },
            passwordResetToken: {
              secret: 'test-only-identity-reset-secret',
              expiresIn: '15m',
            },
            provisioning: { ttlHours: 48 },
            otp: { ttlSeconds: 300, cooldownSeconds: 60, maxAttempts: 5 },
          }),
        ],
      }),
      UsersModule,
      ProjectsModule,
    ],
  })
    .overrideProvider(PrismaService)
    .useValue(prisma)
    .overrideProvider(RedisService)
    .useValue(redis)
    .overrideProvider(MailService)
    .useValue({
      sendOtpEmail: async (email: string, code: string) => {
        messages.push({ email, code });
      },
    })
    .compile();
  app = module.createNestApplication();
  app.useLogger(false);
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
  await prisma.accountProvisioningActivity.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  store.clear();
  messages.length = 0;
  const fixture = async (username: string, role: Role, verified = true) => {
    const user = await prisma.user.create({
      data: {
        username,
        email:
          role === Role.ADMINISTRATOR
            ? 'bootstrap@example.com'
            : username.includes('@')
              ? username
              : null,
        emailVerified: verified,
        passwordHash: await bcrypt.hash('Password123!', 10),
        role,
        mustChangePassword: role === 'ADMINISTRATOR',
      },
    });
    return {
      id: user.id,
      token: await jwt.signAsync({ sub: user.id, role }, { expiresIn: '1h' }),
    };
  };
  admin = await fixture('bootstrap-admin', Role.ADMINISTRATOR);
  customer = await fixture('customer@example.com', Role.CUSTOMER);
  activeEngineer = await fixture('engineer@example.com', Role.ENGINEER);
});

after(async () => {
  try {
    await app?.close();
  } finally {
    try {
      await prisma?.$disconnect();
      if (schemaCreated) {
        assert.match(schema, /^identity_test_[a-f0-9]{32}$/);
        await pool.query(`DROP SCHEMA "${schema}" CASCADE`);
      }
    } finally {
      await pool?.end();
    }
  }
});

const post = (path: string, body: object, token?: string) => {
  const call = request(app.getHttpServer()).post(`/api/${path}`).send(body);
  return token ? call.set('Authorization', `Bearer ${token}`) : call;
};
const me = (token: string) =>
  request(app.getHttpServer())
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${token}`);
const create = (role = 'ENGINEER') =>
  post(
    'users',
    { firstName: 'Abd', lastName: 'Mohamed', birthYear: 1998, role },
    admin.token,
  );
const login = (email: string, password: string) =>
  post('auth/login', { email, password });
const provision = async () => {
  const user = (await create().expect(201)).body;
  const session = (
    await login(user.temporaryLogin, user.temporaryPassword).expect(200)
  ).body;
  return { ...user, token: session.onboardingToken };
};
const requestEmail = (u: any, email = 'abd@example.com') =>
  post('auth/onboarding/email/request', { email }, u.token);
const verifyEmail = (
  u: any,
  email = 'abd@example.com',
  otp = messages.at(-1)!.code,
) => post('auth/onboarding/email/verify', { email, otp }, u.token);
const password = (u: any, newPassword = 'PermanentPassword123!') =>
  post('auth/change-password', { newPassword }, u.token);
const revoke = (u: any, token = admin.token) =>
  post(`users/${u.id}/revoke-temporary-credentials`, {}, token);
const account = (u: any) =>
  prisma.user.findUniqueOrThrow({ where: { id: u.id } });
const waitMessage = async (count: number) => {
  for (let i = 0; messages.length < count && i < 200; i++)
    await new Promise((done) => setTimeout(done, 10));
  assert.equal(messages.length, count);
};

test('migration preserves identities, hashes and assignments without inventing verification evidence', () => {
  assert.equal(migrated.customer.username, 'OldCustomer@Example.COM');
  assert.equal(migrated.customer.email, 'oldcustomer@example.com');
  assert.equal(migrated.customer.emailVerified, false);
  assert.equal(migrated.engineer.email, null);
  assert.equal(migrated.engineer.username, 'PlainEngineer');
  assert.equal(migrated.engineer.passwordHash, migrated.hash);
  assert.equal(migrated.engineer.mustChangePassword, true);
  assert.equal(
    migrated.engineer.temporaryLogin,
    `legacy-${migrated.engineer.id}@internal.local`,
  );
  assert.equal(migrated.assignment.engineerId, migrated.engineer.id);
});

test('admin provisions only profile/role; credentials unique, bcrypt only, no secret response fields', async () => {
  const responses = await Promise.all(
    Array.from({ length: 4 }, () => create().expect(201)),
  );
  assert.deepEqual(responses.map((r) => r.body.username).sort(), [
    'AbdMoh98',
    'AbdMoh98_2',
    'AbdMoh98_3',
    'AbdMoh98_4',
  ]);
  assert.equal(new Set(responses.map((r) => r.body.temporaryLogin)).size, 4);
  for (const { body } of responses) {
    assert.equal(body.passwordHash, undefined);
    assert.equal(body.onboardingVersion, undefined);
    assert.equal(body.emailVerified, false);
    assert.equal(body.mustChangePassword, true);
    assert.match(body.temporaryPassword, /^Tmp!/);
    const saved = await account(body);
    assert.equal(saved.email, null);
    assert.equal(
      await bcrypt.compare(body.temporaryPassword, saved.passwordHash),
      true,
    );
    assert.ok(
      new Date(body.temporaryCredentialsExpiresAt).getTime() >
        Date.now() + 47 * 3600000,
    );
    assert.ok(!JSON.stringify(saved).includes(body.temporaryPassword));
  }
  for (const extra of [
    { username: 'manual' },
    { email: 'real@example.com' },
    { password: 'Secret123!' },
  ]) {
    await post(
      'users',
      {
        firstName: 'Abd',
        lastName: 'Mohamed',
        birthYear: 1998,
        role: 'ENGINEER',
        ...extra,
      },
      admin.token,
    ).expect(400);
  }
  await post('users', { role: 'ENGINEER' }, admin.token).expect(400);
  await create('CUSTOMER').expect(400);
  await create('ADMINISTRATOR').expect(400);
});

test('administrator directory includes incomplete staff, excludes customers and secrets, and enforces access', async () => {
  const pending = (await create().expect(201)).body;
  for (const role of ['PROJECT_MANAGER', 'COMPANY_OWNER'])
    await create(role).expect(201);
  const response = await request(app.getHttpServer())
    .get('/users')
    .set('Authorization', `Bearer ${admin.token}`)
    .expect(200);
  const listed = response.body.find((user: any) => user.id === pending.id);
  assert.equal(listed.email, null);
  assert.equal(listed.emailVerified, false);
  assert.equal(listed.mustChangePassword, true);
  assert.deepEqual(
    Object.keys(listed).sort(),
    [
      'id',
      'username',
      'email',
      'role',
      'emailVerified',
      'mustChangePassword',
      'temporaryCredentialsExpiresAt',
      'createdAt',
    ].sort(),
  );
  assert.ok(
    response.body.every((user: any) =>
      ['ENGINEER', 'PROJECT_MANAGER', 'COMPANY_OWNER'].includes(user.role),
    ),
  );
  for (const token of [customer.token, activeEngineer.token]) {
    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  }
  await request(app.getHttpServer()).get('/users').expect(401);
});

test('non-admin cannot provision or revoke; all internal roles supported', async () => {
  const u = await provision();
  for (const role of ['PROJECT_MANAGER', 'COMPANY_OWNER']) {
    const other = (await create(role).expect(201)).body;
    assert.equal(other.role, role);
  }
  for (const token of [customer.token, activeEngineer.token, u.token]) {
    await post(
      'users',
      {
        firstName: 'Abd',
        lastName: 'Mohamed',
        birthYear: 1998,
        role: 'ENGINEER',
      },
      token,
    ).expect(403);
    await revoke(u, token).expect(403);
  }
  await create().unset('Authorization').expect(401);
});

test('temporary login produces restricted token only and never business access, even with forged legacy claims', async () => {
  const u = await provision();
  const claims = await jwt.verifyAsync(u.token);
  assert.equal(claims.scope, 'onboarding');
  assert.equal(claims.exp - claims.iat, 900);
  assert.equal(claims.sub, u.id);
  assert.equal(claims.role, 'ENGINEER');
  assert.ok(!JSON.stringify(claims).includes('password'));
  await me(u.token).expect(200);
  for (const path of [
    'projects',
    'projects/999/review',
    'projects/999/activity',
  ]) {
    await request(app.getHttpServer())
      .get(`/api/${path}`)
      .set('Authorization', `Bearer ${u.token}`)
      .expect(403);
  }
  await post('projects/999/review/start', {}, u.token).expect(403);
  await login(u.temporaryLogin, 'WrongPassword!').expect(401);
  await login('missing@internal.local', 'WrongPassword!').expect(401);
  const legacy = await jwt.signAsync({
    sub: u.id,
    role: 'ENGINEER',
    iat: Math.floor(Date.now() / 1000) - 10,
  });
  await post('projects/999/review/start', {}, legacy).expect(401);
  const again = (await login(u.temporaryLogin, u.temporaryPassword).expect(200))
    .body;
  assert.equal(again.accessToken, undefined);
  assert.ok(again.onboardingToken);
});

test('temporary credentials expire, rate limiting is atomic, and reissue starts a fresh allowance', async () => {
  const u = await provision();
  await prisma.user.update({
    where: { id: u.id },
    data: { temporaryCredentialsExpiresAt: new Date(Date.now() - 1000) },
  });
  await login(u.temporaryLogin, u.temporaryPassword).expect(401);
  await me(u.token).expect(401);
  store.clear();
  const attempts = await Promise.all(
    Array.from({ length: 8 }, () => login(u.temporaryLogin, 'WrongPassword!')),
  );
  assert.deepEqual(
    attempts.map((r) => r.status).sort(),
    [401, 401, 401, 401, 401, 429, 429, 429],
  );
  const fresh = (await revoke(u).expect(200)).body;
  await login(fresh.temporaryLogin, fresh.temporaryPassword).expect(200);
  const limiter = app.get(TemporaryLoginLimiter);
  const keyRecord = [...store.values()].find(
    (v) => JSON.parse(v.value).attempts === 5,
  )!;
  keyRecord.deadline = Date.now() - 1;
  await limiter.consume(u.temporaryLogin); // Expired throttle window can be reserved again.
});

test('email enrollment validates real destination, duplicate ownership, exact email/account binding and OTP consumption', async () => {
  const u = await provision();
  const other = await provision();
  await requestEmail(u, 'invalid').expect(400);
  await requestEmail(u, u.temporaryLogin).expect(400);
  await requestEmail(u, 'customer@example.com').expect(409);
  await requestEmail(u, ' ABD@Example.COM ').expect(200);
  assert.equal(messages.at(-1)!.email, 'abd@example.com');
  assert.equal((await account(u)).email, null);
  const code = messages.at(-1)!.code;
  await verifyEmail(u, 'different@example.com', code).expect(400);
  await verifyEmail(other, 'abd@example.com', code).expect(400);
  await post('otp/verify', { email: 'abd@example.com', otp: code }).expect(400);
  await verifyEmail(
    u,
    'abd@example.com',
    code === '100000' ? '100001' : '100000',
  ).expect(400);
  await verifyEmail(u, 'abd@example.com', code).expect(200);
  assert.equal((await account(u)).email, 'abd@example.com');
  assert.equal((await account(other)).email, null);
  await verifyEmail(u, 'abd@example.com', code).expect(409);
  await me(u.token).expect(200);
  await post('projects/999/review/start', {}, u.token).expect(403);
});

test('password-first onboarding remains restricted; both steps activate; temporary password/login/token revoked', async () => {
  const u = await provision();
  await password(u, u.temporaryPassword).expect(400);
  await password(u).expect(200);
  assert.equal((await account(u)).mustChangePassword, false);
  await login(u.temporaryLogin, u.temporaryPassword).expect(401);
  await post('projects/999/review/start', {}, u.token).expect(403);
  await requestEmail(u).expect(200);
  const verified = await verifyEmail(u).expect(200);
  assert.equal(verified.body.onboardingComplete, true);
  await me(u.token).expect(401);
  await login(u.temporaryLogin, 'PermanentPassword123!').expect(401);
  const response = await login(
    ' ABD@Example.COM ',
    'PermanentPassword123!',
  ).expect(200);
  assert.equal(response.body.onboardingToken, undefined);
  assert.ok(response.body.accessToken);
  const claims = await jwt.verifyAsync(response.body.accessToken);
  assert.deepEqual(Object.keys(claims).sort(), ['exp', 'iat', 'role', 'sub']);
  assert.equal(claims.sub, u.id);
  await revoke(u).expect(409);
});

test('email-first onboarding does not activate until password replaced; existing Engineer Review assignment still works', async () => {
  const u = await provision();
  const legacyToken = await jwt.signAsync({
    sub: u.id,
    role: 'ENGINEER',
    iat: Math.floor(Date.now() / 1000) - 10,
  });
  const p = await prisma.project.create({
    data: {
      title: 'Onboarding Review',
      status: 'SUBMITTED',
      clientId: customer.id,
      assignment: { create: { engineerId: u.id } },
    },
  });
  await requestEmail(u).expect(200);
  await verifyEmail(u).expect(200);
  const incomplete = await login('abd@example.com', u.temporaryPassword).expect(
    200,
  );
  assert.equal(incomplete.body.accessToken, undefined);
  await password(u).expect(200);
  await me(legacyToken).expect(401);
  const active = (
    await login('abd@example.com', 'PermanentPassword123!').expect(200)
  ).body.accessToken;
  await post(`projects/${p.id}/review/start`, {}, active).expect(200);
  await post(
    `projects/${p.id}/review/ready-for-consultation`,
    {},
    active,
  ).expect(200);
  const context = await request(app.getHttpServer())
    .get(`/api/projects/${p.id}/review`)
    .set('Authorization', `Bearer ${active}`)
    .expect(200);
  assert.equal(context.body.status, 'ENGINEER_READY');
  assert.equal(context.body.assignment.engineerId, u.id);
  assert.equal(context.body.activities.length, 2);
  await request(app.getHttpServer())
    .get(`/api/projects/${p.id}/activity`)
    .set('Authorization', `Bearer ${active}`)
    .expect(200);
});

test('revoke rotates credentials and invalidates sessions/OTP generations without changing identity or business relationships', async () => {
  const u = await provision();
  const original = await account(u);
  const p = await prisma.project.create({
    data: {
      title: 'Assigned',
      status: 'SUBMITTED',
      clientId: customer.id,
      assignment: { create: { engineerId: u.id } },
      activities: {
        create: {
          actorId: customer.id,
          actorRole: 'CUSTOMER',
          action: 'REVIEW_STARTED',
          fromStatus: 'SUBMITTED',
          toStatus: 'UNDER_ENGINEER_REVIEW',
        },
      },
    },
  });
  const relationships = await prisma.project.findUnique({
    where: { id: p.id },
    include: { assignment: true, activities: true },
  });
  await requestEmail(u).expect(200);
  const oldCode = messages.at(-1)!.code;
  const generations = [u];
  for (let i = 0; i < 2; i++) {
    const newest = (await revoke(u).expect(200)).body;
    assert.equal(newest.id, original.id);
    assert.equal(newest.username, original.username);
    assert.equal(newest.role, original.role);
    assert.equal(newest.passwordHash, undefined);
    assert.equal(newest.onboardingVersion, undefined);
    for (const old of generations) {
      await login(old.temporaryLogin, old.temporaryPassword).expect(401);
      await me(old.token).expect(401);
      await requestEmail(old).expect(401);
    }
    const session = (
      await login(newest.temporaryLogin, newest.temporaryPassword).expect(200)
    ).body;
    assert.equal(session.accessToken, undefined);
    newest.token = session.onboardingToken;
    await verifyEmail(newest, 'abd@example.com', oldCode).expect(400);
    await post('projects/999/review/start', {}, newest.token).expect(403);
    assert.ok(
      new Date(newest.temporaryCredentialsExpiresAt).getTime() >
        Date.now() + 47 * 3600000,
    );
    generations.push(newest);
  }
  assert.deepEqual(
    await prisma.project.findUnique({
      where: { id: p.id },
      include: { assignment: true, activities: true },
    }),
    relationships,
  );
  const audit = await prisma.accountProvisioningActivity.findMany({
    where: { userId: u.id },
  });
  assert.equal(audit.length, 2);
  assert.ok(
    audit.every(
      (a) =>
        a.actorId === admin.id && a.action === 'TEMPORARY_CREDENTIALS_REISSUED',
    ),
  );
  for (const g of generations)
    assert.ok(!JSON.stringify(audit).includes(g.temporaryPassword));
});

test('reissue audit failure rolls back credentials, concurrent revocations serialize, active accounts protected', async () => {
  const u = await provision();
  const original = await account(u);
  await pool.query(
    'ALTER TABLE account_provisioning_activities ADD CONSTRAINT test_reject CHECK (false)',
  );
  try {
    await revoke(u).expect(500);
    assert.deepEqual(await account(u), original);
    await me(u.token).expect(200);
  } finally {
    await pool.query(
      'ALTER TABLE account_provisioning_activities DROP CONSTRAINT test_reject',
    );
  }
  const results = await Promise.all([
    revoke(u).expect(200),
    revoke(u).expect(200),
  ]);
  const current = await account(u);
  assert.equal(await prisma.accountProvisioningActivity.count(), 2);
  assert.equal(new Set(results.map((r) => r.body.temporaryLogin)).size, 2);
  for (const { body } of results)
    await login(body.temporaryLogin, body.temporaryPassword).expect(
      body.temporaryLogin === current.temporaryLogin ? 200 : 401,
    );
  await revoke({ id: activeEngineer.id }).expect(409);
  await revoke({ id: customer.id }).expect(409);
  await revoke({ id: admin.id }).expect(409);
  await revoke({ id: 999999 }).expect(404);
});

test('registration remains proof-based; customer/admin login and historical customer email verification stay compatible', async () => {
  await post('otp/send', { email: 'new@example.com' }).expect(200);
  const proof = (
    await post('otp/verify', {
      email: 'new@example.com',
      otp: messages.at(-1)!.code,
    }).expect(200)
  ).body.verificationToken;
  const created = (
    await post('auth/register', {
      username: ' New@Example.COM ',
      password: 'CustomerPassword123!',
      verificationToken: proof,
    }).expect(201)
  ).body;
  assert.equal(created.email, 'new@example.com');
  assert.equal(created.emailVerified, true);
  await login('new@example.com', 'CustomerPassword123!').expect(200);
  await post('auth/register', {
    username: 'new@example.com',
    password: 'CustomerPassword123!',
    verificationToken: proof,
  }).expect(409);
  await post('auth/login', {
    email: 'bootstrap@example.com',
    password: 'Password123!',
  }).expect(200);
  await post('auth/login', {
    email: 'new@example.com',
    username: 'new@example.com',
    password: 'CustomerPassword123!',
  }).expect(400);
  await prisma.user.update({
    where: { id: customer.id },
    data: { emailVerified: false },
  });
  const oldLogin = (
    await login('customer@example.com', 'Password123!').expect(200)
  ).body;
  assert.ok(oldLogin.accessToken);
  assert.equal(oldLogin.user.emailVerified, false);
  await requestEmail(
    { token: oldLogin.accessToken },
    'customer@example.com',
  ).expect(200);
  await verifyEmail(
    { token: oldLogin.accessToken },
    'customer@example.com',
  ).expect(200);
});

test('OTP login and recovery use only verified real emails; generic responses and reset anti-replay remain intact', async () => {
  const u = await provision();
  const unknown = await post('auth/login/otp/request', {
    email: 'unknown@example.com',
  }).expect(200);
  for (const email of [u.temporaryLogin, 'unknown@example.com']) {
    const response = await post('auth/login/otp/request', { email }).expect(
      200,
    );
    assert.deepEqual(response.body, unknown.body);
    await post('auth/forgot-password', { email }).expect(200);
  }
  assert.equal(messages.length, 0);
  await requestEmail(u).expect(200);
  await verifyEmail(u).expect(200);
  await post('auth/login/otp/request', { email: 'abd@example.com' }).expect(
    200,
  );
  await new Promise((done) => setTimeout(done, 30));
  assert.equal(messages.length, 1);
  await password(u).expect(200);
  const requested = await post('auth/login/otp/request', {
    email: 'abd@example.com',
  }).expect(200);
  assert.deepEqual(requested.body, unknown.body);
  await waitMessage(2);
  const active = await post('auth/login/otp/verify', {
    email: 'abd@example.com',
    otp: messages.at(-1)!.code,
  }).expect(200);
  assert.equal(active.body.user.id, u.id);
  assert.equal(active.body.user.role, 'ENGINEER');
  await post('auth/forgot-password', { email: 'abd@example.com' }).expect(200);
  await waitMessage(3);
  const resetToken = (
    await post('otp/verify', {
      email: 'abd@example.com',
      otp: messages.at(-1)!.code,
      purpose: 'PASSWORD_RESET',
    }).expect(200)
  ).body.passwordResetToken;
  await post('auth/reset-password', {
    passwordResetToken: resetToken,
    newPassword: 'RecoveredPassword123!',
  }).expect(200);
  await post('auth/reset-password', {
    passwordResetToken: resetToken,
    newPassword: 'AgainPassword123!',
  }).expect(400);
  await login('abd@example.com', 'RecoveredPassword123!').expect(200);
  await post('otp/send', { email: u.temporaryLogin }).expect(400);
  assert.ok(messages.every((m) => !m.email.endsWith('@internal.local')));
});

test('partial email enrollment cannot bypass temporary-login attempt budget and is discarded by revocation', async () => {
  const u = await provision();
  await requestEmail(u).expect(200);
  await verifyEmail(u).expect(200);
  const attempts = await Promise.all(
    Array.from({ length: 6 }, () => login('abd@example.com', 'WrongPassword!')),
  );
  // Provisioning already used one of the five slots.
  assert.deepEqual(
    attempts.map((r) => r.status).sort(),
    [401, 401, 401, 401, 429, 429],
  );
  const renewed = (await revoke(u).expect(200)).body;
  assert.equal((await account(u)).email, null);
  assert.equal((await account(u)).emailVerified, false);
  await login('abd@example.com', u.temporaryPassword).expect(401);
  const session = (
    await login(renewed.temporaryLogin, renewed.temporaryPassword).expect(200)
  ).body;
  await requestEmail(
    { token: session.onboardingToken },
    'employee@example.com',
  ).expect(200);
});

test('competing account verifications cannot claim the same email; public registration OTP cannot enroll an account', async () => {
  const a = await provision();
  const b = await provision();
  await post('otp/send', { email: 'public@example.com' }).expect(200);
  await verifyEmail(a, 'public@example.com', messages.at(-1)!.code).expect(400);
  await requestEmail(a, 'shared@example.com').expect(200);
  const codeA = messages.at(-1)!.code;
  await requestEmail(b, 'shared@example.com').expect(200);
  const codeB = messages.at(-1)!.code;
  const results = await Promise.all([
    verifyEmail(a, 'shared@example.com', codeA),
    verifyEmail(b, 'shared@example.com', codeB),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
  assert.equal(
    await prisma.user.count({ where: { email: 'shared@example.com' } }),
    1,
  );
});

test('migration preflight uses application email validation, detects collisions and changes no data', async () => {
  const url = new URL(process.env.DATABASE_URL!);
  url.searchParams.set('options', `-c search_path=${schema}`);
  const preflight = () =>
    spawnSync(
      process.execPath,
      ['--import', 'tsx', 'scripts/check-identity-migration.ts'],
      {
        env: { ...process.env, DATABASE_URL: url.toString() },
        encoding: 'utf8',
        timeout: 15000,
      },
    );
  const valid = preflight();
  assert.equal(valid.status, 0, valid.stderr);
  const bad = await prisma.user.create({
    data: {
      username: 'customer@example..com',
      role: 'CUSTOMER',
      passwordHash: 'not-a-credential',
    },
  });
  const collision = await prisma.user.create({
    data: {
      username: 'CUSTOMER@example.com',
      role: 'CUSTOMER',
      passwordHash: 'not-a-credential',
    },
  });
  const before = await prisma.user.count();
  const rejected = preflight();
  assert.equal(rejected.status, 1);
  assert.match(rejected.stderr, /Identity migration blocked/);
  assert.match(rejected.stderr, new RegExp(String(bad.id)));
  assert.match(rejected.stderr, /normalized collision IDs/);
  assert.equal(await prisma.user.count(), before);
  await prisma.user.deleteMany({
    where: { id: { in: [bad.id, collision.id] } },
  });
});

test('database enforces normalized unique real email and Swagger documents complete lifecycle', async () => {
  await assert.rejects(
    prisma.user.create({
      data: {
        username: 'duplicate',
        email: 'customer@example.com',
        role: 'CUSTOMER',
        passwordHash: 'x',
      },
    }),
  );
  await assert.rejects(
    prisma.user.create({
      data: {
        username: 'bad',
        email: 'BAD@example.com',
        role: 'CUSTOMER',
        passwordHash: 'x',
      },
    }),
  );
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().addBearerAuth(undefined, 'access-token').build(),
  );
  for (const path of [
    '/api/auth/onboarding/email/request',
    '/api/auth/onboarding/email/verify',
    '/api/users/{id}/revoke-temporary-credentials',
  ]) {
    assert.ok(document.paths[path]?.post);
    assert.ok(document.paths[path].post?.security);
  }
  const dto = document.components!.schemas!.CreateInternalUserDto as any;
  assert.deepEqual(Object.keys(dto.properties).sort(), [
    'birthYear',
    'firstName',
    'lastName',
    'role',
  ]);
  const loginDto = document.components!.schemas!.LoginDto as any;
  assert.deepEqual(Object.keys(loginDto.properties).sort(), [
    'email',
    'password',
  ]);
  assert.deepEqual(loginDto.required.sort(), ['email', 'password']);
  assert.ok(document.components!.schemas!.OnboardingLoginResponseDto);
});

test('identity rollback preserves IDs/relationships; normalized customer collisions abort migration atomically', async () => {
  const u = await provision();
  const p = await prisma.project.create({
    data: {
      title: 'Rollback',
      clientId: customer.id,
      assignment: { create: { engineerId: u.id } },
    },
  });
  const connection = await pool.connect();
  try {
    await connection.query(
      readFileSync(resolve('prisma/rollback/user-email-identity.sql'), 'utf8'),
    );
    await connection.query(
      'INSERT INTO users (username,"passwordHash",role,"mustChangePassword","updatedAt") VALUES (\'CUSTOMER@example.com\',\'x\',\'CUSTOMER\',false,now())',
    );
    await assert.rejects(connection.query(file(migration)));
    await connection.query('ROLLBACK');
    const column = await connection.query(
      "SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND table_name='users' AND column_name='email'",
      [schema],
    );
    assert.equal(column.rows.length, 0);
    await connection.query(
      "DELETE FROM users WHERE username='CUSTOMER@example.com'",
    );
    await connection.query(
      'INSERT INTO users (username,"passwordHash",role,"mustChangePassword","updatedAt") VALUES (\'invalid@example..com\',\'x\',\'CUSTOMER\',false,now())',
    );
    await assert.rejects(connection.query(file(migration)));
    await connection.query('ROLLBACK');
    await connection.query(
      "DELETE FROM users WHERE username='invalid@example..com'",
    );
    await connection.query(file(migration));
    assert.equal((await account(u)).username, u.username);
    assert.equal(
      (
        await prisma.projectAssignment.findUniqueOrThrow({
          where: { projectId: p.id },
        })
      ).engineerId,
      u.id,
    );
  } finally {
    connection.release();
  }
});

test('password login accepts only email/password; no profile or administrator fallback', async () => {
  for (const body of [
    { username: 'bootstrap-admin', password: 'Password123!' },
    { password: 'Password123!' },
    { email: 'bootstrap@example.com' },
    { email: '', password: 'Password123!' },
    { email: 'bootstrap@example.com', password: '' },
    {
      email: 'bootstrap@example.com',
      password: 'Password123!',
      username: 'bootstrap-admin',
    },
    { identifier: 'bootstrap@example.com', password: 'Password123!' },
  ])
    await post('auth/login', body).expect(400);
  await login('bootstrap-admin', 'Password123!').expect(401);
  await login(' BOOTSTRAP@Example.COM ', 'Password123!').expect(200);
  await login('engineer@example.com', 'Password123!').expect(200);
  await prisma.user.update({
    where: { id: activeEngineer.id },
    data: { username: 'EngineerProfile' },
  });
  await login('EngineerProfile', 'Password123!').expect(401);
  // Even an email-shaped username is never a secondary lookup.
  await prisma.user.update({
    where: { id: admin.id },
    data: { username: 'old-admin@example.com' },
  });
  await login('old-admin@example.com', 'Password123!').expect(401);
  await login('bootstrap@example.com', 'Password123!').expect(200);
});

for (const role of [Role.ENGINEER, Role.PROJECT_MANAGER, Role.COMPANY_OWNER]) {
  test(
    role +
      ': shared onboarding, email login and profile identity preserve role-specific RBAC',
    async () => {
      const u = (await create(role).expect(201)).body;
      const first = (
        await login(u.temporaryLogin, u.temporaryPassword).expect(200)
      ).body;
      assert.ok(first.onboardingToken);
      assert.equal(first.accessToken, undefined);
      assert.equal(first.user.username, u.username);
      assert.equal(first.user.role, role);
      u.token = first.onboardingToken;
      await login(u.username, u.temporaryPassword).expect(401);
      await post('auth/login', {
        username: u.username,
        password: u.temporaryPassword,
      }).expect(400);
      await post('projects/999/review/start', {}, u.token).expect(403);
      const email = 'staff-' + role.toLowerCase() + '@example.com';
      await password(u).expect(200);
      await requestEmail(u, email).expect(200);
      assert.equal(messages.at(-1)!.email, email);
      const completed = (await verifyEmail(u, email).expect(200)).body;
      assert.equal(completed.emailVerified, true);
      assert.equal(completed.onboardingComplete, true);
      await me(u.token).expect(401);
      await login(u.temporaryLogin, u.temporaryPassword).expect(401);
      await login(u.temporaryLogin, 'PermanentPassword123!').expect(401);
      await login(u.username, 'PermanentPassword123!').expect(401);
      const active = (await login(email, 'PermanentPassword123!').expect(200))
        .body;
      assert.ok(active.accessToken);
      assert.equal(active.onboardingToken, undefined);
      const claims = await jwt.verifyAsync(active.accessToken);
      assert.equal(claims.role, role);
      assert.equal(claims.sub, u.id);
      assert.equal(claims.scope, undefined);
      const profile = (await me(active.accessToken).expect(200)).body;
      assert.equal(profile.username, u.username);
      assert.equal(profile.role, role);
      const project = await prisma.project.create({
        data: {
          title: 'Shared onboarding RBAC',
          status: 'SUBMITTED',
          clientId: customer.id,
          assignment: { create: { engineerId: u.id } },
        },
      });
      await post(
        'projects/' + project.id + '/review/start',
        {},
        active.accessToken,
      ).expect(role === Role.ENGINEER ? 200 : 403);
      await post(
        'users',
        { firstName: 'Other', lastName: 'Staff', birthYear: 1999, role },
        active.accessToken,
      ).expect(403);
      // Generic OTP request responses still disclose no identity; neither profile nor
      // temporary identifiers receive mail through login or password recovery.
      const count = messages.length;
      for (const identifier of [u.username, u.temporaryLogin]) {
        for (const path of ['auth/login/otp/request', 'auth/forgot-password']) {
          const response = await post(path, { email: identifier });
          assert.ok([200, 400].includes(response.status));
        }
      }
      await new Promise((resolve) => setImmediate(resolve));
      assert.equal(messages.length, count);
      await post('auth/login/otp/request', { email }).expect(200);
      await new Promise((resolve) => setTimeout(resolve, 20));
      const otpLogin = (
        await post('auth/login/otp/verify', {
          email,
          otp: messages.at(-1)!.code,
        }).expect(200)
      ).body;
      assert.ok(otpLogin.accessToken);
      assert.equal((await jwt.verifyAsync(otpLogin.accessToken)).role, role);
    },
  );
}
