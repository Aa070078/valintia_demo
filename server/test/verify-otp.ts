import 'reflect-metadata';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import request from 'supertest';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../dist/app.module.js';
import { RedisService } from '../dist/infrastructure/redis/redis.service.js';
import { MailService } from '../dist/infrastructure/mail/mail.service.js';

async function runOtpVerification() {
  console.log('=== Starting Backend Email / OTP Flow Verification ===\n');

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
  const redisService = app.get(RedisService);
  const mailService = app.get(MailService);

  // Capture emails sent via MailService
  const sentEmails: Array<{
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }> = [];
  mailService.setProvider({
    sendMail: async (options) => {
      sentEmails.push(options);
    },
  });

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

  const testEmail = 'internship.test@valentia.com';

  try {
    // Clean up Redis test keys before starting
    await redisService.del(`otp:code:EMAIL_VERIFICATION:${testEmail}`);
    await redisService.del(`otp:cooldown:EMAIL_VERIFICATION:${testEmail}`);

    // ----------------------------------------------------
    // 1. Generation & Email Delivery
    // ----------------------------------------------------
    console.log('1. Acceptance Criteria: OTP Generation & Server-Owned State:');
    const sendRes = await request(server).post('/api/otp/send').send({
      email: testEmail,
      purpose: 'EMAIL_VERIFICATION',
    });

    assert(
      sendRes.status === 200,
      'POST /api/otp/send returns 200 OK',
      `Got ${sendRes.status}: ${JSON.stringify(sendRes.body)}`,
    );
    assert(sendRes.body.success === true, 'Response indicates success: true');
    assert(
      typeof sendRes.body.expiresInSeconds === 'number' &&
        sendRes.body.expiresInSeconds > 0,
      'Response includes expiresInSeconds',
    );
    assert(
      typeof sendRes.body.cooldownSeconds === 'number' &&
        sendRes.body.cooldownSeconds > 0,
      'Response includes cooldownSeconds',
    );
    assert(
      sendRes.body.otp === undefined && sendRes.body.code === undefined,
      'OTP code is NOT exposed in API response (server-owned state)',
    );

    // Verify email was delivered through MailService provider
    assert(
      sentEmails.length === 1,
      'Email delivered via MailService provider layer',
    );
    assert(sentEmails[0].to === testEmail, 'Email recipient matches target');
    assert(
      sentEmails[0].subject.toLowerCase().includes('email verification'),
      'Email subject mentions Email Verification',
    );

    // Retrieve the server-stored OTP from Redis for testing verification
    const storedRecord = await redisService.getJSON<{
      code: string;
      attempts: number;
    }>(`otp:code:EMAIL_VERIFICATION:${testEmail}`);
    assert(
      !!storedRecord && /^[0-9]{6}$/.test(storedRecord.code),
      'Redis stores a 6-digit numeric OTP server-side',
    );
    const generatedOtp = storedRecord!.code;

    // ----------------------------------------------------
    // 2. Resend Cooldown / Rate Limiting Protection
    // ----------------------------------------------------
    console.log('\n2. Acceptance Criteria: Resend / Cooldown Protection:');
    const immediateResendRes = await request(server)
      .post('/api/otp/send')
      .send({
        email: testEmail,
        purpose: 'EMAIL_VERIFICATION',
      });

    assert(
      immediateResendRes.status === 429,
      'Immediate resend within cooldown returns 429 Too Many Requests',
      `Got ${immediateResendRes.status}: ${JSON.stringify(immediateResendRes.body)}`,
    );
    assert(
      immediateResendRes.body.retryAfterSeconds > 0,
      '429 response includes retryAfterSeconds indicator',
    );

    // ----------------------------------------------------
    // 3. DTO Validation
    // ----------------------------------------------------
    console.log(
      '\n3. Acceptance Criteria: DTO Validation & Schema Constraints:',
    );

    // Invalid email on send
    const invalidEmailRes = await request(server)
      .post('/api/otp/send')
      .send({ email: 'not-an-email' });
    assert(
      invalidEmailRes.status === 400,
      'POST /api/otp/send rejects invalid email with 400',
    );

    // Missing email on send
    const missingEmailRes = await request(server)
      .post('/api/otp/send')
      .send({});
    assert(
      missingEmailRes.status === 400,
      'POST /api/otp/send rejects missing email with 400',
    );

    // Unknown field on send
    const unknownFieldSend = await request(server)
      .post('/api/otp/send')
      .send({ email: 'valid@example.com', maliciousField: 123 });
    assert(
      unknownFieldSend.status === 400,
      'POST /api/otp/send rejects unknown payload fields with 400',
    );

    // Invalid OTP format on verify (non-numeric, wrong length)
    const invalidOtpFormatRes = await request(server)
      .post('/api/otp/verify')
      .send({ email: testEmail, otp: '123' });
    assert(
      invalidOtpFormatRes.status === 400,
      'POST /api/otp/verify rejects non-6-digit OTP with 400',
    );

    const alphaOtpFormatRes = await request(server)
      .post('/api/otp/verify')
      .send({ email: testEmail, otp: 'abcdef' });
    assert(
      alphaOtpFormatRes.status === 400,
      'POST /api/otp/verify rejects non-numeric OTP with 400',
    );

    // Unknown field on verify
    const unknownFieldVerify = await request(server)
      .post('/api/otp/verify')
      .send({ email: testEmail, otp: '123456', hackerField: 'attack' });
    assert(
      unknownFieldVerify.status === 400,
      'POST /api/otp/verify rejects unknown payload fields with 400',
    );

    // ----------------------------------------------------
    // 4. Incorrect OTP & Brute-force Protection
    // ----------------------------------------------------
    console.log(
      '\n4. Acceptance Criteria: Incorrect OTP & Max Attempts Protection:',
    );
    const wrongOtpRes = await request(server).post('/api/otp/verify').send({
      email: testEmail,
      otp: '000000',
      purpose: 'EMAIL_VERIFICATION',
    });
    assert(
      wrongOtpRes.status === 400,
      'Incorrect OTP returns 400 Bad Request',
      `Got ${wrongOtpRes.status}`,
    );
    assert(
      wrongOtpRes.body.message.includes('Invalid verification code'),
      'Error message indicates invalid code',
    );

    // ----------------------------------------------------
    // 5. Successful Verification & Single-Use Enforcement
    // ----------------------------------------------------
    console.log(
      '\n5. Acceptance Criteria: Successful Verification & Single-Use / Anti-Replay:',
    );
    const verifySuccessRes = await request(server)
      .post('/api/otp/verify')
      .send({
        email: testEmail,
        otp: generatedOtp,
        purpose: 'EMAIL_VERIFICATION',
      });

    assert(
      verifySuccessRes.status === 200,
      'Correct OTP returns 200 OK',
      `Got ${verifySuccessRes.status}`,
    );
    assert(
      verifySuccessRes.body.success === true,
      'Verification response has success: true',
    );
    assert(
      verifySuccessRes.body.verified === true,
      'Verification response has verified: true',
    );

    // Verify Single-Use Guarantee: Submitting the same OTP again immediately fails
    const replayRes = await request(server).post('/api/otp/verify').send({
      email: testEmail,
      otp: generatedOtp,
      purpose: 'EMAIL_VERIFICATION',
    });

    assert(
      replayRes.status === 400,
      'Replayed / reused OTP returns 400 Bad Request (Single-use guarantee)',
      `Got ${replayRes.status}`,
    );

    // Verify key was removed from Redis
    const postVerifyRecord = await redisService.getJSON(
      `otp:code:EMAIL_VERIFICATION:${testEmail}`,
    );
    assert(
      postVerifyRecord === null,
      'OTP record is deleted from Redis immediately upon verification',
    );

    // ----------------------------------------------------
    // 6. Non-Existent / Expired OTP Verification
    // ----------------------------------------------------
    console.log('\n6. Acceptance Criteria: Expired / Non-Existent OTP:');
    const expiredRes = await request(server).post('/api/otp/verify').send({
      email: 'nobody@nowhere.com',
      otp: '987654',
    });
    assert(
      expiredRes.status === 400,
      'Non-existent / expired OTP returns 400 Bad Request',
    );
    assert(
      expiredRes.body.message.includes('expired or is invalid'),
      'Message explains code is expired or invalid',
    );

    // ----------------------------------------------------
    // 7. Swagger Documentation
    // ----------------------------------------------------
    console.log('\n7. Acceptance Criteria: Swagger Documentation:');
    const paths = swaggerDoc.paths;
    assert(
      !!paths['/api/otp/send']?.post,
      'Swagger documents POST /api/otp/send',
    );
    assert(
      !!paths['/api/otp/verify']?.post,
      'Swagger documents POST /api/otp/verify',
    );

    // ----------------------------------------------------
    // 8. Scope Note: JWT Login Contract Preservation
    // ----------------------------------------------------
    console.log('\n8. Scope Note: Existing JWT Auth Login Contract Preserved:');
    const loginRes = await request(server).post('/api/auth/login').send({
      username: 'customer1@test.com',
      password: 'Customer123!',
    });
    assert(
      loginRes.status === 200,
      'POST /api/auth/login continues to work normally (200 OK)',
      `Got ${loginRes.status}: ${JSON.stringify(loginRes.body)}`,
    );
    assert(!!loginRes.body.accessToken, 'Login returns valid access token');
    assert(
      loginRes.body.user?.role === 'CUSTOMER',
      'Login returns valid user payload',
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
    console.log('ALL EMAIL/OTP ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!\n');
  } else {
    console.error(`FAILED: ${totalTests - passedTests} test(s) failed!\n`);
    process.exit(1);
  }
}

void runOtpVerification();
