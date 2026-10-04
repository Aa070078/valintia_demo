import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { Role } from '../../generated/prisma/client.js';

export type RequestUser = {
  id: number;
  sub: number;
  role: Role;
  username?: string;
  onboardingSession?: boolean;
  onboardingVersion?: string;
};

type RequestWithUser = Request & { user?: RequestUser };

export const CurrentUser = createParamDecorator(
  (
    data: keyof RequestUser | undefined,
    ctx: ExecutionContext,
  ): RequestUser | RequestUser[keyof RequestUser] | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);
