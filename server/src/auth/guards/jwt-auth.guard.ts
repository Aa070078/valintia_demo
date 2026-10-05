import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator.js';
import type { RequestUser } from '../../common/decorators/current-user.decorator.js';
import { Role } from '../../generated/prisma/client.js';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';
import { ALLOW_ONBOARDING_KEY } from '../../common/decorators/allow-onboarding.decorator.js';
import { requiresOnboarding } from '../identity-policy.js';

type RequestWithUser = Request & { user?: RequestUser };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    const secret =
      this.configService.get<string>('jwt.secret') ||
      this.configService.get<string>('JWT_SECRET');

    if (!secret || secret.trim().length === 0) {
      throw new UnauthorizedException('JWT secret is not configured');
    }

    let payload: Record<string, any>;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret,
        algorithms: ['HS256'],
      });
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired authentication token',
      );
    }

    if (
      !payload ||
      typeof payload !== 'object' ||
      typeof payload.sub !== 'number' ||
      !Number.isSafeInteger(payload.sub) ||
      payload.sub <= 0 ||
      (payload.scope !== undefined && payload.scope !== 'onboarding') ||
      typeof payload.role !== 'string' ||
      !Object.values(Role).includes(payload.role as Role)
    ) {
      throw new UnauthorizedException('Invalid JWT payload claims');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user || user.role !== payload.role) {
      throw new UnauthorizedException(
        'Account is unavailable or role has changed',
      );
    }
    const onboardingSession = payload.scope === 'onboarding';
    if (
      !onboardingSession &&
      user.accessTokensValidAfter &&
      (typeof payload.iat !== 'number' ||
        !Number.isSafeInteger(payload.iat) ||
        payload.iat < Math.ceil(user.accessTokensValidAfter.getTime() / 1000))
    ) {
      throw new UnauthorizedException('Authentication token has been revoked');
    }
    if (
      onboardingSession &&
      (!user.onboardingVersion ||
        payload.version !== user.onboardingVersion ||
        !user.temporaryCredentialsExpiresAt ||
        user.temporaryCredentialsExpiresAt.getTime() <= Date.now())
    ) {
      throw new UnauthorizedException('Onboarding session expired or revoked');
    }
    const allowOnboarding = this.reflector.getAllAndOverride<boolean>(
      ALLOW_ONBOARDING_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (requiresOnboarding(user) && !onboardingSession) {
      throw new ForbiddenException(
        'Sign in with current provisioning credentials to complete onboarding',
      );
    }
    // DB controls mutable eligibility. Restricted tokens never upgrade on activation.
    if ((onboardingSession || requiresOnboarding(user)) && !allowOnboarding) {
      throw new ForbiddenException(
        'Complete email verification and password replacement, then sign in again',
      );
    }
    request.user = {
      id: payload.sub,
      sub: payload.sub,
      role: payload.role as Role,
      onboardingSession,
      onboardingVersion: onboardingSession ? payload.version : undefined,
    };

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
