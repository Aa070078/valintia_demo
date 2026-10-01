import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import type { MailProvider, SendMailOptions } from './mail.interfaces.js';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private provider: MailProvider;

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {
    this.provider = this.createProvider();
  }

  /**
   * Creates the configured mail provider.
   *
   * Supported providers:
   * - console: local development/testing
   * - resend: real email delivery using Resend
   */
  private createProvider(): MailProvider {
    const providerName =
      this.configService.get<string>('mail.provider') ?? 'console';

    /**
     * Resend provider
     */
    if (providerName === 'resend') {
      const apiKey = this.configService.get<string>('RESEND_API_KEY');

      if (!apiKey) {
        throw new Error(
          'RESEND_API_KEY is required when MAIL_PROVIDER=resend',
        );
      }

      const resend = new Resend(apiKey);

      return {
        sendMail: async (options: SendMailOptions): Promise<void> => {
          /*
           * For our current OTP emails, HTML content is always generated.
           * This check also allows TypeScript to know that options.html
           * is definitely a string before passing it to Resend.
           */
          if (!options.html) {
            throw new Error('Email HTML content is required');
          }

          const { data, error } = await resend.emails.send({
            from:
              options.from ??
              'Valentia <onboarding@resend.dev>',
            to: options.to,
            subject: options.subject,
            html: options.html,
          });

          if (error) {
            this.logger.error(
              `Resend failed to send email to ${options.to}: ${error.message}`,
            );

            throw new Error(
              `Failed to send email: ${error.message}`,
            );
          }

          this.logger.log(
            `Email sent successfully to ${options.to} via Resend. ID: ${data?.id}`,
          );
        },
      };
    }

    /**
     * Console provider
     *
     * Used when MAIL_PROVIDER is not "resend".
     * No real email is sent.
     */
    return {
      sendMail: async (options: SendMailOptions): Promise<void> => {
        this.logger.log(
          `[Mail Delivery - CONSOLE] To: ${options.to} | Subject: "${options.subject}"`,
        );

        if (options.text) {
          this.logger.debug(
            `[Mail Text Body]:\n${options.text}`,
          );
        }
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
    const defaultFrom =
      this.configService.get<string>('mail.from') ??
      'Valentia <onboarding@resend.dev>';

    await this.provider.sendMail({
      ...options,
      from: options.from ?? defaultFrom,
    });
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
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1).toLowerCase(),
      )
      .join(' ');

    const subject =
      `Your Valentia ${formattedPurpose} Code: ${otp}`;

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
      to,
      subject,
      text,
      html,
    });
  }
}