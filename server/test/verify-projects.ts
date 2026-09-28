import 'reflect-metadata';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '../dist/app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function runVerification() {
  console.log('--- Starting Projects API Verification ---');

  const app: INestApplication = await NestFactory.create(AppModule, {
    logger: false,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Valentia API')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);

  await app.init();
  const server = app.getHttpServer();

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
      process.exitCode = 1;
    }
  }

  try {
    // 0. Authenticate test personas
    console.log('\n0. Authenticating Personas:');
    const login = async (username: string, password: string) => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({ username, password });
      return { token: res.body.accessToken as string, user: res.body.user };
    };

    const customer1 = await login('customer1@test.com', 'Customer123!');
    const customer2 = await login('customer2@test.com', 'Customer123!');
    const engineer1 = await login('engineer1@test.com', 'Engineer123!');
    const engineer2 = await login('engineer2@test.com', 'Engineer123!');
    const pm = await login('pm@test.com', 'ProjectManager123!');
    const admin = await login('admin@test.com', 'Admin123!');

    assert(!!customer1.token && !!customer1.user, 'Customer 1 login');
    assert(!!customer2.token && !!customer2.user, 'Customer 2 login');
    assert(!!engineer1.token && !!engineer1.user, 'Engineer 1 login');
    assert(!!pm.token && !!pm.user, 'PM login');
    assert(!!admin.token && !!admin.user, 'Admin login');

    // 1. POST /api/projects creates a Draft project for current Client
    console.log(
      '\n1. Acceptance Criteria 1: POST /api/projects creates a Draft project for current Client:',
    );
    const createRes = await request(server)
      .post('/api/projects')
      .set('Authorization', `Bearer ${customer1.token}`)
      .send({
        title: 'New Cairo Luxury Duplex',
        notes: 'Full turnkey finishing with Italian marble',
        property: {
          propertyType: 'DUPLEX',
          areaSqm: 320.75,
          city: 'New Cairo',
          compound: 'Mivida',
        },
        spaces: [
          { type: 'LIVING_ROOM' },
          { type: 'KITCHEN' },
          { type: 'MASTER_BEDROOM' },
          { type: 'BALCONY' },
        ],
      });

    assert(
      createRes.status === 201,
      'POST /api/projects returns 201 Created',
      `Got ${createRes.status}: ${JSON.stringify(createRes.body)}`,
    );
    assert(
      createRes.body.title === 'New Cairo Luxury Duplex',
      'Project title matches request',
    );
    assert(createRes.body.status === 'DRAFT', 'Project status is DRAFT');
    assert(
      createRes.body.clientId === customer1.user.id,
      'Project clientId matches authenticated customer',
    );
    assert(
      createRes.body.property?.city === 'New Cairo',
      'Property details populated correctly',
    );
    assert(
      Number(createRes.body.property?.areaSqm) === 320.75,
      'Property areaSqm is 320.75',
    );
    assert(
      Array.isArray(createRes.body.spaces) &&
        createRes.body.spaces.length === 4,
      'Spaces created with 4 items',
    );

    const createdProjectId = createRes.body.id as number;

    // 2. DTO validation rejects invalid / unknown fields
    console.log(
      '\n2. Acceptance Criteria 5: DTO validation rejects invalid/unknown fields:',
    );

    // 2a. Unknown field on POST
    const unknownFieldRes = await request(server)
      .post('/api/projects')
      .set('Authorization', `Bearer ${customer1.token}`)
      .send({
        title: 'Unknown Field Project',
        maliciousField: 'exploit',
      });
    assert(
      unknownFieldRes.status === 400,
      'POST /api/projects rejects unknown root fields with 400',
      `Got ${unknownFieldRes.status}`,
    );

    // 2b. Missing required title
    const missingTitleRes = await request(server)
      .post('/api/projects')
      .set('Authorization', `Bearer ${customer1.token}`)
      .send({
        notes: 'Missing title',
      });
    assert(
      missingTitleRes.status === 400,
      'POST /api/projects rejects missing title with 400',
      `Got ${missingTitleRes.status}`,
    );

    // 2c. Invalid SpaceType enum
    const invalidEnumRes = await request(server)
      .post('/api/projects')
      .set('Authorization', `Bearer ${customer1.token}`)
      .send({
        title: 'Invalid Enum Project',
        spaces: [{ type: 'SECRET_DUNGEON' }],
      });
    assert(
      invalidEnumRes.status === 400,
      'POST /api/projects rejects invalid SpaceType with 400',
      `Got ${invalidEnumRes.status}`,
    );

    // 2d. Unknown field in nested property DTO
    const unknownNestedRes = await request(server)
      .post('/api/projects')
      .set('Authorization', `Bearer ${customer1.token}`)
      .send({
        title: 'Invalid Nested Property',
        property: {
          propertyType: 'VILLA',
          areaSqm: 200,
          city: 'Cairo',
          extraHackerKey: 'attack',
        },
      });
    assert(
      unknownNestedRes.status === 400,
      'POST /api/projects rejects unknown nested property fields with 400',
      `Got ${unknownNestedRes.status}`,
    );

    // 2e. Negative areaSqm
    const negativeAreaRes = await request(server)
      .post('/api/projects')
      .set('Authorization', `Bearer ${customer1.token}`)
      .send({
        title: 'Negative Area Project',
        property: {
          propertyType: 'VILLA',
          areaSqm: -50,
          city: 'Cairo',
        },
      });
    assert(
      negativeAreaRes.status === 400,
      'POST /api/projects rejects negative areaSqm with 400',
      `Got ${negativeAreaRes.status}`,
    );

    // 2f. Unknown field on PATCH
    const patchUnknownRes = await request(server)
      .patch(`/api/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${customer1.token}`)
      .send({
        unknownPatchField: 999,
      });
    assert(
      patchUnknownRes.status === 400,
      'PATCH /api/projects/:id rejects unknown fields with 400',
      `Got ${patchUnknownRes.status}`,
    );

    // 3. GET /api/projects returns only projects authorized for current role
    console.log(
      '\n3. Acceptance Criteria 2: GET /api/projects returns only projects authorized for current role:',
    );

    // Customer 1
    const c1ProjectsRes = await request(server)
      .get('/api/projects')
      .set('Authorization', `Bearer ${customer1.token}`);
    assert(
      c1ProjectsRes.status === 200,
      'Customer 1 GET /api/projects returns 200',
    );
    assert(
      c1ProjectsRes.body.every((p: any) => p.clientId === customer1.user.id),
      'Customer 1 only receives their own projects',
    );
    assert(
      c1ProjectsRes.body.some((p: any) => p.id === createdProjectId),
      'Customer 1 list contains newly created project',
    );

    // Customer 2
    const c2ProjectsRes = await request(server)
      .get('/api/projects')
      .set('Authorization', `Bearer ${customer2.token}`);
    assert(
      c2ProjectsRes.status === 200,
      'Customer 2 GET /api/projects returns 200',
    );
    assert(
      !c2ProjectsRes.body.some((p: any) => p.id === createdProjectId),
      'Customer 2 list does NOT contain Customer 1 project',
    );

    // Engineer 1 (assigned to project 1 in seed)
    const eng1ProjectsRes = await request(server)
      .get('/api/projects')
      .set('Authorization', `Bearer ${engineer1.token}`);
    assert(
      eng1ProjectsRes.status === 200,
      'Engineer 1 GET /api/projects returns 200',
    );
    assert(
      eng1ProjectsRes.body.every(
        (p: any) => p.assignment?.engineerId === engineer1.user.id,
      ),
      'Engineer 1 only receives assigned projects',
    );

    // PM & Admin see all projects
    const pmProjectsRes = await request(server)
      .get('/api/projects')
      .set('Authorization', `Bearer ${pm.token}`);
    assert(pmProjectsRes.status === 200, 'PM GET /api/projects returns 200');
    assert(
      pmProjectsRes.body.length >= 3,
      `PM sees all projects (count: ${pmProjectsRes.body.length})`,
    );

    // 4. GET /api/projects/:id returns authorized project detail
    console.log(
      '\n4. Acceptance Criteria 3: GET /api/projects/:id returns authorized project detail:',
    );

    // Customer 1 accessing own project -> 200
    const ownProjRes = await request(server)
      .get(`/api/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${customer1.token}`);
    assert(
      ownProjRes.status === 200,
      'Customer gets own project detail with 200',
    );
    assert(
      ownProjRes.body.id === createdProjectId,
      'Returned project ID matches',
    );
    assert(
      ownProjRes.body.property?.city === 'New Cairo',
      'Includes property relation',
    );
    assert(ownProjRes.body.spaces?.length === 4, 'Includes spaces relation');

    // Customer 2 accessing Customer 1 project -> 403 Forbidden
    const forbiddenProjRes = await request(server)
      .get(`/api/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${customer2.token}`);
    assert(
      forbiddenProjRes.status === 403,
      'Customer 2 accessing Customer 1 project returns 403 Forbidden',
      `Got ${forbiddenProjRes.status}`,
    );

    // Engineer 2 accessing unassigned project -> 403 Forbidden
    const engForbiddenRes = await request(server)
      .get(`/api/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${engineer2.token}`);
    assert(
      engForbiddenRes.status === 403,
      'Unassigned engineer accessing project returns 403 Forbidden',
      `Got ${engForbiddenRes.status}`,
    );

    // PM accessing project -> 200 OK
    const pmGetRes = await request(server)
      .get(`/api/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${pm.token}`);
    assert(pmGetRes.status === 200, 'PM accessing any project returns 200 OK');

    // Non-existent ID -> 404
    const notFoundRes = await request(server)
      .get('/api/projects/999999')
      .set('Authorization', `Bearer ${admin.token}`);
    assert(
      notFoundRes.status === 404,
      'Non-existent project ID returns 404 Not Found',
      `Got ${notFoundRes.status}`,
    );

    // 5. PATCH /api/projects/:id updates editable Draft data
    console.log(
      '\n5. Acceptance Criteria 4: PATCH /api/projects/:id updates editable Draft data:',
    );

    // Customer 1 updates own DRAFT project
    const patchRes = await request(server)
      .patch(`/api/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${customer1.token}`)
      .send({
        title: 'Updated Mivida Villa',
        notes: 'Upgraded specifications with smart home automation',
        property: {
          areaSqm: 350.0,
          compound: 'Mivida Parc Central',
        },
        spaces: [{ type: 'LIVING_ROOM' }, { type: 'MASTER_BEDROOM' }],
      });

    assert(
      patchRes.status === 200,
      'PATCH /api/projects/:id returns 200 OK',
      `Got ${patchRes.status}`,
    );
    assert(
      patchRes.body.title === 'Updated Mivida Villa',
      'Project title updated',
    );
    assert(
      patchRes.body.notes ===
        'Upgraded specifications with smart home automation',
      'Project notes updated',
    );
    assert(
      Number(patchRes.body.property?.areaSqm) === 350.0,
      'Property areaSqm updated to 350',
    );
    assert(
      patchRes.body.property?.compound === 'Mivida Parc Central',
      'Property compound updated',
    );
    assert(
      patchRes.body.spaces?.length === 2,
      'Spaces replaced with updated 2 items',
    );

    // Customer 2 tries to PATCH Customer 1 project -> 403 Forbidden
    const patchForbiddenRes = await request(server)
      .patch(`/api/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${customer2.token}`)
      .send({
        title: 'Hacked Title',
      });
    assert(
      patchForbiddenRes.status === 403,
      'Customer 2 updating Customer 1 project returns 403 Forbidden',
      `Got ${patchForbiddenRes.status}`,
    );

    // Engineer tries to PATCH draft project -> 403 Forbidden
    const patchEngForbidden = await request(server)
      .patch(`/api/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${engineer1.token}`)
      .send({
        title: 'Engineer Edited Title',
      });
    assert(
      patchEngForbidden.status === 403,
      'Engineer updating draft project returns 403 Forbidden',
      `Got ${patchEngForbidden.status}`,
    );

    // Attempt to PATCH a SUBMITTED project (Project ID 2 from seed is SUBMITTED)
    const patchSubmittedRes = await request(server)
      .patch('/api/projects/2')
      .set('Authorization', `Bearer ${customer2.token}`)
      .send({
        title: 'Trying to update submitted project',
      });
    assert(
      patchSubmittedRes.status === 400,
      'PATCH on non-DRAFT (SUBMITTED) project returns 400 Bad Request',
      `Got ${patchSubmittedRes.status}`,
    );

    // 6. Swagger Documentation
    console.log(
      '\n6. Acceptance Criteria 6: Endpoints documented with Swagger:',
    );
    const projectPaths = swaggerDoc.paths;
    assert(
      !!projectPaths['/api/projects']?.post,
      'Swagger documents POST /api/projects',
    );
    assert(
      !!projectPaths['/api/projects']?.get,
      'Swagger documents GET /api/projects',
    );
    assert(
      !!projectPaths['/api/projects/{id}']?.get,
      'Swagger documents GET /api/projects/{id}',
    );
    assert(
      !!projectPaths['/api/projects/{id}']?.patch,
      'Swagger documents PATCH /api/projects/{id}',
    );
    assert(
      !!projectPaths['/api/projects/{id}/assign']?.post,
      'Swagger documents POST /api/projects/{id}/assign',
    );

    // 7. Unauthenticated requests return 401
    console.log('\n7. Unauthenticated requests return 401:');
    const unauthGet = await request(server).get('/api/projects');
    assert(
      unauthGet.status === 401,
      'Unauthenticated GET /api/projects returns 401',
    );

    const unauthPost = await request(server)
      .post('/api/projects')
      .send({ title: 'No auth' });
    assert(
      unauthPost.status === 401,
      'Unauthenticated POST /api/projects returns 401',
    );

    const unauthPatch = await request(server)
      .patch(`/api/projects/${createdProjectId}`)
      .send({ title: 'No auth' });
    assert(
      unauthPatch.status === 401,
      'Unauthenticated PATCH /api/projects/:id returns 401',
    );
  } catch (err) {
    console.error('Test execution error:', err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }

  console.log(
    `\n--- Verification Summary: ${passedTests}/${totalTests} passed ---`,
  );
  if (passedTests === totalTests) {
    console.log(
      'ALL PROJECTS API ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!\n',
    );
  } else {
    console.error(`FAILED: ${totalTests - passedTests} test(s) failed!\n`);
    process.exit(1);
  }
}

void runVerification();
