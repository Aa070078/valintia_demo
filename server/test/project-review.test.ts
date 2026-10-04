import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { after, before, beforeEach, test } from 'node:test';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import request from 'supertest';
import {
  PrismaClient,
  ProjectStatus,
  Role,
} from '../dist/generated/prisma/client.js';
import { PrismaService } from '../dist/infrastructure/database/prisma.service.js';
import { RedisService } from '../dist/infrastructure/redis/redis.service.js';
import { MailService } from '../dist/infrastructure/mail/mail.service.js';
import { ProjectsModule } from '../dist/projects/projects.module.js';

// Real PostgreSQL/Prisma transactions and real JWT/RBAC/DTOs over in-process HTTP.
// All migrations and fixtures are isolated in a temporary schema, never public.
const schema = `review_test_${randomUUID().replaceAll('-', '')}`;
const migrationName = '20261002142000_add_engineer_review';
const secret = 'test-only-review-access-secret';
const jwt = new JwtService({ secret });
let app: INestApplication;
let pool: Pool;
let prisma: PrismaClient;
let schemaCreated = false;
const identities: Record<string, { id: number; role: Role; token: string }> =
  {};
let submitted: number;
let draft: number;
let unassigned: number;
let otherProject: number;

before(async () => {
  if (!process.env.DATABASE_URL)
    throw new Error(
      'DATABASE_URL is required for isolated PostgreSQL integration tests',
    );
  assert.match(schema, /^review_test_[a-f0-9]{32}$/);
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    options: `-c search_path=${schema}`,
    connectionTimeoutMillis: 5000,
  });
  await pool.query(`CREATE SCHEMA "${schema}"`);
  schemaCreated = true;
  const migrations = resolve('prisma/migrations');
  for (const name of readdirSync(migrations)
    .filter(
      (name) =>
        /^\d/.test(name) && name <= '20261004120000_user_email_identity',
    )
    .sort()) {
    await pool.query(
      readFileSync(resolve(migrations, name, 'migration.sql'), 'utf8'),
    );
  }
  prisma = new PrismaClient({ adapter: new PrismaPg(pool, { schema }) });
  for (const [name, role] of [
    ['customer', Role.CUSTOMER],
    ['otherCustomer', Role.CUSTOMER],
    ['engineer', Role.ENGINEER],
    ['otherEngineer', Role.ENGINEER],
    ['pm', Role.PROJECT_MANAGER],
    ['admin', Role.ADMINISTRATOR],
    ['owner', Role.COMPANY_OWNER],
  ] as const) {
    const user = await prisma.user.create({
      data: {
        username: `${name}@review.test`,
        email: `${name.toLowerCase()}@review.test`,
        emailVerified: true,
        mustChangePassword: false,
        passwordHash: 'credential-must-never-leak',
        role,
      },
    });
    identities[name] = {
      id: user.id,
      role,
      token: await jwt.signAsync({ sub: user.id, role }, { expiresIn: '1h' }),
    };
  }
  const module = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
        load: [
          () => ({
            jwt: { secret },
            emailVerificationToken: {
              secret: 'test-only-review-email-secret',
              expiresIn: '15m',
            },
            passwordResetToken: {
              secret: 'test-only-review-reset-secret',
              expiresIn: '15m',
            },
          }),
        ],
      }),
      ProjectsModule,
    ],
  })
    .overrideProvider(PrismaService)
    .useValue(prisma)
    .overrideProvider(RedisService)
    .useValue({})
    .overrideProvider(MailService)
    .useValue({})
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
  await prisma.project.deleteMany(); // Only fixtures in this suite's schema.
  const create = async (
    status: ProjectStatus,
    client: string,
    engineer?: string,
  ) =>
    prisma.project.create({
      data: {
        title: `${client} review project`,
        status,
        notes: 'Customer project requirements',
        clientId: identities[client].id,
        property: {
          create: { propertyType: 'Apartment', areaSqm: 120, city: 'Cairo' },
        },
        spaces: { create: [{ type: 'LIVING_ROOM' }, { type: 'KITCHEN' }] },
        ...(engineer
          ? { assignment: { create: { engineerId: identities[engineer].id } } }
          : {}),
      },
    });
  submitted = (await create(ProjectStatus.SUBMITTED, 'customer', 'engineer'))
    .id;
  draft = (await create(ProjectStatus.DRAFT, 'customer', 'engineer')).id;
  unassigned = (await create(ProjectStatus.SUBMITTED, 'customer')).id;
  otherProject = (
    await create(ProjectStatus.SUBMITTED, 'otherCustomer', 'otherEngineer')
  ).id;
});

