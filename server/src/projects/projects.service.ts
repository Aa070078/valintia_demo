import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { RequestUser } from '../common/decorators/current-user.decorator.js';
import { Role } from '../generated/prisma/client.js';
import { PrismaService } from '../infrastructure/database/prisma.service.js';
import { AssignEngineerDto } from './dto/assign-engineer.dto.js';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async findAllForUser(user: RequestUser) {
    if (user.role === Role.CUSTOMER) {
      return this.prisma.project.findMany({
        where: { clientId: user.id },
        include: { property: true, spaces: true, assignment: true },
      });
    }

    if (user.role === Role.ENGINEER) {
      return this.prisma.project.findMany({
        where: {
          assignment: {
            engineerId: user.id,
          },
        },
        include: { property: true, spaces: true, assignment: true },
      });
    }

    return this.prisma.project.findMany({
      include: { property: true, spaces: true, assignment: true },
    });
  }

  async findOneForUser(id: number, user: RequestUser) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { property: true, spaces: true, assignment: true },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    if (user.role === Role.CUSTOMER) {
      if (project.clientId !== user.id) {
        throw new ForbiddenException(
          'Access denied: You cannot view another client project',
        );
      }
    } else if (user.role === Role.ENGINEER) {
      if (!project.assignment || project.assignment.engineerId !== user.id) {
        throw new ForbiddenException(
          'Access denied: You are not assigned to this project',
        );
      }
    }

    return project;
  }

  async assignEngineer(
    projectId: number,
    dto: AssignEngineerDto,
    user: RequestUser,
  ) {
    const allowedRoles: Role[] = [Role.PROJECT_MANAGER, Role.ADMINISTRATOR];
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException(
        'Access denied: Only Project Managers and Admins can assign engineers',
      );
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const engineer = await this.prisma.user.findUnique({
      where: { id: dto.engineerId },
    });

    if (!engineer) {
      throw new NotFoundException(
        `User with ID ${dto.engineerId} not found`,
      );
    }

    if (engineer.role !== Role.ENGINEER) {
      throw new BadRequestException(
        `Selected user ${dto.engineerId} does not have the ENGINEER role`,
      );
    }

    const assignment = await this.prisma.projectAssignment.upsert({
      where: { projectId },
      update: { engineerId: dto.engineerId },
      create: { projectId, engineerId: dto.engineerId },
    });

    return assignment;
  }
}
