import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('S1-4 Authentication & RBAC (e2e)', () => {
  let app: INestApplication;
  let customer1Token: string;
  let customer2Token: string;
  let engineer1Token: string;
  let engineer2Token: string;
  let pmToken: string;
  let adminToken: string;

  let customer1Id: number;
  let engineer1Id: number;
  let engineer2Id: number;
  let project1Id: number;
  let project2Id: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Authenticate seeded users
    const resCust1 = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'customer1@test.com', password: 'Customer123!' });
    customer1Token = resCust1.body.accessToken;
    customer1Id = resCust1.body.user.id;

    const resCust2 = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'customer2@test.com', password: 'Customer123!' });
    customer2Token = resCust2.body.accessToken;

    const resEng1 = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'engineer1@test.com', password: 'Engineer123!' });
    engineer1Token = resEng1.body.accessToken;
    engineer1Id = resEng1.body.user.id;

    const resEng2 = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'engineer2@test.com', password: 'Engineer123!' });
    engineer2Token = resEng2.body.accessToken;
    engineer2Id = resEng2.body.user.id;

    const resPm = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'pm@test.com', password: 'ProjectManager123!' });
    pmToken = resPm.body.accessToken;

    const resAdmin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'admin@test.com', password: 'Admin123!' });
    adminToken = resAdmin.body.accessToken;

    // Fetch projects list as PM to get IDs
    const projectsRes = await request(app.getHttpServer())
      .get('/api/projects')
      .set('Authorization', `Bearer ${pmToken}`);
    project1Id = projectsRes.body[0].id;
    project2Id = projectsRes.body[1].id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Seeded User Authentication', () => {
    it('customer1 can authenticate via POST /api/auth/login (200 OK)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'customer1@test.com', password: 'Customer123!' })
        .expect(200);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user.role).toBe('CUSTOMER');
      expect(res.body.user.mustChangePassword).toBe(false);
    });

    it('admin can authenticate via POST /api/auth/login (200 OK)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'admin@test.com', password: 'Admin123!' })
        .expect(200);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user.role).toBe('ADMINISTRATOR');
      expect(res.body.user.mustChangePassword).toBe(true);
    });
  });

  describe('2. Current User Resolution (GET /api/auth/me)', () => {
    it('resolves identity and role for valid JWT', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${customer1Token}`)
        .expect(200);

      expect(res.body.username).toBe('customer1@test.com');
      expect(res.body.role).toBe('CUSTOMER');
      expect(res.body.mustChangePassword).toBe(false);
    });
  });

  describe('3. 401 Unauthorized Behavior', () => {
    it('returns 401 when no token is provided', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });

    it('returns 401 when invalid token is provided', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token-123')
        .expect(401);
    });
  });

  describe('4. 403 Forbidden Behavior (Role Authorization)', () => {
    it('returns 403 when customer tries to access admin-only POST /api/users', async () => {
      await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          firstName: 'Illegal',
          lastName: 'User',
          role: 'ENGINEER',
        })
        .expect(403);
    });
  });

  describe('5. Customer Project Authorization', () => {
    it('allows Customer 1 to access Customer 1 project', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/projects/${project1Id}`)
        .set('Authorization', `Bearer ${customer1Token}`)
        .expect(200);

      expect(res.body.id).toBe(project1Id);
    });

    it('denies Customer 1 access to Customer 2 project (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .get(`/api/projects/${project2Id}`)
        .set('Authorization', `Bearer ${customer1Token}`)
        .expect(403);
    });
  });

  describe('6. Engineer Project Authorization', () => {
    it('allows Engineer 1 to access assigned project 1', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/projects/${project1Id}`)
        .set('Authorization', `Bearer ${engineer1Token}`)
        .expect(200);

      expect(res.body.id).toBe(project1Id);
    });

    it('denies Engineer 1 access to project assigned to Engineer 2 (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .get(`/api/projects/${project2Id}`)
        .set('Authorization', `Bearer ${engineer1Token}`)
        .expect(403);
    });
  });

  describe('7. PM Project Assignment Authorization', () => {
    it('allows PM to perform project assignment', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/projects/${project1Id}/assign`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ engineerId: engineer2Id })
        .expect(200);

      expect(res.body.engineerId).toBe(engineer2Id);

      // Reassign back to engineer1 for test isolation
      await request(app.getHttpServer())
        .post(`/api/projects/${project1Id}/assign`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ engineerId: engineer1Id })
        .expect(200);
    });

    it('rejects assignment if target user does not have ENGINEER role (400 Bad Request)', async () => {
      await request(app.getHttpServer())
        .post(`/api/projects/${project1Id}/assign`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ engineerId: customer1Id }) // customer1 (Role: CUSTOMER)
        .expect(400);
    });
  });

  describe('8. Customer Self-Registration (POST /api/auth/register)', () => {
    const newUsername = `newcustomer_${Date.now()}@test.com`;

    it('creates a new customer account (201 Created)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: newUsername,
          password: 'Password123!',
          role: 'ADMINISTRATOR', // should be ignored by backend
        })
        .expect(201);

      expect(res.body.username).toBe(newUsername);
      expect(res.body.role).toBe('CUSTOMER');
      expect(res.body.mustChangePassword).toBe(false);
    });

    it('returns 409 Conflict for duplicate registration', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: newUsername,
          password: 'Password123!',
        })
        .expect(409);
    });
  });

  describe('9. Administrator Internal User Creation & First Login', () => {
    let internalUsername: string;
    let tempPassword: string;

    it('admin creates an internal engineer user (201 Created)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Samy',
          lastName: 'Hassan',
          birthYear: 1995,
          role: 'ENGINEER',
        })
        .expect(201);

      expect(res.body.username).toBe('SamyHas95');
      expect(res.body.temporaryPassword).toBeDefined();
      expect(res.body.role).toBe('ENGINEER');
      expect(res.body.mustChangePassword).toBe(true);

      internalUsername = res.body.username;
      tempPassword = res.body.temporaryPassword;
    });

    it('rejects internal creation of ADMINISTRATOR or CUSTOMER role (400 Bad Request)', async () => {
      await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Illegal',
          lastName: 'Admin',
          role: 'ADMINISTRATOR',
        })
        .expect(400);

      await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Illegal',
          lastName: 'Cust',
          role: 'CUSTOMER',
        })
        .expect(400);
    });

    it('internal user logs in with temporary password and mustChangePassword is true', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: internalUsername,
          password: tempPassword,
        })
        .expect(200);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user.mustChangePassword).toBe(true);
    });

    it('internal user changes password successfully (POST /api/auth/change-password)', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: internalUsername,
          password: tempPassword,
        });
      const tempToken = loginRes.body.accessToken;

      const changeRes = await request(app.getHttpServer())
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({
          newPassword: 'NewPermanentPassword123!',
        })
        .expect(200);

      expect(changeRes.body.mustChangePassword).toBe(false);

      const meRes = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${tempToken}`)
        .expect(200);

      expect(meRes.body.mustChangePassword).toBe(false);

      const newLoginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: internalUsername,
          password: 'NewPermanentPassword123!',
        })
        .expect(200);

      expect(newLoginRes.body.user.mustChangePassword).toBe(false);
    });
  });
});
