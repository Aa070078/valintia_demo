import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { RequestUser } from '../common/decorators/current-user.decorator.js';
import { ProjectStatus, Role } from '../generated/prisma/client.js';
import { PrismaService } from '../infrastructure/database/prisma.service.js';
import { AssignEngineerDto } from './dto/assign-engineer.dto.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';

@Injectable()
export class ProjectsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectDto, user: RequestUser) {
    return this.prisma.project.create({
      data: {
        title: dto.title,
        notes: dto.notes,
        clientId: user.id,
        status: ProjectStatus.DRAFT,
        property: dto.property
          ? {
              create: {
                propertyType: dto.property.propertyType,
                areaSqm: dto.property.areaSqm,
                city: dto.property.city,
                compound: dto.property.compound,
              },
            }
          : undefined,
        spaces:
          dto.spaces && dto.spaces.length > 0
            ? {
                create: dto.spaces.map((s) => ({
                  type: s.type,
                })),
              }
            : undefined,
      },
      include: {
        property: true,
        spaces: true,
        assignment: true,
      },
    });
  }

  async findAllForUser(user: RequestUser) {
    if (user.role === Role.CUSTOMER) {
      return this.prisma.project.findMany({
        where: { clientId: user.id },
        include: { property: true, spaces: true, assignment: true },
        orderBy: { createdAt: 'desc' },
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
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.project.findMany({
      include: { property: true, spaces: true, assignment: true },
      orderBy: { createdAt: 'desc' },
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

  async updateDraft(id: number, dto: UpdateProjectDto, user: RequestUser) {
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
          'Access denied: You cannot modify another client project',
        );
      }
    } else if (user.role === Role.ENGINEER) {
      throw new ForbiddenException(
        'Access denied: Engineers cannot modify draft project data',
      );
    }

    if (project.status !== ProjectStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT projects can be modified');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.property) {
        if (project.property) {
          await tx.property.update({
            where: { projectId: id },
            data: {
              ...(dto.property.propertyType !== undefined && {
                propertyType: dto.property.propertyType,
              }),
              ...(dto.property.areaSqm !== undefined && {
                areaSqm: dto.property.areaSqm,
              }),
              ...(dto.property.city !== undefined && {
                city: dto.property.city,
              }),
              ...(dto.property.compound !== undefined && {
                compound: dto.property.compound,
              }),
            },
          });
        } else {
          await tx.property.create({
            data: {
              projectId: id,
              propertyType: dto.property.propertyType ?? 'UNKNOWN',
              areaSqm: dto.property.areaSqm ?? 0,
              city: dto.property.city ?? 'UNKNOWN',
              compound: dto.property.compound,
            },
          });
        }
      }

      if (dto.spaces !== undefined) {
        await tx.space.deleteMany({
          where: { projectId: id },
        });

        if (dto.spaces.length > 0) {
          await tx.space.createMany({
            data: dto.spaces.map((s) => ({
              projectId: id,
              type: s.type,
            })),
          });
        }
      }

      return tx.project.update({
        where: { id },
        data: {
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.notes !== undefined && { notes: dto.notes }),
        },
        include: {
          property: true,
          spaces: true,
          assignment: true,
        },
      });
    });
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

    return this.prisma.$transaction(async (tx) => {
      // Review actions use the same Project lock before checking assignment/state.
      await tx.$queryRaw`SELECT "id" FROM "projects" WHERE "id" = ${projectId} FOR UPDATE`;
      const project = await tx.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }

      if (
        project.status !== ProjectStatus.DRAFT &&
        project.status !== ProjectStatus.SUBMITTED
      ) {
        throw new ConflictException(
          'Engineer assignment is locked once review has started',
        );
      }

      const engineer = await tx.user.findUnique({
        where: { id: dto.engineerId },
      });

      if (!engineer) {
        throw new NotFoundException(`User with ID ${dto.engineerId} not found`);
      }

      if (engineer.role !== Role.ENGINEER) {
        throw new BadRequestException(
          `Selected user ${dto.engineerId} does not have the ENGINEER role`,
        );
      }

      const assignment = await tx.projectAssignment.upsert({
        where: { projectId },
        update: { engineerId: dto.engineerId },
        create: { projectId, engineerId: dto.engineerId },
      });

      return assignment;
    });
  }
}
