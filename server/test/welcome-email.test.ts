import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test, mock, afterEach } from 'node:test';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { welcomeLogoFormat } from '../dist/infrastructure/mail/welcome-logo.js';
import { AuthService } from '../dist/auth/auth.service.js';
import { OnboardingService } from '../dist/auth/onboarding.service.js';
import { WelcomeService } from '../dist/infrastructure/mail/welcome.service.js';
import {
  renderWelcome,
  frontendLoginUrl,
  WELCOME_LOGO_CID,
  WELCOME_SUBJECT,
} from '../dist/infrastructure/mail/welcome.template.js';

// Pure adapter tests: no real database, Redis, SMTP, or environment credentials.
afterEach(() => mock.restoreAll());
const logoPath = resolve('dist/assets/brand/valentia-logo.png');
const config = (values = {}) =>
  new ConfigService({
    app: { nodeEnv: 'development' },
    welcome: {
      enabled: 'true',
      frontendLoginUrl: 'http://localhost:3000/login',
      logoPath,
    },
    ...values,
  });
const tick = () => new Promise((done) => setTimeout(done, 20));
const actor = {
  id: 1,
  sub: 1,
  role: 'ENGINEER',
  onboardingSession: true,
  onboardingVersion: 'generation',
} as any;

async function onboardingFixture(
  options: {
    verified?: boolean;
    changed?: boolean;
    rollback?: boolean;
    failMail?: boolean;
  } = {},
) {
  let row: any = {
    id: 1,
    username: 'Omar Hassan',
    role: 'ENGINEER',
    email: options.verified ? 'staff@example.com' : null,
    emailVerified: !!options.verified,
    mustChangePassword: !options.changed,
    passwordHash: await bcrypt.hash('Temporary123!', 4),
    onboardingVersion: 'generation',
    temporaryCredentialsExpiresAt: new Date(Date.now() + 60000),
  };
  let committed = false;
  let pending = Promise.resolve();
  const deliveries: any[] = [];
  const mail = {
    sendMail: async (message: any) => {
      assert.equal(committed, true, 'SMTP must run after transaction commit');
      deliveries.push(message);
      if (options.failMail) throw new Error('simulated SMTP failure');
    },
  };
  const welcome = new WelcomeService(config(), mail as any);
  const prisma = {
    $transaction: async (work: any) => {
      // Model the existing database row lock for competing completion requests.
      const before = pending;
      let release!: () => void;
      pending = new Promise<void>((done) => {
        release = done;
      });
      await before;
      try {
        const staged = { ...row };
        const result = await work({
          $queryRaw: async () => [],
          user: {
            findUnique: async ({ where }: any) =>
              where.id ? { ...staged } : null,
            update: async ({ data }: any) => Object.assign(staged, data),
          },
        });
        if (options.rollback) throw new Error('simulated commit failure');
        row = staged;
        committed = true;
        return result;
      } finally {
        release();
      }
    },
  };
  return {
    service: new OnboardingService(
      prisma as any,
      { verifyOtp: async () => true } as any,
      welcome,
    ),
    deliveries,
    row: () => row,
  };
}

test('Arabic precedes English, exact bilingual copy, matching buttons, escaped first name only', () => {
  const { html, text, subject } = renderWelcome(
    '<Omar> Last',
    'https://app.example.org/login?a=1&b=2',
  );
  assert.equal(subject, WELCOME_SUBJECT);
  assert.ok(
    html.indexOf('lang="ar" dir="rtl"') < html.indexOf('lang="en" dir="ltr"'),
  );
  assert.ok(html.includes('أهلًا بك، &lt;Omar&gt;'));
  assert.ok(html.includes('Welcome aboard, &lt;Omar&gt;'));
  assert.equal(
    (html.match(/href="https:\/\/app.example.org\/login\?a=1&amp;b=2"/g) || [])
      .length,
    2,
  );
  for (const phrase of [
    'فالنتيا',
    'التصميم والبناء',
    'ابدأ الآن',
    'VALENTIA',
    'DESIGN &amp; BUILD',
    'Get started',
    `cid:${WELCOME_LOGO_CID}`,
  ])
    assert.ok(html.includes(phrase));
  assert.ok(
    text.includes('التصميم والبناء') && text.includes('DESIGN & BUILD'),
  );
  assert.ok(!html.includes('Last') && !html.includes('Valencia'));
  assert.ok(
    !renderWelcome(
      'email@example.com',
      'http://localhost:3000/login',
    ).html.includes('email@example.com'),
  );
});

test('production URL validation blocks placeholders before email delivery', async () => {
  for (const value of [
    undefined,
    '{{FrontendLoginUrl}}',
    'javascript:alert(1)',
    'http://localhost:3000/login',
    'https://localhost/login',
    'https://example.com/login',
    'https://foo.test/login',
    'https://127.0.0.1/login',
    'https://user:pass@company.com/login',
  ])
    assert.throws(() => frontendLoginUrl(value, true));
  assert.equal(
    frontendLoginUrl('https://portal.valentia-company.com/login', true),
    'https://portal.valentia-company.com/login',
  );
  let calls = 0;
  const service = new WelcomeService(
    config({ app: { nodeEnv: 'production' } }),
    {
      sendMail: async () => {
        calls++;
      },
    } as any,
  );
  await assert.rejects(service.deliver({ email: 'staff@example.com' }));
  assert.equal(calls, 0);
});