after(async () => {
  try {
    await app?.close();
  } finally {
    try {
      await prisma?.$disconnect();
      if (schemaCreated) {
        assert.match(schema, /^review_test_[a-f0-9]{32}$/);
        await pool.query(`DROP SCHEMA "${schema}" CASCADE`);
      }
    } finally {
      await pool?.end();
    }
  }
});

const get = (path: string, who = 'engineer') =>
  request(app.getHttpServer())
    .get(`/api/projects/${path}`)
    .set('Authorization', `Bearer ${identities[who].token}`);
const post = (path: string, body: object = {}, who = 'engineer') =>
  request(app.getHttpServer())
    .post(`/api/projects/${path}`)
    .set('Authorization', `Bearer ${identities[who].token}`)
    .send(body);
const start = (id = submitted, body: object = {}, who = 'engineer') =>
  post(`${id}/review/start`, body, who);
const ready = (id = submitted, body: object = {}, who = 'engineer') =>
  post(`${id}/review/ready-for-consultation`, body, who);
const stored = (id = submitted) =>
  prisma.project.findUniqueOrThrow({
    where: { id },
    include: { assignment: true, activities: true },
  });

test('assigned Engineer receives all persisted review context and no credentials', async () => {
  const response = await get(`${submitted}/review`).expect(200);
  assert.equal(response.body.client.id, identities.customer.id);
  assert.equal(response.body.assignment.engineer.id, identities.engineer.id);
  assert.equal(response.body.notes, 'Customer project requirements');
  assert.equal(response.body.property.areaSqm, '120');
  assert.equal(response.body.spaces.length, 2);
  assert.deepEqual(response.body.allowedActions, ['START_REVIEW']);
  assert.deepEqual(response.body.activities, []);
  assert.deepEqual(Object.keys(response.body.client).sort(), [
    'id',
    'username',
  ]);
  assert.deepEqual(Object.keys(response.body.assignment.engineer).sort(), [
    'id',
    'username',
  ]);
  assert.ok(
    !JSON.stringify(response.body).includes('credential-must-never-leak'),
  );
  assert.ok(!JSON.stringify(response.body).includes('passwordHash'));
});

test('only assigned Engineer performs review; Customer/PM/Admin/Owner and other Engineers are rejected', async () => {
  for (const who of [
    'customer',
    'otherCustomer',
    'pm',
    'admin',
    'owner',
    'otherEngineer',
  ]) {
    await get(`${submitted}/review`, who).expect(403);
    await start(submitted, {}, who).expect(403);
    await ready(submitted, {}, who).expect(403);
  }
  await get(`${otherProject}/review`).expect(403);
  await start(unassigned).expect(403);
  const project = await stored();
  assert.equal(project.status, ProjectStatus.SUBMITTED);
  assert.equal(project.activities.length, 0);
});

test('review starts only from assigned SUBMITTED and readiness only from UNDER_ENGINEER_REVIEW', async () => {
  await start(draft).expect(409);
  await ready().expect(409);
  const began = await start(submitted, {
    note: '  Initial review started.  ',
  }).expect(200);
  assert.equal(began.body.status, ProjectStatus.UNDER_ENGINEER_REVIEW);
  assert.equal(began.body.activity.action, 'REVIEW_STARTED');
  assert.equal(began.body.activity.actorId, identities.engineer.id);
  assert.equal(began.body.activity.actorRole, 'ENGINEER');
  assert.equal(began.body.activity.fromStatus, 'SUBMITTED');
  assert.equal(began.body.activity.toStatus, 'UNDER_ENGINEER_REVIEW');
  assert.equal(began.body.activity.note, 'Initial review started.');
  assert.deepEqual(began.body.allowedActions, ['MARK_READY_FOR_CONSULTATION']);
  await start().expect(409);
  const finished = await ready(submitted, {
    note: 'Ready to discuss project requirements.',
  }).expect(200);
  assert.equal(finished.body.status, ProjectStatus.ENGINEER_READY);
  assert.equal(finished.body.activity.action, 'CONSULTATION_READY');
  assert.deepEqual(finished.body.allowedActions, []);
  await ready().expect(409);
  await start().expect(409);
  const project = await stored();
  assert.equal(project.status, ProjectStatus.ENGINEER_READY);
  assert.equal(project.activities.length, 2);
});

