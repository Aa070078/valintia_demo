import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'node:crypto';
import { MailService } from '../infrastructure/mail/mail.service.js';
import { RedisService } from '../infrastructure/redis/redis.service.js';
import { SendOtpDto } from './dto/send-otp.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { OtpPurpose } from './enums/otp-purpose.enum.js';

interface StoredOtpRecord {
  code: string;
  attempts: number;
  createdAt: number;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    @Inject(RedisService) private readonly redisService: RedisService,
    @Inject(MailService) private readonly mailService: MailService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  private getOtpKey(purpose: string, email: string): string {
    return `otp:code:${purpose}:${email}`;
  }

  private getCooldownKey(purpose: string, email: string): string {
    return `otp:cooldown:${purpose}:${email}`;
  }

  /**
   * Generates a cryptographically secure 6-digit OTP, records it in Redis with expiry,
   * sets resend cooldown, and triggers delivery via the isolated MailService.
   */
  async generateAndSendOtp(dto: SendOtpDto) {
    const email = dto.email.toLowerCase().trim();
    const purpose = dto.purpose ?? OtpPurpose.EMAIL_VERIFICATION;

    const ttlSeconds = this.configService.get<number>('otp.ttlSeconds') ?? 300; // 5 minutes
    const cooldownSeconds =
      this.configService.get<number>('otp.cooldownSeconds') ?? 60; // 60 seconds

    const otpKey = this.getOtpKey(purpose, email);
    const cooldownKey = this.getCooldownKey(purpose, email);

    // 1. Resend / Cooldown Protection
    const isCooldownActive = await this.redisService.exists(cooldownKey);
    if (isCooldownActive) {
      const remainingCooldown = await this.redisService.raw.ttl(cooldownKey);
      const retryAfter =
        remainingCooldown > 0 ? remainingCooldown : cooldownSeconds;

      this.logger.warn(
        `OTP request throttled for ${email} (${purpose}). Cooldown active for ${retryAfter}s.`,
      );

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Please wait ${retryAfter} seconds before requesting a new code.`,
          error: 'Too Many Requests',
          retryAfterSeconds: retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 2. Generate cryptographically secure 6-digit numeric OTP
    const otpCode = randomInt(100000, 1000000).toString();

    // 3. Store server-owned state in Redis with TTL
    const record: StoredOtpRecord = {
      code: otpCode,
      attempts: 0,
      createdAt: Date.now(),
    };

    await this.redisService.setJSON(otpKey, record, ttlSeconds);
    await this.redisService.set(cooldownKey, '1', cooldownSeconds);

    this.logger.log(
      `OTP generated for ${email} [Purpose: ${purpose}, TTL: ${ttlSeconds}s, Cooldown: ${cooldownSeconds}s]`,
    );

    // 4. Send email through isolated MailService provider layer
    const purposeLabel = purpose.replace(/_/g, ' ').toLowerCase();
    await this.mailService.sendOtpEmail(
      email,
      otpCode,
      purposeLabel,
      Math.ceil(ttlSeconds / 60),
    );

    // 5. Return success payload — NEVER expose the OTP code to the client
    return {
      success: true,
      message: `Verification code sent to ${email}`,
      expiresInSeconds: ttlSeconds,
      cooldownSeconds: cooldownSeconds,
    };
  }

  /**
   * Server-side verification of submitted OTP:
   * - Validates existence & expiry
   * - Protects against brute-force attempts
   * - Deletes OTP upon success to prevent replay/reuse
   */
  async verifyOtp(dto: VerifyOtpDto) {
    const email = dto.email.toLowerCase().trim();
    const purpose = dto.purpose ?? OtpPurpose.EMAIL_VERIFICATION;
    const submittedOtp = dto.otp.trim();

    const maxAttempts = this.configService.get<number>('otp.maxAttempts') ?? 5;
    const otpKey = this.getOtpKey(purpose, email);

    // 1. Fetch server-owned OTP record
    const record = await this.redisService.getJSON<StoredOtpRecord>(otpKey);

    if (!record) {
      throw new BadRequestException(
        'Verification code has expired or is invalid. Please request a new code.',
      );
    }

    // 2. Brute-force attempt protection
    record.attempts += 1;

    if (record.attempts > maxAttempts) {
      // Invalidate the OTP completely on too many failed attempts
      await this.redisService.del(otpKey);
      this.logger.warn(
        `OTP for ${email} (${purpose}) revoked due to exceeding max attempts (${maxAttempts}).`,
      );
      throw new BadRequestException(
        'Maximum verification attempts exceeded. Please request a new verification code.',
      );
    }

    // 3. Verify submitted code
    if (record.code !== submittedOtp) {
      // Preserve remaining TTL when updating failed attempt count
      const remainingTtl = await this.redisService.raw.ttl(otpKey);
      if (remainingTtl > 0) {
        await this.redisService.setJSON(otpKey, record, remainingTtl);
      }

      const attemptsLeft = maxAttempts - record.attempts;
      this.logger.warn(
        `Invalid OTP attempt for ${email} (${purpose}). Attempts left: ${attemptsLeft}`,
      );

      throw new BadRequestException(
        `Invalid verification code.${attemptsLeft > 0 ? ` ${attemptsLeft} attempt(s) remaining.` : ''}`,
      );
    }

    // 4. Single-use guarantee: Invalidate the OTP immediately
    await this.redisService.del(otpKey);

    this.logger.log(
      `OTP successfully verified and invalidated for ${email} (${purpose}).`,
    );

    return {
      success: true,
      message: 'Verification code verified successfully',
      verified: true,
    };
  }
}
