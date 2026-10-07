import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { welcomeLogoFormat } from './welcome-logo.js';
import { MailService } from './mail.service.js';
import {
  frontendLoginUrl,
  renderWelcome,
  WELCOME_LOGO_CID,
} from './welcome.template.js';

@Injectable()
export class WelcomeService {
  private readonly logger = new Logger(WelcomeService.name);
  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(MailService) private readonly mail: MailService,
  ) {}

  /** Call only for a committed, unique account-completion transition. */
  notify(recipient: { email: string; firstName?: string | null }): void {
    // Same best-effort background promise convention as account OTP requests.
    void this.deliver(recipient).catch(() => {
      this.logger.warn(
        'Welcome email failed after account completion; account changes retained',
      );
    });
  }

  async deliver(recipient: {
    email: string;
    firstName?: string | null;
  }): Promise<void> {
    // Opt in explicitly: development/test must not accidentally send real email.
    if (this.config.get<string>('welcome.enabled') !== 'true') return;
    const url = frontendLoginUrl(
      this.config.get<string>('welcome.frontendLoginUrl'),
      this.config.get<string>('app.nodeEnv') === 'production',
    );
    // Read actual PNG bytes and attach them; recipients never need filesystem access.
    const logo = await readFile(
      resolve(this.config.get<string>('welcome.logoPath') || ''),
    );
    this.logger.log('Welcome email delivery attempted');
    const logoCid = `${randomUUID()}.${WELCOME_LOGO_CID}`;
    await this.mail.sendMail(
      {
        to: recipient.email,
        ...renderWelcome(
          recipient.firstName ?? undefined,
          url,
          `cid:${logoCid}`,
        ),
        attachments: [
          {
            ...welcomeLogoFormat(logo),
            content: logo,
            cid: logoCid,
            contentDisposition: 'inline',
          },
        ],
      },
      true,
    );
    this.logger.log('Welcome email accepted by SMTP');
  }
}
