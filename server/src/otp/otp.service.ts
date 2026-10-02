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
import { EmailVerificationService } from '../auth/email-verification/email-verification.service.js';
import { MailService } from '../infrastructure/mail/mail.service.js';
import { RedisService } from '../infrastructure/redis/redis.service.js';
import { SendOtpDto } from './dto/send-otp.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { OtpPurpose } from './enums/otp-purpose.enum.js';

/** Server-owned challenge state stored at otp:code:<purpose>:<normalized-email>. */
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
    // Nest supplies the shared proof service; OTP logic does not implement JWT signing.
    @Inject(EmailVerificationService)
    private readonly emailVerification: EmailVerificationService,
  ) {}

  private getOtpKey(purpose: string, email: string): string {
    // Purpose isolates challenges: a LOGIN OTP cannot satisfy EMAIL_VERIFICATION.
    return `otp:code:${purpose}:${email}`;
  }

  private getCooldownKey(purpose: string, email: string): string {
    // A separate temporary marker limits requests, not the challenge's validity.
    return `otp:cooldown:${purpose}:${email}`;
  }

  /**
   * Creates an email-access challenge for the supplied email and OTP purpose.
   * Normalized email keeps Redis keys consistent with verification and registration.
   * EMAIL_VERIFICATION connects to registration; other purposes identify isolated
   * challenges, but do not by themselves implement password-reset or login flows.
   * Stores { code, attempts, createdAt } server-side, emails the OTP, and returns
   * delivery/timing metadata only: the HTTP response never contains the OTP.
   */
  async generateAndSendOtp(dto: SendOtpDto) {
    const email = dto.email.toLowerCase().trim();
    const purpose = dto.purpose ?? OtpPurpose.EMAIL_VERIFICATION;

    // TTL controls OTP validity (e.g. 300s); cooldown controls resends (e.g. 60s).
    // The OTP can remain valid after the initial resend block has ended.
    const ttlSeconds = this.configService.get<number>('otp.ttlSeconds') ?? 300; // 5 minutes
    const cooldownSeconds =
      this.configService.get<number>('otp.cooldownSeconds') ?? 60; // 60 seconds

    const otpKey = this.getOtpKey(purpose, email);
    const cooldownKey = this.getCooldownKey(purpose, email);

    // otp:cooldown:<purpose>:<email> exists only while another request is blocked.
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

    // Cryptographically secure six-digit number; 1000000 is an exclusive upper bound.
    const otpCode = randomInt(100000, 1000000).toString();

    // Redis expiration bounds the lifetime of the server-owned challenge record.
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

    // MailService hides provider details (such as Resend) from the OTP mechanism.
    const purposeLabel = purpose.replace(/_/g, ' ').toLowerCase();
    await this.mailService.sendOtpEmail(
      email,
      otpCode,
      purposeLabel,
      Math.ceil(ttlSeconds / 60),
    );

    // Return delivery metadata; the challenge must be obtained through the inbox.
    return {
      success: true,
      message: `Verification code sent to ${email}`,
      expiresInSeconds: ttlSeconds,
      cooldownSeconds: cooldownSeconds,
    };
  }

  /**
   * FIRST verification stage: did the submitted OTP match the backend's challenge
   * for this email and purpose? Normalization reconstructs the same Redis key.
   * Limits guessing attempts and consumes a successful challenge. Returns success
   * metadata and, only for EMAIL_VERIFICATION, a newly issued verificationToken
   * to carry trusted proof into the separate /auth/register HTTP request.
   */
  async verifyOtp(dto: VerifyOtpDto) {
    const email = dto.email.toLowerCase().trim();
    const purpose = dto.purpose ?? OtpPurpose.EMAIL_VERIFICATION;
    const submittedOtp = dto.otp.trim();

    const maxAttempts = this.configService.get<number>('otp.maxAttempts') ?? 5;
    const otpKey = this.getOtpKey(purpose, email);

    // An absent record may be expired, already consumed, or otherwise invalid.
    const record = await this.redisService.getJSON<StoredOtpRecord>(otpKey);

    if (!record) {
      throw new BadRequestException(
        'Verification code has expired or is invalid. Please request a new code.',
      );
    }

    // Bound guessing against the server-owned OTP, including repeated submissions.
    record.attempts += 1;

    if (record.attempts > maxAttempts) {
      // Once the attempt budget is exceeded, a fresh challenge is required.
      await this.redisService.del(otpKey);
      this.logger.warn(
        `OTP for ${email} (${purpose}) revoked due to exceeding max attempts (${maxAttempts}).`,
      );
      throw new BadRequestException(
        'Maximum verification attempts exceeded. Please request a new verification code.',
      );
    }

    // The server-owned code is the authority, not a frontend verification flag.
    if (record.code !== submittedOtp) {
      // Updating attempts must not restart the OTP's lifetime on each failed guess.
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

    // Consume the OTP before issuing proof: later replay cannot reuse this record.
    await this.redisService.del(otpKey);

    this.logger.log(
      `OTP successfully verified and invalidated for ${email} (${purpose}).`,
    );

    // OTP = email-access challenge; verificationToken = signed proof it succeeded;
    // registration = consumer. issue() creates a NEW token here, not an old lookup.
    // Other purposes need their own secure downstream flow; no proof is issued here.
    return {
      success: true,
      message: 'Verification code verified successfully',
      verified: true,
      ...(purpose === OtpPurpose.EMAIL_VERIFICATION
        ? { verificationToken: await this.emailVerification.issue(email) }
        : {}),
    };
  }
}