test('logo MIME detection follows magic bytes rather than the misleading source filename', () => {
  assert.deepEqual(
    welcomeLogoFormat(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    { filename: 'valentia-logo.png', contentType: 'image/png' },
  );
  assert.deepEqual(welcomeLogoFormat(Buffer.from([255, 216, 255, 224])), {
    filename: 'valentia-logo.jpg',
    contentType: 'image/jpeg',
  });
  assert.throws(() => welcomeLogoFormat(Buffer.from('not an image')));
});

test('disabled delivery does not read assets or call SMTP', async () => {
  let calls = 0;
  const service = new WelcomeService(
    config({ welcome: { enabled: 'false', logoPath: 'missing' } }),
    {
      sendMail: async () => {
        calls++;
      },
    } as any,
  );
  await service.deliver({ email: 'client@example.com' });
  assert.equal(calls, 0);
});

test('actual unchanged JPEG logo is bundled and sent with matching MIME and filename', async () => {
  let message: any;
  let strict: unknown;
  const service = new WelcomeService(config(), {
    sendMail: async (m: any, s: unknown) => {
      message = m;
      strict = s;
    },
  } as any);
  await service.deliver({
    email: 'recipient@example.com',
    firstName: 'Omar Hassan',
  });
  const original = readFileSync(resolve('../assets/brand/valentia-logo.png'));
  assert.deepEqual(readFileSync(logoPath), original);
  assert.deepEqual(message.attachments[0].content, original);
  assert.equal(original.subarray(0, 3).toString('hex'), 'ffd8ff');
  assert.equal(message.attachments[0].contentType, 'image/jpeg');
  assert.equal(message.attachments[0].filename, 'valentia-logo.jpg');
  assert.ok(message.attachments[0].cid.endsWith(`.${WELCOME_LOGO_CID}`));
  assert.ok(message.html.includes(`src="cid:${message.attachments[0].cid}"`));
  assert.equal(message.attachments[0].contentDisposition, 'inline');
  assert.equal(strict, true);
  assert.ok(message.text.includes('Omar') && message.html.includes('cid:'));
  for (const value of [
    message.to,
    'Hassan',
    'ENGINEER',
    'password',
    'verificationToken',
  ])
    assert.ok(!message.html.includes(value));
});

test('serialized email contains matching globally unique Content-ID and correctly typed JPEG bytes', async () => {
  const transport = nodemailer.createTransport({
    streamTransport: true,
    buffer: true,
    newline: 'unix',
  });
  const messages: Buffer[] = [];
  const service = new WelcomeService(config(), {
    sendMail: async (options: any) => {
      const result = await transport.sendMail({
        ...options,
        from: 'sender@example.com',
      });
      messages.push(result.message as Buffer);
    },
  } as any);
  await service.deliver({ email: 'recipient@example.com', firstName: 'Omar' });
  await service.deliver({ email: 'recipient@example.com', firstName: 'Omar' });
  const ids: string[] = [];
  for (const bytes of messages) {
    const mime = bytes.toString();
    assert.match(mime, /Content-Type: multipart\/related/);
    const headers = mime.replace(/\r?\n[ \t]+/g, ' ');
    const id = headers.match(/Content-ID: <([^>]+)>/)?.[1];
    assert.ok(id && /^[^\s<>@]+@[^\s<>@]+$/.test(id));
    ids.push(id);
    // HTML is quoted-printable; unfold soft line breaks and decode ASCII escapes.
    const decoded = mime
      .replace(/=\r?\n/g, '')
      .replace(/=([0-9A-F]{2})/g, (_, hex: string) =>
        String.fromCharCode(parseInt(hex, 16)),
      );
    assert.ok(decoded.includes(`src="cid:${id}"`));
    const image = mime.match(
      /Content-Type: image\/jpeg; name=valentia-logo.jpg[^]*?Content-Disposition: inline[^]*?\r?\n\r?\n([A-Za-z0-9+/=\r\n]+)\r?\n--/,
    );
    assert.ok(image, 'JPEG must be an inline MIME part with matching filename');
    assert.deepEqual(
      Buffer.from(image[1].replace(/\s/g, ''), 'base64'),
      readFileSync(logoPath),
    );
  }
  assert.notEqual(ids[0], ids[1]);
});

test('verified registration sends after unique insert; repeated registration sends nothing more', async () => {
  let created: any = null;
  const recipients: any[] = [];
  const prisma = {
    user: {
      findUnique: async () => created,
      create: async ({ data }: any) =>
        (created = { ...data, id: 8, createdAt: new Date() }),
    },
  };
  const service = new AuthService(
    prisma as any,
    null as any,
    { verify: async () => true } as any,
    null as any,
    null as any,
    null as any,
    null as any,
    {
      notify: (r: any) => {
        assert.ok(created);
        recipients.push(r);
      },
    } as any,
  );
  const dto = {
    username: 'client@example.com',
    password: 'NewPassword123!',
    verificationToken: 'test-proof',
    firstName: 'Omar',
  };
  await service.register(dto);
  assert.equal(created.emailVerified, true);
  assert.deepEqual(recipients, [
    { email: 'client@example.com', firstName: 'Omar' },
  ]);
  await assert.rejects(service.register(dto));
  assert.equal(recipients.length, 1);
});

test('invalid registration proof or failed insert never schedules welcome', async () => {
  for (const gate of ['proof', 'insert']) {
    let notifications = 0;
    const service = new AuthService(
      {
        user: {
          findUnique: async () => null,
          create: async () => {
            throw new Error('insert failed');
          },
        },
      } as any,
      null as any,
      {
        verify: async () => {
          if (gate === 'proof') throw new Error('invalid proof');
        },
      } as any,
      null as any,
      null as any,
      null as any,
      null as any,
      {
        notify: () => {
          notifications++;
        },
      } as any,
    );
    await assert.rejects(
      service.register({
        username: 'client@example.com',
        password: 'Password123!',
        verificationToken: 'proof',
      }),
    );
    assert.equal(notifications, 0);
  }
});

test('email-first staff welcomes only after password commit and repeated scoped requests fail', async () => {
  const f = await onboardingFixture();
  const partial = await f.service.verifyEmail(
    actor,
    'staff@example.com',
    '111111',
  );
  assert.equal(partial.onboardingComplete, false);
  await tick();
  assert.equal(f.deliveries.length, 0);
  const complete = await f.service.changePassword(actor, 'Permanent123!');
  assert.equal(complete.onboardingComplete, true);
  await tick();
  assert.equal(f.deliveries.length, 1);
  await assert.rejects(f.service.changePassword(actor, 'Different123!'));
  await tick();
  assert.equal(f.deliveries.length, 1);
});

test('password-first staff welcomes only after email-verification transaction commits', async () => {
  const f = await onboardingFixture();
  await f.service.changePassword(actor, 'Permanent123!');
  await tick();
  assert.equal(f.deliveries.length, 0);
  const result = await f.service.verifyEmail(
    actor,
    'staff@example.com',
    '111111',
  );
  assert.equal(result.onboardingComplete, true);
  await tick();
  assert.equal(f.deliveries.length, 1);
  await assert.rejects(
    f.service.verifyEmail(actor, 'staff@example.com', '111111'),
  );
  assert.equal(f.deliveries.length, 1);
});

test('competing staff completion requests deliver once', async () => {
  const f = await onboardingFixture({ verified: true });
  const outcomes = await Promise.allSettled([
    f.service.changePassword(actor, 'Permanent123!'),
    f.service.changePassword(actor, 'Different123!'),
  ]);
  assert.equal(outcomes.filter((r) => r.status === 'fulfilled').length, 1);
  await tick();
  assert.equal(f.deliveries.length, 1);
});

test('ordinary password change on completed staff sends no welcome', async () => {
  const f = await onboardingFixture({ verified: true, changed: true });
  await f.service.changePassword(
    { ...actor, onboardingSession: false },
    'Permanent123!',
  );
  await tick();
  assert.equal(f.deliveries.length, 0);
});

test('failed transaction sends nothing; SMTP failure retains completed onboarding and is caught safely', async () => {
  const rollback = await onboardingFixture({ verified: true, rollback: true });
  await assert.rejects(rollback.service.changePassword(actor, 'Permanent123!'));
  await tick();
  assert.equal(rollback.deliveries.length, 0);
  assert.equal(rollback.row().mustChangePassword, true);
  const logs: string[] = [];
  mock.method(Logger.prototype, 'warn', (m: unknown) => logs.push(String(m)));
  const f = await onboardingFixture({ verified: true, failMail: true });
  const result = await f.service.changePassword(actor, 'Permanent123!');
  assert.equal(result.onboardingComplete, true);
  await tick();
  assert.equal(f.row().mustChangePassword, false);
  assert.ok(logs.some((m) => m.includes('account changes retained')));
  assert.ok(!logs.join().includes('staff@example.com'));
  await assert.rejects(f.service.changePassword(actor, 'Different123!'));
  assert.equal(f.deliveries.length, 1);
});

test('welcome background failure does not fail successful registration', async () => {
  mock.method(Logger.prototype, 'warn', () => {});
  const welcome = new WelcomeService(config(), {
    sendMail: async () => {
      throw new Error('failure');
    },
  } as any);
  const service = new AuthService(
    {
      user: {
        findUnique: async () => null,
        create: async ({ data }: any) => ({ ...data, id: 4 }),
      },
    } as any,
    null as any,
    { verify: async () => true } as any,
    null as any,
    null as any,
    null as any,
    null as any,
    welcome,
  );
  const result = await service.register({
    username: 'client@example.com',
    password: 'Password123!',
    verificationToken: 'proof',
  });
  assert.equal(result.id, 4);
  await tick();
});
