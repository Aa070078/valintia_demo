import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { RequestUser } from '../common/decorators/current-user.decorator.js';
import {
  ProjectActivityAction,
  ProjectStatus,
  Role,
} from '../generated/prisma/client.js';
import { PrismaService } from '../infrastructure/database/prisma.service.js';
import { ReviewActionDto } from './dto/review-action.dto.js';
import { ProjectsService } from './projects.service.js';
import { ProjectReviewAction } from './enums/project-review-action.enum.js';

@Injectable()
export class ProjectReviewService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ProjectsService) private readonly projects: ProjectsService,
  ) {}

  private assertEngineer(user: RequestUser): void {
    if (user.role !== Role.ENGINEER) {
      throw new ForbiddenException(
        'Only the assigned Engineer can perform review actions',
      );
    }
  }

  private allowedActions(status: ProjectStatus): ProjectReviewAction[] {
    if (status === ProjectStatus.SUBMITTED)
      return [ProjectReviewAction.START_REVIEW];
    if (status === ProjectStatus.UNDER_ENGINEER_REVIEW)
      return [ProjectReviewAction.MARK_READY_FOR_CONSULTATION];
    return [];
  }

  /** All persisted review context, with identity projections that never expose credentials. */
  async getContext(projectId: number, user: RequestUser) {
    this.assertEngineer(user);
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: { select: { id: true, username: true } },
        property: true,
        spaces: true,
        assignment: {
          include: { engineer: { select: { id: true, username: true } } },
        },
        activities: { orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.assignment?.engineerId !== user.id) {
      throw new ForbiddenException('You are not assigned to this project');
    }
    return { ...project, allowedActions: this.allowedActions(project.status) };
  }

  /** History uses the existing project ownership/assignment read-access policy. */
  async getActivity(projectId: number, user: RequestUser) {
    await this.projects.findOneForUser(projectId, user);
    return this.prisma.projectActivity.findMany({
      where: { projectId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
  }

  startReview(projectId: number, dto: ReviewActionDto, user: RequestUser) {
    return this.transition(
      projectId,
      dto,
      user,
      ProjectStatus.SUBMITTED,
      ProjectStatus.UNDER_ENGINEER_REVIEW,
      ProjectActivityAction.REVIEW_STARTED,
    );
  }

  readyForConsultation(
    projectId: number,
    dto: ReviewActionDto,
    user: RequestUser,
  ) {
    return this.transition(
      projectId,
      dto,
      user,
      ProjectStatus.UNDER_ENGINEER_REVIEW,
      ProjectStatus.ENGINEER_READY,
      ProjectActivityAction.CONSULTATION_READY,
    );
  }

  private async transition(
    projectId: number,
    dto: ReviewActionDto,
    user: RequestUser,
    fromStatus: ProjectStatus,
    toStatus: ProjectStatus,
    action: ProjectActivityAction,
  ) {
    this.assertEngineer(user);
    return this.prisma.$transaction(async (tx) => {
      // Assignment and review share this lock: reassignment cannot race authorization.
      await tx.$queryRaw`SELECT "id" FROM "projects" WHERE "id" = ${projectId} FOR UPDATE`;
      const project = await tx.project.findUnique({
        where: { id: projectId },
        include: { assignment: true },
      });
      if (!project) throw new NotFoundException('Project not found');
      if (project.assignment?.engineerId !== user.id) {
        throw new ForbiddenException('You are not assigned to this project');
      }
      if (project.status !== fromStatus) {
        throw new ConflictException(
          `Action requires ${fromStatus}; project is ${project.status}`,
        );
      }
      const updated = await tx.project.updateMany({
        where: {
          id: projectId,
          status: fromStatus,
          assignment: { engineerId: user.id },
        },
        data: { status: toStatus },
      });
      if (updated.count !== 1)
        throw new ConflictException(
          'Project state or assignment changed; refresh and retry',
        );
      // State and history are one transaction: failed history writes roll back the action.
      const activity = await tx.projectActivity.create({
        data: {
          projectId,
          actorId: user.id,
          actorRole: user.role,
          action,
          fromStatus,
          toStatus,
          note: dto?.note ?? null,
        },
      });
      return {
        projectId,
        status: toStatus,
        activity,
        allowedActions: this.allowedActions(toStatus),
      };
    });
  }
}
