import assert from 'node:assert/strict';
import { afterEach, beforeEach, mock, test } from 'node:test';
import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { MailService } from '../dist/infrastructure/mail/mail.service.js';
import { mailConfig } from '../dist/infrastructure/config/configuration.js';

// Stub only the SMTP boundary. Never connect to Gmail or use local credentials.
const from = 'Valentia <sender@example.com>';
const settings = () => ({
  mail: {
    from,
    smtp: {
      host: 'smtp.example.com',
      port: 587,
      secure: 'false',
      user: 'smtp-test-user',
      pass: 'smtp-test-password',
    },
  },
});
let options: any;
let sent: any[];
let failure: unknown;
let logs: string[];
let savedNodeEnv: string | undefined;

beforeEach(() => {
  savedNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  sent = [];
  logs = [];
  failure = undefined;
  mock.method(nodemailer, 'createTransport', (config: unknown) => {
    options = config;
    return {
      sendMail: async (message: unknown) => {
        if (failure) throw failure;
        sent.push(message);
      },
    } as any;
  });
  mock.method(Logger.prototype, 'log', (message: unknown) => {
    logs.push(String(message));
  });
  mock.method(Logger.prototype, 'error', (message: unknown) => {
    logs.push(String(message));
  });
});
afterEach(() => {
  mock.restoreAll();
  if (savedNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = savedNodeEnv;
});

test('SMTP configuration reads only the six requested environment variables', () => {
  const keys = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_SECURE',
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_FROM',
  ];
  const saved = keys.map((key) => [key, process.env[key]] as const);
  try {
    Object.assign(process.env, {
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: '587',
      SMTP_SECURE: 'false',
      SMTP_USER: 'test-user',
      SMTP_PASS: 'test-pass',
      SMTP_FROM: from,
    });
    const config = mailConfig();
    assert.deepEqual(config, {
      from,
      smtp: {
        host: 'smtp.example.com',
        port: 587,
        secure: 'false',
        user: 'test-user',
        pass: 'test-pass',
      },
    });
  } finally {
    for (const [key, value] of saved)
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
  }
});

test('initialization rejects missing/invalid SMTP configuration without contacting the server', () => {
  for (const [field, env] of [
    ['from', 'SMTP_FROM'],
    ['host', 'SMTP_HOST'],
    ['user', 'SMTP_USER'],
    ['pass', 'SMTP_PASS'],
    ['port', 'SMTP_PORT'],
    ['secure', 'SMTP_SECURE'],
  ] as const) {
    const config = settings();
    if (field === 'from') (config.mail as any).from = undefined;
    else (config.mail.smtp as any)[field] = undefined;
    assert.throws(
      () => new MailService(new ConfigService(config)),
      new RegExp(env),
    );
  }
  for (const port of [0, -1, 65536, 1.5, NaN]) {
    const config = settings();
    config.mail.smtp.port = port;
    assert.throws(
      () => new MailService(new ConfigService(config)),
      /SMTP_PORT/,
    );
  }
  for (const secure of ['', 'yes', 'FALSE']) {
    const config = settings();
    config.mail.smtp.secure = secure;
    assert.throws(
      () => new MailService(new ConfigService(config)),
      /SMTP_SECURE/,
    );
  }
  assert.equal(sent.length, 0);
});

test('transport preserves OTP subject/body, SMTP_FROM and arbitrary Gmail/Outlook recipients with STARTTLS', async () => {
  const mail = new MailService(new ConfigService(settings()));
  assert.equal(options.host, 'smtp.example.com');
  assert.equal(options.port, 587);
  assert.equal(options.secure, false);
  assert.equal(options.requireTLS, true);
  assert.deepEqual(options.auth, {
    user: 'smtp-test-user',
    pass: 'smtp-test-password',
  });
  assert.equal(options.logger, false);
  assert.equal(options.debug, false);
  for (const to of ['recipient@gmail.com', 'recipient@outlook.com']) {
    await mail.sendOtpEmail(to, '482910', 'email_verification', 5);
    const message = sent.at(-1);
    assert.equal(message.to, to);
    assert.equal(message.from, from);
    assert.equal(
      message.subject,
      'Your Valentia Email Verification Code: 482910',
    );
    assert.equal(
      message.text,
      'Hello,\n\nYour one-time verification code for Valentia (Email Verification) is:\n\n482910\n\nThis code will expire in 5 minutes.\n\nPlease do not share this code with anyone.\n\nIf you did not request this email, please ignore this message.\n\nBest regards,\nValentia Team',
    );
    assert.match(message.html, /482910/);
    assert.match(message.html, /Email Verification/);
    assert.match(message.html, /Valentia — Design & Build/);
  }
  assert.ok(!logs.join(' ').includes('482910'));
  const config = settings();
  config.mail.smtp.secure = 'true';
  config.mail.smtp.port = 465;
  new MailService(new ConfigService(config));
  assert.equal(options.secure, true);
  assert.equal(options.requireTLS, false);
});

test('SMTP failure exposes generic 503 and logs only safe diagnostic codes, never OTP/auth/provider text', async () => {
  const mail = new MailService(new ConfigService(settings()));
  failure = Object.assign(
    new Error(
      'smtp-test-password smtp-test-user 482910 private-provider-response',
    ),
    { code: 'EAUTH', responseCode: 535, response: 'private-provider-response' },
  );
  await assert.rejects(
    mail.sendOtpEmail('recipient@gmail.com', '482910'),
    (error: any) => {
      assert.ok(error instanceof ServiceUnavailableException);
      assert.equal(error.getStatus(), 503);
      assert.deepEqual(error.getResponse(), {
        statusCode: 503,
        error: 'Service Unavailable',
        message:
          'Email delivery is temporarily unavailable. Please try again later.',
      });
      return true;
    },
  );
  assert.match(logs.join(' '), /code=EAUTH, responseCode=535/);
  for (const secret of [
    'smtp-test-password',
    'smtp-test-user',
    '482910',
    'private-provider-response',
  ])
    assert.ok(!logs.join(' ').includes(secret));
  failure = { code: '482910', responseCode: 'smtp-test-password' };
  await assert.rejects(
    mail.sendOtpEmail('recipient@outlook.com', '482910'),
    ServiceUnavailableException,
  );
  assert.match(logs.at(-1)!, /code=UNKNOWN, responseCode=unknown/);
});

test('existing sendMail and setProvider interfaces remain available for isolated callers/mocks', async () => {
  const mail = new MailService(new ConfigService(settings()));
  mail.setProvider({
    sendMail: async (message: unknown) => {
      sent.push(message);
    },
  });
  await mail.sendMail({
    to: 'recipient@example.com',
    subject: 'Test',
    text: 'Plain text',
  });
  assert.equal(sent[0].from, from);
  assert.equal(sent[0].text, 'Plain text');
});

test('strict welcome delivery reports development SMTP failures while legacy OTP behavior remains unchanged', async () => {
  process.env.NODE_ENV = 'development';
  const mail = new MailService(new ConfigService(settings()));
  failure = { code: 'ECONNECTION', responseCode: 421 };
  await mail.sendOtpEmail('recipient@example.com', '482910');
  await assert.rejects(
    mail.sendMail(
      { to: 'recipient@example.com', subject: 'Welcome', text: 'Test' },
      true,
    ),
    ServiceUnavailableException,
  );
});
