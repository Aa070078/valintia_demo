import 'reflect-metadata';
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UsersController } from '../dist/users/users.controller.js';
import { UsersService } from '../dist/users/users.service.js';
import { PrismaService } from '../dist/infrastructure/database/prisma.service.js';

// Real Nest controller, service, JWT and roles guards; no real DB or credentials changed.
const secret = 'directory-test-only-secret';
const jwt = new JwtService({ secret });
const records = [
  {
    id: 1,
    username: 'Admin',
    role: 'ADMINISTRATOR',
    emailVerified: true,
    mustChangePassword: false,
  },
  {
    id: 2,
    username: 'PendingStaff',
    role: 'ENGINEER',
    email: null,
    emailVerified: false,
    mustChangePassword: true,
    onboardingVersion: 'restricted-generation',
    temporaryCredentialsExpiresAt: new Date(Date.now() + 3600000),
    createdAt: new Date(),
    passwordHash: 'never-expose',
  },
  {
    id: 3,
    username: 'ActiveStaff',
    role: 'ENGINEER',
    email: 'active@example.com',
    emailVerified: true,
    mustChangePassword: false,
    createdAt: new Date(),
    passwordHash: 'never-expose',
  },
  {
    id: 4,
    username: 'Client',
    role: 'CUSTOMER',
    emailVerified: true,
    mustChangePassword: false,
  },
];
let reads = 0;
const prisma = {
  user: {
    findUnique: async ({ where }: { where: { id: number } }) =>
      records.find((user) => user.id === where.id),
    findMany: async ({
      where,
      select,
    }: {
      where: { role: { in: string[] } };
      select: Record<string, boolean>;
    }) => {
      reads++;
      return records
        .filter((user) => where.role.in.includes(user.role))
        .map((user) =>
          Object.fromEntries(
            Object.keys(select).map((key) => [
              key,
              user[key as keyof typeof user] ?? null,
            ]),
          ),
        );
    },
  },
};
let app: INestApplication;
before(async () => {
  const module = await Test.createTestingModule({
    controllers: [UsersController],
    providers: [
      UsersService,
      { provide: PrismaService, useValue: prisma },
      {
        provide: ConfigService,
        useValue: new ConfigService({ jwt: { secret } }),
      },
      { provide: JwtService, useValue: jwt },
    ],
  }).compile();
  app = module.createNestApplication();
  app.setGlobalPrefix('api');
  await app.init();
});
after(async () => {
  await app?.close();
});
const token = (sub: number, role: string, extra = {}) =>
  jwt.sign({ sub, role, ...extra });
test('directory returns pending and active staff with safe metadata only', async () => {
  const response = await request(app.getHttpServer())
    .get('/api/users')
    .set('Authorization', `Bearer ${token(1, 'ADMINISTRATOR')}`)
    .expect(200);
  assert.deepEqual(
    response.body.map((user: { id: number }) => user.id),
    [2, 3],
  );
  assert.equal(response.body[0].email, null);
  assert.equal(response.body[0].mustChangePassword, true);
  const allowed = [
    'id',
    'username',
    'email',
    'role',
    'emailVerified',
    'mustChangePassword',
    'temporaryCredentialsExpiresAt',
    'createdAt',
  ].sort();
  for (const user of response.body)
    assert.deepEqual(Object.keys(user).sort(), allowed);
  assert.ok(!JSON.stringify(response.body).includes('never-expose'));
});
test('missing, client, engineer and restricted onboarding credentials cannot read directory', async () => {
  const initialReads = reads;
  await request(app.getHttpServer()).get('/api/users').expect(401);
  for (const [sub, role] of [
    [3, 'ENGINEER'],
    [4, 'CUSTOMER'],
  ] as const)
    await request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${token(sub, role)}`)
      .expect(403);
  await request(app.getHttpServer())
    .get('/api/users')
    .set(
      'Authorization',
      `Bearer ${token(2, 'ENGINEER', { scope: 'onboarding', version: 'restricted-generation' })}`,
    )
    .expect(403);
  assert.equal(reads, initialReads);
});
