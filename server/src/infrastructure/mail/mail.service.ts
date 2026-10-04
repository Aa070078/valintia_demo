import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import type { MailProvider, SendMailOptions } from './mail.interfaces.js';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private provider: MailProvider;
  private readonly from: string;

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {
    this.from = this.required('mail.from', 'SMTP_FROM');
    this.provider = this.createProvider();
  }

  private required(key: string, name: string): string {
    const value = this.configService.get<string>(key);
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`${name} is required for SMTP email delivery`);
    }
    return value;
  }

  /** Validate locally at initialization; no inbox/network request during startup. */
  private createProvider(): MailProvider {
    const host = this.required('mail.smtp.host', 'SMTP_HOST');
    const user = this.required('mail.smtp.user', 'SMTP_USER');
    const pass = this.required('mail.smtp.pass', 'SMTP_PASS');
    const port = this.configService.get<number>('mail.smtp.port');
    const secure = this.configService.get<string>('mail.smtp.secure');
    if (!Number.isInteger(port) || !port || port < 1 || port > 65535) {
      throw new Error('SMTP_PORT must be an integer between 1 and 65535');
    }
    if (secure !== 'true' && secure !== 'false') {
      throw new Error('SMTP_SECURE must be true or false');
    }
    const transport = nodemailer.createTransport({
      host,
      port,
      secure: secure === 'true',
      auth: { user, pass },
      requireTLS: secure === 'false',
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 30000,
      logger: false,
      debug: false,
    });
    return {
      sendMail: async (options: SendMailOptions): Promise<void> => {
        await transport.sendMail(options);
      },
    };
  }

  /**
   * Allows the provider to be replaced.
   * Useful for tests/mocks.
   */
  setProvider(provider: MailProvider): void {
    this.provider = provider;
  }

  /**
   * General mail sending method.
   */
  async sendMail(options: SendMailOptions): Promise<void> {
    try {
      await this.provider.sendMail({
        ...options,
        from: options.from ?? this.from,
      });
      // Subject/body include OTPs; SMTP debug/error messages can contain secrets.
      this.logger.log('Email delivered via SMTP');
    } catch (error) {
      const details =
        error && typeof error === 'object'
          ? (error as { code?: unknown; responseCode?: unknown })
          : {};
      const codes = [
        'EAUTH',
        'ECONNECTION',
        'ESOCKET',
        'ETIMEDOUT',
        'EDNS',
        'EENVELOPE',
        'EMESSAGE',
        'ESTREAM',
        'ETLS',
      ];
      const code =
        typeof details.code === 'string' && codes.includes(details.code)
          ? details.code
          : 'UNKNOWN';
      const responseCode =
        typeof details.responseCode === 'number' &&
        Number.isInteger(details.responseCode) &&
        details.responseCode >= 100 &&
        details.responseCode <= 599
          ? details.responseCode
          : 'unknown';
      this.logger.error(
        `SMTP delivery failed (code=${code}, responseCode=${responseCode})`,
      );
      throw new ServiceUnavailableException(
        'Email delivery is temporarily unavailable. Please try again later.',
      );
    }
  }

  /**
   * Creates and sends an OTP email.
   */
  async sendOtpEmail(
    to: string,
    otp: string,
    purpose = 'Verification',
    expiryMinutes = 5,
  ): Promise<void> {
    const formattedPurpose = purpose
      .split(/[\s_]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    const subject = `Your Valentia ${formattedPurpose} Code: ${otp}`;

    const text = `
Hello,

Your one-time verification code for Valentia (${formattedPurpose}) is:

${otp}

This code will expire in ${expiryMinutes} minutes.

Please do not share this code with anyone.

If you did not request this email, please ignore this message.

Best regards,
Valentia Team
    `.trim();

    const html = `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
        "
      >
        <h2
          style="
            color: #1a1a1a;
            margin-bottom: 8px;
          "
        >
          Valentia — Design & Build
        </h2>

        <p
          style="
            color: #555;
            font-size: 16px;
          "
        >
          Your one-time verification code for
          <strong>${formattedPurpose}</strong>:
        </p>

        <div
          style="
            background-color: #f4f6f8;
            padding: 16px 24px;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 6px;
            color: #111;
            text-align: center;
            border-radius: 6px;
            margin: 20px 0;
          "
        >
          ${otp}
        </div>

        <p
          style="
            color: #777;
            font-size: 14px;
          "
        >
          This code will expire in
          <strong>${expiryMinutes} minutes</strong>.
          Please do not share this code with anyone.
        </p>

        <hr
          style="
            border: none;
            border-top: 1px solid #eee;
            margin: 24px 0;
          "
        />

        <p
          style="
            color: #999;
            font-size: 12px;
          "
        >
          If you did not request this email,
          no action is required.
        </p>
      </div>
    `;

    await this.sendMail({
      from: this.from,
      to,
      subject,
      text,
      html,
    });
  }
}
