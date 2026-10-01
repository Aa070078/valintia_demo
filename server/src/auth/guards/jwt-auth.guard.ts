import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator.js';
import type { RequestUser } from '../../common/decorators/current-user.decorator.js';
import { Role } from '../../generated/prisma/client.js';

type RequestWithUser = Request & { user?: RequestUser };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(ConfigService) private readonly configService: ConfigService,
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
      payload = await this.jwtService.verifyAsync(token, { secret });
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired authentication token',
      );
    }

    if (
      !payload ||
      typeof payload !== 'object' ||
      typeof payload.sub !== 'number' ||
      isNaN(payload.sub) ||
      typeof payload.role !== 'string' ||
      !Object.values(Role).includes(payload.role as Role)
    ) {
      throw new UnauthorizedException('Invalid JWT payload claims');
    }

    request.user = {
      id: payload.sub,
      sub: payload.sub,
      role: payload.role as Role,
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
