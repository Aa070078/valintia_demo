import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { MailProvider, SendMailOptions } from './mail.interfaces.js';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private provider: MailProvider;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    this.provider = this.createProvider();
  }

  private createProvider(): MailProvider {
    const providerName =
      this.configService.get<string>('mail.provider') ?? 'console';

    // Default built-in console provider for dev/testing with clear, structured audit output
    return {
      sendMail: async (options: SendMailOptions): Promise<void> => {
        this.logger.log(
          `[Mail Delivery - ${providerName.toUpperCase()}] To: ${options.to} | Subject: "${options.subject}"`,
        );
        if (options.text) {
          this.logger.debug(`[Mail Text Body]:\n${options.text}`);
        }
      },
    };
  }

  /**
   * Set or override the underlying mail provider (e.g. for testing or production SMTP/Resend/SendGrid adapters)
   */
  setProvider(provider: MailProvider): void {
    this.provider = provider;
  }

  /**
   * Send a general email
   */
  async sendMail(options: SendMailOptions): Promise<void> {
    const defaultFrom =
      this.configService.get<string>('mail.from') ??
      'Valentia <no-reply@valentia.com>';

    await this.provider.sendMail({
      ...options,
      from: options.from ?? defaultFrom,
    });
  }

  /**
   * Send an OTP email with clear purpose and security advisory
   */
  async sendOtpEmail(
    to: string,
    otp: string,
    purpose = 'Verification',
    expiryMinutes = 5,
  ): Promise<void> {
    const formattedPurpose = purpose
      .split(/[\s_]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

    const subject = `Your Valentia ${formattedPurpose} Code: ${otp}`;
    const text = `Hello,\n\nYour one-time verification code for Valentia (${formattedPurpose}) is: ${otp}\n\nThis code will expire in ${expiryMinutes} minutes. If you did not request this code, please ignore this email or contact support.\n\nBest regards,\nValentia Team`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1a1a1a; margin-bottom: 8px;">Valentia — Design & Build</h2>
        <p style="color: #555; font-size: 16px;">Your one-time verification code for <strong>${formattedPurpose}</strong>:</p>
        <div style="background-color: #f4f6f8; padding: 16px 24px; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #111; text-align: center; border-radius: 6px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #777; font-size: 14px;">This code will expire in <strong>${expiryMinutes} minutes</strong>. Please do not share this code with anyone.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">If you did not request this email, no action is required.</p>
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
