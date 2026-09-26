import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import { Role } from '../generated/prisma/client.js';
import { PrismaService } from '../infrastructure/database/prisma.service.js';
import { CreateInternalUserDto } from './dto/create-internal-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async createInternalUser(dto: CreateInternalUserDto) {
    const { firstName, lastName, birthYear, role, username } = dto;

    const allowedInternalRoles: Role[] = [
      Role.ENGINEER,
      Role.PROJECT_MANAGER,
      Role.COMPANY_OWNER,
    ];

    if (!allowedInternalRoles.includes(role)) {
      throw new BadRequestException(
        'Internal account creation is allowed only for ENGINEER, PROJECT_MANAGER, and COMPANY_OWNER roles',
      );
    }

    let baseUsername: string;

    if (username && username.trim().length > 0) {
      baseUsername = username.trim();
    } else if (firstName && lastName) {
      const first = firstName.trim();
      const last = lastName.trim().substring(0, 3);
      const yearStr = birthYear ? birthYear.toString().slice(-2) : '';
      const firstFormatted = first.charAt(0).toUpperCase() + first.slice(1);
      const lastFormatted = last.charAt(0).toUpperCase() + last.slice(1);
      baseUsername = `${firstFormatted}${lastFormatted}${yearStr}`;
    } else {
      throw new BadRequestException(
        'Either username or firstName and lastName must be provided to generate a username',
      );
    }

    let candidateUsername = baseUsername;
    let counter = 1;

    while (
      await this.prisma.user.findUnique({
        where: { username: candidateUsername },
      })
    ) {
      candidateUsername = `${baseUsername}${counter}`;
      counter++;
    }

    const tempPassword = `Tmp!${randomBytes(12).toString('base64url')}`;
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        username: candidateUsername,
        passwordHash,
        role,
        mustChangePassword: true,
      },
    });

    return {
      id: user.id,
      username: user.username,
      temporaryPassword: tempPassword,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      createdAt: user.createdAt,
    };
  }
}
