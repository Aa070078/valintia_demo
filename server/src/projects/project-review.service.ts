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
import { MailService } from '../infrastructure/mail/mail.service.js';
import { Logger, Optional } from '@nestjs/common';

@Injectable()
export class ProjectReviewService {
  private readonly logger = new Logger(ProjectReviewService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ProjectsService) private readonly projects: ProjectsService,
    @Optional() @Inject(MailService) private readonly mailService?: MailService,
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
        include: { assignment: true, client: true },
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

      // Notification Worker: fire background notification after successful status commit
      if (this.mailService && project.client?.email) {
        const clientEmail = project.client.email;
        const projectTitle = project.title;

        if (action === ProjectActivityAction.CONSULTATION_READY) {
          this.mailService
            .sendMail({
              to: clientEmail,
              subject: `مهندس فالنتيا مستعد لمقابلتك — مشروع: ${projectTitle}`,
              html: `
                <div dir="rtl" style="font-family: sans-serif; line-height: 1.6; color: #1c1917; background-color: #faf7f2; padding: 24px; border-radius: 12px;">
                  <h3 style="color: #503c2c;">مرحباً ${project.client.username}،</h3>
                  <p>يسعدنا إعلامك بأن المهندس المعماري قد انتهى من دراسة ومراجعة المخططات الهندسية لمشروعك (<strong>${projectTitle}</strong>).</p>
                  <p style="color: #b88460; font-weight: bold;">مشروعك الآن معتمد وجاهز لميتينج الاستشارة بالفيديو (المرحلة 02).</p>
                  ${dto?.note ? `<p style="background: #f4eee6; padding: 12px; border-radius: 8px; border-right: 4px solid #b88460;"><strong>ملاحظة المهندس:</strong> ${dto.note}</p>` : ''}
                  <p>يرجى الدخول لحسابك لاختيار موعد الميتينج الأنسب لك مع رئيس المهندسين.</p>
                </div>
              `,
            })
            .then(() => {
              this.logger.log(
                `[NotificationWorker] Dispatched consultation readiness notification to ${clientEmail} for project #${projectId}`,
              );
            })
            .catch((err) => {
              this.logger.warn(
                `[NotificationWorker] Could not dispatch notification email: ${err}`,
              );
            });
        } else if (action === ProjectActivityAction.REVIEW_STARTED) {
          this.mailService
            .sendMail({
              to: clientEmail,
              subject: `بدء المراجعة الفنية لمشروعك — ${projectTitle}`,
              html: `
                <div dir="rtl" style="font-family: sans-serif; line-height: 1.6; color: #1c1917; background-color: #faf7f2; padding: 24px; border-radius: 12px;">
                  <h3 style="color: #503c2c;">مرحباً ${project.client.username}،</h3>
                  <p>بدأ المهندس المعماري المسؤول في فالنتيا دراسة المخططات والمواصفات الخاصة بمشروعك (<strong>${projectTitle}</strong>) حالياً.</p>
                  ${dto?.note ? `<p style="background: #f4eee6; padding: 12px; border-radius: 8px; border-right: 4px solid #b88460;"><strong>ملاحظة المهندس:</strong> ${dto.note}</p>` : ''}
                  <p>سنخطرك فور اكتمال الفحص وتأكيد جاهزية المهندس لحجز ميتينج الاستشارة الأولية.</p>
                </div>
              `,
            })
            .then(() => {
              this.logger.log(
                `[NotificationWorker] Dispatched review started notification to ${clientEmail} for project #${projectId}`,
              );
            })
            .catch((err) => {
              this.logger.warn(
                `[NotificationWorker] Could not dispatch notification email: ${err}`,
              );
            });
        }
      }

      return {
        projectId,
        status: toStatus,
        activity,
        allowedActions: this.allowedActions(toStatus),
      };
    });
  }
}