test('history is chronological, persisted, and restricted by ownership/assignment', async () => {
  await start().expect(200);
  await ready().expect(200);
  for (const who of ['engineer', 'customer', 'pm', 'admin', 'owner']) {
    const history = await get(`${submitted}/activity`, who).expect(200);
    assert.deepEqual(
      history.body.map((item: any) => item.action),
      ['REVIEW_STARTED', 'CONSULTATION_READY'],
    );
  }
  await get(`${submitted}/activity`, 'otherEngineer').expect(403);
  await get(`${submitted}/activity`, 'otherCustomer').expect(403);
  await get(`${otherProject}/activity`, 'customer').expect(403);
  const context = await get(`${submitted}/review`).expect(200);
  assert.equal(context.body.activities.length, 2);
});

test('arbitrary status, actor and assignment payloads are rejected; note constraints are enforced', async () => {
  for (const body of [
    { status: 'ENGINEER_READY' },
    { toStatus: 'ENGINEER_READY' },
    { actorId: identities.pm.id },
    { engineerId: identities.otherEngineer.id },
    { note: '   ' },
    { note: 'x'.repeat(2001) },
    { note: 123 },
  ])
    await start(submitted, body).expect(400);
  await request(app.getHttpServer())
    .patch(`/api/projects/${draft}`)
    .set('Authorization', `Bearer ${identities.pm.token}`)
    .send({ status: 'ENGINEER_READY' })
    .expect(400);
  await start(submitted, { note: null }).expect(200);
  await ready(submitted, { status: 'ENGINEER_READY' }).expect(400);
  const project = await stored();
  assert.equal(project.status, ProjectStatus.UNDER_ENGINEER_REVIEW);
  assert.equal(project.activities.length, 1);
  assert.equal(project.activities[0].note, null);
});

test('invalid authentication, IDs and missing projects return documented errors', async () => {
  await request(app.getHttpServer())
    .get(`/api/projects/${submitted}/review`)
    .expect(401);
  await request(app.getHttpServer())
    .post(`/api/projects/${submitted}/review/start`)
    .set('Authorization', 'Bearer tampered')
    .send({})
    .expect(401);
  await get('not-an-id/review').expect(400);
  await post('not-an-id/review/start').expect(400);
  await get('2147483647/review').expect(404);
  await start(2147483647).expect(404);
  await ready(2147483647).expect(404);
  await get('2147483647/activity').expect(404);
});

test('PM assigns before review but cannot reassign a project in review or ready state', async () => {
  for (const who of ['customer', 'engineer']) {
    await post(
      `${submitted}/assign`,
      { engineerId: identities.otherEngineer.id },
      who,
    ).expect(403);
  }
  await post(
    `${submitted}/assign`,
    { engineerId: identities.customer.id },
    'pm',
  ).expect(400);
  await post(`${submitted}/assign`, { engineerId: 2147483647 }, 'pm').expect(
    404,
  );
  await post(
    `${submitted}/assign`,
    { engineerId: identities.otherEngineer.id },
    'pm',
  ).expect(200);
  await start().expect(403);
  await start(submitted, {}, 'otherEngineer').expect(200);
  await post(
    `${submitted}/assign`,
    { engineerId: identities.engineer.id },
    'pm',
  ).expect(409);
  await ready(submitted, {}, 'otherEngineer').expect(200);
  await post(
    `${submitted}/assign`,
    { engineerId: identities.engineer.id },
    'admin',
  ).expect(409);
  assert.equal(
    (await stored()).assignment?.engineerId,
    identities.otherEngineer.id,
  );
});

