import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import assert from 'node:assert';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

async function runAcceptanceTests() {
  console.log('--- STARTING S1-4 ACCEPTANCE & VERIFICATION TESTS ---');

  let app: any;
  try {
    app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.listen(0);
    const server = app.getHttpServer();

    let customer1Token = '';
    let customer2Token = '';
    let engineer1Token = '';
    let engineer2Token = '';
    let pmToken = '';
    let adminToken = '';

    let customer1Id = 0;
    let engineer1Id = 0;
    let engineer2Id = 0;
    let project1Id = 0;
    let project2Id = 0;

    // ----------------------------------------------------
    // 1. Seeded users can authenticate (POST /api/auth/login)
    // ----------------------------------------------------
    console.log('Test 1: Login seeded customer1@test.com...');
    const resCust1 = await request(server)
      .post('/api/auth/login')
      .send({ username: 'customer1@test.com', password: 'Customer123!' })
      .expect(200);

    assert(resCust1.body.accessToken, 'AccessToken should be present');
    assert.strictEqual(resCust1.body.user.role, 'CUSTOMER');
    assert.strictEqual(resCust1.body.user.mustChangePassword, false);
    customer1Token = resCust1.body.accessToken;
    customer1Id = resCust1.body.user.id;
    console.log('✓ Test 1 Passed: Customer login succeeded, mustChangePassword=false');

    console.log('Test 2: Login seeded admin@test.com...');
    const resAdmin = await request(server)
      .post('/api/auth/login')
      .send({ username: 'admin@test.com', password: 'Admin123!' })
      .expect(200);

    assert(resAdmin.body.accessToken, 'AccessToken should be present');
    assert.strictEqual(resAdmin.body.user.role, 'ADMINISTRATOR');
    assert.strictEqual(resAdmin.body.user.mustChangePassword, true);
    adminToken = resAdmin.body.accessToken;
    console.log('✓ Test 2 Passed: Admin login succeeded, mustChangePassword=true');

    // Authenticate other users
    const resCust2 = await request(server)
      .post('/api/auth/login')
      .send({ username: 'customer2@test.com', password: 'Customer123!' });
    customer2Token = resCust2.body.accessToken;

    const resEng1 = await request(server)
      .post('/api/auth/login')
      .send({ username: 'engineer1@test.com', password: 'Engineer123!' });
    engineer1Token = resEng1.body.accessToken;
    engineer1Id = resEng1.body.user.id;

    const resEng2 = await request(server)
      .post('/api/auth/login')
      .send({ username: 'engineer2@test.com', password: 'Engineer123!' });
    engineer2Token = resEng2.body.accessToken;
    engineer2Id = resEng2.body.user.id;

    const resPm = await request(server)
      .post('/api/auth/login')
      .send({ username: 'pm@test.com', password: 'ProjectManager123!' });
    pmToken = resPm.body.accessToken;

    // Fetch projects to get IDs
    const projectsList = await request(server)
      .get('/api/projects')
      .set('Authorization', `Bearer ${pmToken}`)
      .expect(200);

    project1Id = projectsList.body[0].id;
    project2Id = projectsList.body[1].id;

    // ----------------------------------------------------
    // 2. API can resolve current user and role (GET /api/auth/me)
    // ----------------------------------------------------
    console.log('Test 3: Current user resolution GET /api/auth/me...');
    const meRes = await request(server)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${customer1Token}`)
      .expect(200);

    assert.strictEqual(meRes.body.username, 'customer1@test.com');
    assert.strictEqual(meRes.body.role, 'CUSTOMER');
    assert.strictEqual(meRes.body.mustChangePassword, false);
    console.log('✓ Test 3 Passed: User identity and role resolved correctly from JWT');

    // ----------------------------------------------------
    // 3. Unauthorized behavior (401)
    // ----------------------------------------------------
    console.log('Test 4: 401 Unauthorized check (no JWT / invalid JWT)...');
    await request(server).get('/api/auth/me').expect(401);
    await request(server).get('/api/auth/me').set('Authorization', 'Bearer invalid-token').expect(401);
    console.log('✓ Test 4 Passed: 401 returned for missing / invalid JWT');

    // ----------------------------------------------------
    // 4. Role Authorization (403 Forbidden)
    // ----------------------------------------------------
    console.log('Test 5: 403 Forbidden check (customer accessing POST /api/users)...');
    await request(server)
      .post('/api/users')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({ firstName: 'Fake', lastName: 'User', role: 'ENGINEER' })
      .expect(403);
    console.log('✓ Test 5 Passed: 403 Forbidden returned for insufficient role');

    // ----------------------------------------------------
    // 5. Customer Project Authorization
    // ----------------------------------------------------
    console.log('Test 6: Customer project authorization...');
    // Customer 1 -> Project 1 (allowed)
    await request(server)
      .get(`/api/projects/${project1Id}`)
      .set('Authorization', `Bearer ${customer1Token}`)
      .expect(200);

    // Customer 1 -> Project 2 (denied - owned by Customer 2)
    await request(server)
      .get(`/api/projects/${project2Id}`)
      .set('Authorization', `Bearer ${customer1Token}`)
      .expect(403);
    console.log('✓ Test 6 Passed: Customer 1 can read Project 1 but is denied Project 2');

    // ----------------------------------------------------
    // 6. Engineer Project Authorization
    // ----------------------------------------------------
    console.log('Test 7: Engineer project authorization...');
    // Engineer 1 -> Project 1 (assigned to Engineer 1) -> 200
    await request(server)
      .get(`/api/projects/${project1Id}`)
      .set('Authorization', `Bearer ${engineer1Token}`)
      .expect(200);

    // Engineer 1 -> Project 2 (assigned to Engineer 2) -> 403
    await request(server)
      .get(`/api/projects/${project2Id}`)
      .set('Authorization', `Bearer ${engineer1Token}`)
      .expect(403);
    console.log('✓ Test 7 Passed: Engineer 1 can read assigned Project 1 but is denied Project 2');

    // ----------------------------------------------------
    // 7. PM Project Assignment Actions
    // ----------------------------------------------------
    console.log('Test 8: PM project assignment actions...');
    await request(server)
      .post(`/api/projects/${project1Id}/assign`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({ engineerId: engineer2Id })
      .expect(200);

    // DB business rule: assignment target must be an ENGINEER role user
    await request(server)
      .post(`/api/projects/${project1Id}/assign`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({ engineerId: customer1Id }) // CUSTOMER role
      .expect(400);

    // Reset assignment back to engineer1 for consistency
    await request(server)
      .post(`/api/projects/${project1Id}/assign`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({ engineerId: engineer1Id });

    console.log('✓ Test 8 Passed: PM can assign project; DB rule enforces target role is ENGINEER');

    // ----------------------------------------------------
    // 8. Customer Self-Registration
    // ----------------------------------------------------
    console.log('Test 9: Customer self-registration (POST /api/auth/register)...');
    const newCustomerUsername = `customer_auto_${Date.now()}@test.com`;
    const regRes = await request(server)
      .post('/api/auth/register')
      .send({
        username: newCustomerUsername,
        password: 'CustomerPass123!',
        role: 'ADMINISTRATOR', // should be ignored by backend
      })
      .expect(201);

    assert.strictEqual(regRes.body.username, newCustomerUsername);
    assert.strictEqual(regRes.body.role, 'CUSTOMER');
    assert.strictEqual(regRes.body.mustChangePassword, false);

    // Duplicate username -> 409 Conflict
    await request(server)
      .post('/api/auth/register')
      .send({
        username: newCustomerUsername,
        password: 'CustomerPass123!',
      })
      .expect(409);

    console.log('✓ Test 9 Passed: Customer self-registration forces CUSTOMER role, 409 on duplicate');

    // ----------------------------------------------------
    // 9. Admin Internal User Creation & First Login & Password Change
    // ----------------------------------------------------
    console.log('Test 10: Admin internal user creation (POST /api/users)...');
    const internalUserRes = await request(server)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Tariq',
        lastName: 'Ali',
        birthYear: 1995,
        role: 'ENGINEER',
      })
      .expect(201);

    assert(internalUserRes.body.username.startsWith('TariqAli95'), 'Username should follow format');
    assert(internalUserRes.body.temporaryPassword, 'Temporary password should be generated');
    assert.strictEqual(internalUserRes.body.role, 'ENGINEER');
    assert.strictEqual(internalUserRes.body.mustChangePassword, true);

    // Verify restricted roles cannot be created via POST /api/users
    await request(server)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ firstName: 'Illegal', lastName: 'Admin', role: 'ADMINISTRATOR' })
      .expect(400);

    await request(server)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ firstName: 'Illegal', lastName: 'Cust', role: 'CUSTOMER' })
      .expect(400);

    const generatedUsername = internalUserRes.body.username;
    const tempPassword = internalUserRes.body.temporaryPassword;

    console.log(`Internal user created: ${generatedUsername} with temp password: ${tempPassword}`);

    // First Login with temporary password
    console.log('Test 11: First login with temporary password...');
    const loginTempRes = await request(server)
      .post('/api/auth/login')
      .send({
        username: generatedUsername,
        password: tempPassword,
      })
      .expect(200);

    assert.strictEqual(loginTempRes.body.user.mustChangePassword, true);
    const tempJwt = loginTempRes.body.accessToken;

    // Password Change Flow
    console.log('Test 12: Password change flow (POST /api/auth/change-password)...');
    const changeRes = await request(server)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${tempJwt}`)
      .send({ newPassword: 'NewPermPassword123!' })
      .expect(200);

    assert.strictEqual(changeRes.body.mustChangePassword, false);

    // Verify GET /api/auth/me shows mustChangePassword = false
    const postChangeMe = await request(server)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tempJwt}`)
      .expect(200);

    assert.strictEqual(postChangeMe.body.mustChangePassword, false);

    // Login with new permanent password
    console.log('Test 13: Login with new permanent password...');
    const loginNewRes = await request(server)
      .post('/api/auth/login')
      .send({
        username: generatedUsername,
        password: 'NewPermPassword123!',
      })
      .expect(200);

    assert.strictEqual(loginNewRes.body.user.mustChangePassword, false);
    console.log('✓ Test 10-13 Passed: Internal account creation, first login, password change & permanent password verification completed successfully!');

    console.log('\n==================================================');
    console.log('ALL S1-4 AUTHENTICATION & RBAC ACCEPTANCE TESTS PASSED!');
    console.log('==================================================');
  } finally {
    if (app) await app.close();
  }
}

runAcceptanceTests().catch((err) => {
  console.error('❌ Verification test failed:', err);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
