import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import type { User } from '../generated/prisma/client.js';
import type { RequestUser } from '../common/decorators/current-user.decorator.js';
import { PrismaService } from '../infrastructure/database/prisma.service.js';
import { OtpService } from '../otp/otp.service.js';
import { OtpPurpose } from '../otp/enums/otp-purpose.enum.js';
import { isRealEmail, requiresOnboarding } from './identity-policy.js';

@Injectable()
export class OnboardingService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(OtpService) private readonly otp: OtpService,
  ) {}

  private assertSession(
    user: User | null,
    actor: RequestUser,
  ): asserts user is User {
    if (!user) throw new UnauthorizedException('Account is unavailable');
    if (
      actor.onboardingSession &&
      (!user.onboardingVersion ||
        user.onboardingVersion !== actor.onboardingVersion ||
        !user.temporaryCredentialsExpiresAt ||
        user.temporaryCredentialsExpiresAt.getTime() <= Date.now())
    ) {
      throw new UnauthorizedException('Onboarding session expired or revoked');
    }
    if (requiresOnboarding(user) && !actor.onboardingSession) {
      throw new ForbiddenException('A current onboarding session is required');
    }
  }

  private binding(user: User) {
    return `${user.id}:${user.onboardingVersion ?? 'legacy-email'}`;
  }

  private assertEmailEnrollment(user: User, email: string) {
    if (!isRealEmail(email))
      throw new BadRequestException('A real email address is required');
    if (user.emailVerified)
      throw new ConflictException('This account already has a verified email');
    // Historical customers can verify their backfilled identity, not replace it.
    if (user.email && user.email !== email)
      throw new ConflictException(
        'Verify the email already assigned to this account',
      );
  }

  async requestEmail(actor: RequestUser, input: string) {
    const email = input.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { id: actor.id } });
    this.assertSession(user, actor);
    this.assertEmailEnrollment(user, email);
    const owner = await this.prisma.user.findUnique({ where: { email } });
    if (owner && owner.id !== user.id)
      throw new ConflictException('Email is already assigned');
    return this.otp.generateAndSendOtp(
      { email, purpose: OtpPurpose.EMAIL_VERIFICATION },
      this.binding(user),
    );
  }

  async verifyEmail(actor: RequestUser, input: string, otp: string) {
    const email = input.trim().toLowerCase();
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Shared with reissue/password replacement; only this account can consume its challenge.
        await tx.$queryRaw`SELECT id FROM users WHERE id = ${actor.id} FOR UPDATE`;
        const user = await tx.user.findUnique({ where: { id: actor.id } });
        this.assertSession(user, actor);
        this.assertEmailEnrollment(user, email);
        const owner = await tx.user.findUnique({ where: { email } });
        if (owner && owner.id !== user.id)
          throw new ConflictException('Email is already assigned');
        await this.otp.verifyOtp(
          { email, otp, purpose: OtpPurpose.EMAIL_VERIFICATION },
          this.binding(user),
        );
        const complete = !user.mustChangePassword;
        await tx.user.update({
          where: { id: user.id },
          data: {
            email,
            emailVerified: true,
            ...(complete ? { onboardingVersion: null } : {}),
          },
        });
        return {
          success: true,
          email,
          emailVerified: true,
          mustChangePassword: user.mustChangePassword,
          onboardingComplete: complete,
          message: complete
            ? 'Onboarding complete. Sign in with your real email and new password.'
            : 'Email verified. Replace your temporary password.',
        };
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002')
        throw new ConflictException('Email is already assigned');
      throw error;
    }
  }

  async changePassword(actor: RequestUser, newPassword: string) {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${actor.id} FOR UPDATE`;
      const user = await tx.user.findUnique({ where: { id: actor.id } });
      this.assertSession(user, actor);
      if (await bcrypt.compare(newPassword, user.passwordHash)) {
        throw new BadRequestException('Choose a different password');
      }
      await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          mustChangePassword: false,
          ...(user.emailVerified ? { onboardingVersion: null } : {}),
        },
      });
      return {
        message: 'Password changed successfully',
        mustChangePassword: false,
        onboardingComplete: user.emailVerified,
      };
    });
  }
}