test('concurrent start actions persist exactly one transition and history event', async () => {
  const responses = await Promise.all([start(), start()]);
  assert.deepEqual(
    responses.map((response) => response.status).sort(),
    [200, 409],
  );
  assert.equal((await stored()).activities.length, 1);
  const finishes = await Promise.all([ready(), ready()]);
  assert.deepEqual(
    finishes.map((response) => response.status).sort(),
    [200, 409],
  );
  assert.equal((await stored()).activities.length, 2);
});

test('concurrent reassignment and review cannot authorize the previous Engineer after reassignment', async () => {
  const [review, assignment] = await Promise.all([
    start(),
    post(
      `${submitted}/assign`,
      { engineerId: identities.otherEngineer.id },
      'pm',
    ),
  ]);
  const project = await stored();
  if (review.status === 200) {
    assert.equal(assignment.status, 409);
    assert.equal(project.assignment?.engineerId, identities.engineer.id);
    assert.equal(project.activities.length, 1);
  } else {
    assert.equal(review.status, 403);
    assert.equal(assignment.status, 200);
    assert.equal(project.status, ProjectStatus.SUBMITTED);
    assert.equal(project.assignment?.engineerId, identities.otherEngineer.id);
    assert.equal(project.activities.length, 0);
  }
});

test('a failed history insert rolls back the Project status change', async () => {
  await pool.query(
    `ALTER TABLE "project_activities" ADD CONSTRAINT "test_reject_review_event" CHECK ("action" <> 'REVIEW_STARTED')`,
  );
  try {
    await start().expect(500);
    const project = await stored();
    assert.equal(project.status, ProjectStatus.SUBMITTED);
    assert.equal(project.activities.length, 0);
  } finally {
    await pool.query(
      `ALTER TABLE "project_activities" DROP CONSTRAINT "test_reject_review_event"`,
    );
  }
});

test('Swagger documents actions, response schemas, purpose-fixed DTO and conflict responses', () => {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().addBearerAuth(undefined, 'access-token').build(),
  );
  for (const path of [
    '/api/projects/{id}/review/start',
    '/api/projects/{id}/review/ready-for-consultation',
  ]) {
    const operation = document.paths[path]?.post;
    assert.ok(operation);
    for (const code of ['200', '400', '401', '403', '404', '409'])
      assert.ok(operation.responses[code]);
    assert.ok(operation.security?.some((item) => 'access-token' in item));
  }
  assert.ok(document.paths['/api/projects/{id}/review']?.get);
  assert.ok(document.paths['/api/projects/{id}/activity']?.get);
  const actionSchema = document.components?.schemas?.ReviewActionDto as any;
  assert.deepEqual(Object.keys(actionSchema.properties), ['note']);
  assert.equal(actionSchema.properties.note.maxLength, 2000);
  assert.ok(document.components?.schemas?.ProjectReviewContextDto);
  assert.ok(document.components?.schemas?.ProjectActivityDto);
});

test('manual rollback restores original states/schema and the additive migration can be reapplied', async () => {
  await start().expect(200);
  await ready().expect(200);
  const connection = await pool.connect();
  let rolledBack = false;
  try {
    await connection.query(
      readFileSync(resolve('prisma/rollback/engineer-review.sql'), 'utf8'),
    );
    rolledBack = true;
    const project = await connection.query(
      'SELECT "status"::text FROM "projects" WHERE "id" = $1',
      [submitted],
    );
    assert.equal(project.rows[0].status, 'SUBMITTED');
    const states = await connection.query(
      `SELECT enum_range(NULL::"ProjectStatus")::text AS states`,
    );
    assert.equal(states.rows[0].states, '{DRAFT,SUBMITTED}');
    const table = await connection.query('SELECT to_regclass($1) AS name', [
      `${schema}.project_activities`,
    ]);
    assert.equal(table.rows[0].name, null);
  } finally {
    if (!rolledBack) await connection.query('ROLLBACK');
    else
      await connection.query(
        readFileSync(
          resolve('prisma/migrations', migrationName, 'migration.sql'),
          'utf8',
        ),
      );
    connection.release();
  }
  const response = await get(`${submitted}/review`).expect(200);
  assert.equal(response.body.status, 'SUBMITTED');
  assert.deepEqual(response.body.activities, []);
});
