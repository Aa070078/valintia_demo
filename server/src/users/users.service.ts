import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../infrastructure/database/prisma.service.js';
import { CreateInternalUserDto } from './dto/create-internal-user.dto.js';
import {
  isInternalRole,
  TEMPORARY_LOGIN_DOMAIN,
} from '../auth/identity-policy.js';

@Injectable()
export class UsersService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {}

  listInternalUsers() {
    return this.prisma.user.findMany({
      where: { role: { in: ['ENGINEER', 'PROJECT_MANAGER', 'COMPANY_OWNER'] } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        emailVerified: true,
        mustChangePassword: true,
        temporaryCredentialsExpiresAt: true,
        createdAt: true,
      },
    });
  }

  private async credentials() {
    const temporaryPassword = `Tmp!${randomBytes(12).toString('base64url')}`;
    return {
      temporaryPassword,
      data: {
        passwordHash: await bcrypt.hash(temporaryPassword, 10),
        onboardingVersion: randomBytes(24).toString('hex'),
        accessTokensValidAfter: new Date(),
        temporaryCredentialsExpiresAt: new Date(
          Date.now() +
            (this.config.get<number>('provisioning.ttlHours') ?? 48) * 3600000,
        ),
        mustChangePassword: true,
      },
    };
  }

  async reissue(userId: number, actorId: number) {
    const { temporaryPassword, data } = await this.credentials();
    const user = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;
      const current = await tx.user.findUnique({ where: { id: userId } });
      if (!current) throw new NotFoundException('User not found');
      if (
        !isInternalRole(current.role) ||
        (current.emailVerified && !current.mustChangePassword)
      ) {
        throw new ConflictException(
          'Only incomplete internal accounts can be reissued',
        );
      }
      const temporaryLogin = `onboarding-${userId}-${randomBytes(16).toString('hex')}@${TEMPORARY_LOGIN_DOMAIN}`;
      // Partial enrollment was authorized by the revoked generation. Require fresh
      // inbox proof rather than preserving an email potentially enrolled by a thief.
      const updated = await tx.user.update({
        where: { id: userId },
        data: {
          ...data,
          temporaryLogin,
          email: null,
          emailVerified: false,
          // Set lifetime under the row lock and keep the revocation cutoff monotonic.
          temporaryCredentialsExpiresAt: new Date(
            Date.now() +
              (this.config.get<number>('provisioning.ttlHours') ?? 48) *
                3600000,
          ),
          accessTokensValidAfter: new Date(
            Math.max(
              Date.now(),
              current.accessTokensValidAfter?.getTime() ?? 0,
            ),
          ),
        },
      });
      await tx.accountProvisioningActivity.create({
        data: {
          actorId,
          userId,
          action: 'TEMPORARY_CREDENTIALS_REISSUED',
        },
      });
      return updated;
    });
    return {
      id: user.id,
      username: user.username,
      temporaryLogin: user.temporaryLogin,
      temporaryPassword,
      temporaryCredentialsExpiresAt: user.temporaryCredentialsExpiresAt,
      role: user.role,
      emailVerified: user.emailVerified,
      mustChangePassword: user.mustChangePassword,
    };
  }

  async createInternalUser(dto: CreateInternalUserDto) {
    if (!isInternalRole(dto.role)) {
      throw new BadRequestException('Unsupported internal role');
    }
    // Non-Latin names use a neutral login-safe stem; no real email is fabricated.
    const segment = (name: string) =>
      name.normalize('NFKD').replace(/[^a-zA-Z0-9]/g, '');
    const first = segment(dto.firstName) || 'User';
    const last = (segment(dto.lastName) || 'Staff').slice(0, 3);
    const capitalized = (s: string) =>
      s[0].toUpperCase() + s.slice(1).toLowerCase();
    const base = `${capitalized(first)}${capitalized(last)}${String(dto.birthYear).slice(-2)}`;
    const { temporaryPassword, data } = await this.credentials();
    // Database constraints arbitrate parallel requests, not check-then-insert.
    for (let suffix = 1; suffix <= 10000; suffix++) {
      const username = suffix === 1 ? base : `${base}_${suffix}`;
      const temporaryLogin = `${username.toLowerCase()}@${TEMPORARY_LOGIN_DOMAIN}`;
      try {
        const user = await this.prisma.user.create({
          data: {
            username,
            temporaryLogin,
            ...data,
            role: dto.role,
            emailVerified: false,
          },
        });
        return {
          id: user.id,
          username: user.username,
          temporaryLogin: user.temporaryLogin,
          temporaryPassword,
          role: user.role,
          emailVerified: user.emailVerified,
          mustChangePassword: user.mustChangePassword,
          createdAt: user.createdAt,
          temporaryCredentialsExpiresAt: user.temporaryCredentialsExpiresAt,
        };
      } catch (error) {
        if ((error as { code?: string }).code !== 'P2002') throw error;
      }
    }
    throw new ConflictException(
      'Unable to allocate unique provisioning credentials',
    );
  }
}
