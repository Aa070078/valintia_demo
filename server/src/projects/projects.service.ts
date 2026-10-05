import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { RequestUser } from '../common/decorators/current-user.decorator.js';
import { validateProjectForSubmission } from '../validators/project-submission.validator.js';
import { ProjectStyleService } from './project-style.service.js';
import { ProjectDocumentsService } from './project-documents.service.js';
import {
  Prisma,
  ProjectActivityAction,
  ProjectStatus,
  Role,
  StylePreferenceMode,
} from '../generated/prisma/client.js';

import { PrismaService } from '../infrastructure/database/prisma.service.js';

import { AssignEngineerDto } from './dto/assign-engineer.dto.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { UploadProjectDocumentDto } from './dto/upload-project-document.dto.js';
import { FilesService } from '../files/files.service.js';

import {
  mapProjectToFrontend,
  toPrismaBudgetType,
  toPrismaDeadlineType,
  toPrismaPropertyCondition,
  toPrismaPropertyType,
  toPrismaScopeType,
  toPrismaSpaceType,
} from './projects.mapper.js';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
    private readonly projectStyleService: ProjectStyleService,
    private readonly projectDocumentsService: ProjectDocumentsService,
  ) {}

  /**
   * --------------------------------------------------------------------------
   * Common include
   * --------------------------------------------------------------------------
   */
  private readonly projectInclude = {
    property: true,

    spaces: {
      include: {
        stylePreference: true,
      },
      orderBy: {
        id: 'asc' as const,
      },
    },

    stylePreference: {
      include: {
        spacePreferences: true,
      },
    },

    location: true,
    representative: true,
    scope: true,
    budget: true,
    timeline: true,
    documents: true,

    /**
     * A project has exactly one responsible engineer.
     */
    assignment: {
      include: {
        engineer: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    },

    activities: {
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' as const },
        { id: 'desc' as const },
      ],
    },
  };

  /**
   * --------------------------------------------------------------------------
   * CREATE
   * --------------------------------------------------------------------------
   *
   * Creates a DRAFT project.
   *
   * The wizard is progressive, so sections may be submitted separately.
   */
  async create(dto: CreateProjectDto, user: RequestUser) {
    if (user.role !== Role.CUSTOMER) {
      throw new ForbiddenException('Only customers can create projects');
    }

    return this.prisma.$transaction(async (tx) => {
      /**
       * Property has required DB columns:
       * propertyType, city, areaSqm.
       *
       * Because a draft may start with only propertyType,
       * temporary draft-safe values are used.
       *
       * Submission validation will reject incomplete values.
       */
      const hasProperty = dto.property !== undefined;

      const propertyTypeInput = dto.property?.propertyType ?? 'other';

      const cityInput = dto.property?.city ?? '';

      const areaInput = dto.property?.areaSqm ?? 0;

      const titleInput =
        dto.title?.trim() ||
        (dto.property?.compound
          ? `${dto.property.compound} ${propertyTypeInput.toUpperCase()}`
          : 'New Project');

      /**
       * 1. Base project
       */
      const createdProject = await tx.project.create({
        data: {
          title: titleInput,
          status: ProjectStatus.DRAFT,
          clientId: user.id,
        },
      });

      /**
       * 2. Property
       */
      if (hasProperty) {
        await tx.property.create({
          data: {
            projectId: createdProject.id,

            propertyType: toPrismaPropertyType(propertyTypeInput),

            city: cityInput,

            areaSqm: areaInput,

            compound: dto.property?.compound,
            governorate: dto.property?.governorate,
            floors: dto.property?.floors,

            condition:
              dto.property?.condition !== undefined
                ? toPrismaPropertyCondition(dto.property.condition)
                : undefined,

            accessibilityNotes: dto.property?.accessibilityNotes,
          },
        });
      }

      /**
       * 3. Spaces
       *
       * The frontend already expands quantities into
       * individual SpaceDto records.
       *
       * Therefore the backend creates exactly one DB record
       * for every incoming space.
       */
      if (dto.spaces !== undefined) {
        await this.createSpaces(tx, createdProject.id, dto.spaces);
      }

      /**
       * 4. Customer Location
       *
       * Required DB values get draft-safe defaults.
       */
      if (dto.customerLocation !== undefined) {
        await tx.customerLocation.create({
          data: {
            projectId: createdProject.id,

            country: dto.customerLocation.country ?? '',

            countryCode: dto.customerLocation.countryCode,

            city: dto.customerLocation.city ?? '',

            timezone: dto.customerLocation.timezone ?? 'UTC',

            phone: dto.customerLocation.phone,

            phoneCountryCode: dto.customerLocation.phoneCountryCode,
          },
        });
      }

      /**
       * 5. Representative
       */
      if (dto.representative !== undefined) {
        await tx.projectRepresentative.create({
          data: {
            projectId: createdProject.id,

            hasRepresentative: dto.representative.hasRepresentative ?? false,

            valentiaManagedDirectly:
              dto.representative.valentiaManagedDirectly ?? true,

            name: dto.representative.name,

            phone: dto.representative.phone,

            phoneCountryCode: dto.representative.phoneCountryCode,

            email: dto.representative.email,

            relationship: dto.representative.relationship,

            authorizationScope: dto.representative.authorizationScope,
          },
        });
      }

      /**
       * 6. Scope
       */
      if (dto.scope !== undefined) {
        await tx.projectScope.create({
          data: {
            projectId: createdProject.id,

            scopeType: toPrismaScopeType(dto.scope.scopeType ?? 'other'),

            notes: dto.scope.notes,
          },
        });
      }

      /**
       * 7. Budget
       */
      if (dto.budget !== undefined) {
        await tx.projectBudget.create({
          data: {
            projectId: createdProject.id,

            budgetType: toPrismaBudgetType(
              dto.budget.budgetType ?? 'undecided',
            ),

            exactAmount: dto.budget.exactAmount,

            minAmount: dto.budget.minAmount,

            maxAmount: dto.budget.maxAmount,

            currency: dto.budget.currency ?? 'EGP',
          },
        });
      }

      /**
       * 8. Timeline
       */
      if (dto.timeline !== undefined) {
        await tx.targetCompletion.create({
          data: {
            projectId: createdProject.id,

            deadlineType: toPrismaDeadlineType(
              dto.timeline.deadlineType ?? 'no_deadline',
            ),

            targetDate: dto.timeline.targetDate
              ? new Date(dto.timeline.targetDate)
              : undefined,

            durationDescription: dto.timeline.durationDescription,
          },
        });
      }

      /**
       * 9. Style preference
       *
       * Must happen after spaces because PER_SPACE styles
       * reference actual Space IDs.
       */
      if (dto.stylePreference !== undefined) {
        await this.projectStyleService.saveStylePreference(
          tx,
          createdProject.id,
          dto.stylePreference,
        );
      }

      /**
       * 10. Activity
       */
      await this.logActivity(tx, {
        projectId: createdProject.id,
        actor: user,
        action: ProjectActivityAction.PROJECT_CREATED,
        fromStatus: null,
        toStatus: ProjectStatus.DRAFT,
        note: 'Draft project created',
        metadata: {
          title: titleInput,
          propertyType: hasProperty ? propertyTypeInput : null,
          spacesCount: dto.spaces?.length ?? 0,
          sectionsProvided: {
            property: hasProperty,
            spaces: dto.spaces !== undefined,
            customerLocation: dto.customerLocation !== undefined,
            representative: dto.representative !== undefined,
            scope: dto.scope !== undefined,
            budget: dto.budget !== undefined,
            timeline: dto.timeline !== undefined,
            stylePreference: dto.stylePreference !== undefined,
          },
        },
      });

      /**
       * 11. Return complete project
       */
      return this.loadMappedProject(tx, createdProject.id);
    });
  }

  /**
   * --------------------------------------------------------------------------
   * GET ALL
   * --------------------------------------------------------------------------
   */
  async findAllForUser(user: RequestUser) {
    let projects;

    if (user.role === Role.CUSTOMER) {
      projects = await this.prisma.project.findMany({
        where: {
          clientId: user.id,
        },
        include: this.projectInclude,
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else if (user.role === Role.ENGINEER) {
      /**
       * Engineer can see every project assigned to them.
       */
      projects = await this.prisma.project.findMany({
        where: {
          assignment: {
            is: {
              engineerId: user.id,
            },
          },
        },
        include: this.projectInclude,
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      projects = await this.prisma.project.findMany({
        include: this.projectInclude,
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return projects.map((project) => mapProjectToFrontend(project));
  }

  /**
   * --------------------------------------------------------------------------
   * GET ONE
   * --------------------------------------------------------------------------
   */
  async findOneForUser(id: number, user: RequestUser) {
    const project = await this.prisma.project.findUnique({
      where: {
        id,
      },
      include: this.projectInclude,
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    /**
     * Customer can only see own projects.
     */
    if (user.role === Role.CUSTOMER) {
      if (project.clientId !== user.id) {
        throw new ForbiddenException(
          'Access denied: You cannot view another client project',
        );
      }
    }

    /**
     * Engineer must be the assigned engineer.
     */
    if (user.role === Role.ENGINEER) {
      if (project.assignment?.engineerId !== user.id) {
        throw new ForbiddenException(
          'Access denied: You are not assigned to this project',
        );
      }
    }

    return mapProjectToFrontend(project);
  }

  /**
   * --------------------------------------------------------------------------
   * UPDATE DRAFT
   * --------------------------------------------------------------------------
   */
  async updateDraft(id: number, dto: UpdateProjectDto, user: RequestUser) {
    const project = await this.prisma.project.findUnique({
      where: {
        id,
      },
      include: this.projectInclude,
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    if (user.role !== Role.CUSTOMER) {
      throw new ForbiddenException(
        'Only the project owner customer can modify draft project data',
      );
    }

    if (project.clientId !== user.id) {
      throw new ForbiddenException(
        'Access denied: You cannot modify another client project',
      );
    }

    if (project.status !== ProjectStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT projects can be modified');
    }

    return this.prisma.$transaction(async (tx) => {
      /**
       * ----------------------------------------------------------------------
       * 1. Property
       * ----------------------------------------------------------------------
       */
      if (dto.property !== undefined) {
        const existingProperty = await tx.property.findUnique({
          where: {
            projectId: id,
          },
        });

        const propertyData = {
          ...(dto.property.propertyType !== undefined && {
            propertyType: toPrismaPropertyType(dto.property.propertyType),
          }),

          ...(dto.property.city !== undefined && {
            city: dto.property.city,
          }),

          ...(dto.property.areaSqm !== undefined && {
            areaSqm: dto.property.areaSqm,
          }),

          ...(dto.property.compound !== undefined && {
            compound: dto.property.compound,
          }),

          ...(dto.property.governorate !== undefined && {
            governorate: dto.property.governorate,
          }),

          ...(dto.property.floors !== undefined && {
            floors: dto.property.floors,
          }),

          ...(dto.property.condition !== undefined && {
            condition: toPrismaPropertyCondition(dto.property.condition),
          }),

          ...(dto.property.accessibilityNotes !== undefined && {
            accessibilityNotes: dto.property.accessibilityNotes,
          }),
        };

        if (existingProperty) {
          await tx.property.update({
            where: {
              projectId: id,
            },
            data: propertyData,
          });
        } else {
          await tx.property.create({
            data: {
              projectId: id,

              propertyType: toPrismaPropertyType(
                dto.property.propertyType ?? 'other',
              ),

              city: dto.property.city ?? '',

              areaSqm: dto.property.areaSqm ?? 0,

              compound: dto.property.compound,

              governorate: dto.property.governorate,

              floors: dto.property.floors,

              condition:
                dto.property.condition !== undefined
                  ? toPrismaPropertyCondition(dto.property.condition)
                  : undefined,

              accessibilityNotes: dto.property.accessibilityNotes,
            },
          });
        }
      }

      /**
       * ----------------------------------------------------------------------
       * 2. Spaces
       * ----------------------------------------------------------------------
       *
       * The incoming array is the complete desired set.
       *
       * We delete the current spaces and recreate them.
       * Since SpaceStylePreference has Cascade on Space,
       * old per-space preferences are removed automatically.
       */
      if (dto.spaces !== undefined) {
        await tx.space.deleteMany({
          where: {
            projectId: id,
          },
        });

        if (dto.spaces.length > 0) {
          await this.createSpaces(tx, id, dto.spaces);
        }

        /**
         * The old Space IDs no longer exist.
         *
         * Clear project-level PER_SPACE references.
         */
        const existingStylePreference =
          await tx.projectStylePreference.findUnique({
            where: {
              projectId: id,
            },
          });

        if (
          existingStylePreference &&
          existingStylePreference.mode === StylePreferenceMode.PER_SPACE
        ) {
          await tx.spaceStylePreference.deleteMany({
            where: {
              projectStylePreferenceId: existingStylePreference.id,
            },
          });
        }
      }

      /**
       * ----------------------------------------------------------------------
       * 3. Style preference
       * ----------------------------------------------------------------------
       */
      if (dto.stylePreference !== undefined) {
        await this.projectStyleService.saveStylePreference(
          tx,
          id,
          dto.stylePreference,
        );
      }

      /**
       * ----------------------------------------------------------------------
       * 4. Customer Location
       * ----------------------------------------------------------------------
       */
      if (dto.customerLocation !== undefined) {
        const location = dto.customerLocation;

        await tx.customerLocation.upsert({
          where: {
            projectId: id,
          },

          update: {
            ...(location.country !== undefined && {
              country: location.country,
            }),

            ...(location.countryCode !== undefined && {
              countryCode: location.countryCode,
            }),

            ...(location.city !== undefined && {
              city: location.city,
            }),

            ...(location.timezone !== undefined && {
              timezone: location.timezone,
            }),

            ...(location.phone !== undefined && {
              phone: location.phone,
            }),

            ...(location.phoneCountryCode !== undefined && {
              phoneCountryCode: location.phoneCountryCode,
            }),
          },

          create: {
            projectId: id,

            country: location.country ?? '',

            countryCode: location.countryCode,

            city: location.city ?? '',

            timezone: location.timezone ?? 'UTC',

            phone: location.phone,

            phoneCountryCode: location.phoneCountryCode,
          },
        });
      }

      /**
       * ----------------------------------------------------------------------
       * 5. Representative
       * ----------------------------------------------------------------------
       */
      if (dto.representative !== undefined) {
        const representative = dto.representative;

        await tx.projectRepresentative.upsert({
          where: {
            projectId: id,
          },

          update: {
            ...(representative.hasRepresentative !== undefined && {
              hasRepresentative: representative.hasRepresentative,
            }),

            ...(representative.valentiaManagedDirectly !== undefined && {
              valentiaManagedDirectly: representative.valentiaManagedDirectly,
            }),

            ...(representative.name !== undefined && {
              name: representative.name,
            }),

            ...(representative.phone !== undefined && {
              phone: representative.phone,
            }),

            ...(representative.phoneCountryCode !== undefined && {
              phoneCountryCode: representative.phoneCountryCode,
            }),

            ...(representative.email !== undefined && {
              email: representative.email,
            }),

            ...(representative.relationship !== undefined && {
              relationship: representative.relationship,
            }),

            ...(representative.authorizationScope !== undefined && {
              authorizationScope: representative.authorizationScope,
            }),
          },

          create: {
            projectId: id,

            hasRepresentative: representative.hasRepresentative ?? false,

            valentiaManagedDirectly:
              representative.valentiaManagedDirectly ?? true,

            name: representative.name,

            phone: representative.phone,

            phoneCountryCode: representative.phoneCountryCode,

            email: representative.email,

            relationship: representative.relationship,

            authorizationScope: representative.authorizationScope,
          },
        });
      }

      /**
       * ----------------------------------------------------------------------
       * 6. Scope
       * ----------------------------------------------------------------------
       */
      if (dto.scope !== undefined) {
        const scope = dto.scope;

        await tx.projectScope.upsert({
          where: {
            projectId: id,
          },

          update: {
            ...(scope.scopeType !== undefined && {
              scopeType: toPrismaScopeType(scope.scopeType),
            }),

            ...(scope.notes !== undefined && {
              notes: scope.notes,
            }),
          },

          create: {
            projectId: id,

            scopeType: toPrismaScopeType(scope.scopeType ?? 'other'),

            notes: scope.notes,
          },
        });
      }

      /**
       * ----------------------------------------------------------------------
       * 7. Budget
       * ----------------------------------------------------------------------
       */
      if (dto.budget !== undefined) {
        const budget = dto.budget;

        await tx.projectBudget.upsert({
          where: {
            projectId: id,
          },

          update: {
            ...(budget.budgetType !== undefined && {
              budgetType: toPrismaBudgetType(budget.budgetType),
            }),

            ...(budget.exactAmount !== undefined && {
              exactAmount: budget.exactAmount,
            }),

            ...(budget.minAmount !== undefined && {
              minAmount: budget.minAmount,
            }),

            ...(budget.maxAmount !== undefined && {
              maxAmount: budget.maxAmount,
            }),

            ...(budget.currency !== undefined && {
              currency: budget.currency,
            }),
          },

          create: {
            projectId: id,

            budgetType: toPrismaBudgetType(budget.budgetType ?? 'undecided'),

            exactAmount: budget.exactAmount,

            minAmount: budget.minAmount,

            maxAmount: budget.maxAmount,

            currency: budget.currency ?? 'EGP',
          },
        });
      }

      /**
       * ----------------------------------------------------------------------
       * 8. Timeline
       * ----------------------------------------------------------------------
       */
      if (dto.timeline !== undefined) {
        const timeline = dto.timeline;

        await tx.targetCompletion.upsert({
          where: {
            projectId: id,
          },

          update: {
            ...(timeline.deadlineType !== undefined && {
              deadlineType: toPrismaDeadlineType(timeline.deadlineType),
            }),

            ...(timeline.targetDate !== undefined && {
              targetDate: new Date(timeline.targetDate),
            }),

            ...(timeline.durationDescription !== undefined && {
              durationDescription: timeline.durationDescription,
            }),
          },

          create: {
            projectId: id,

            deadlineType: toPrismaDeadlineType(
              timeline.deadlineType ?? 'no_deadline',
            ),

            targetDate: timeline.targetDate
              ? new Date(timeline.targetDate)
              : undefined,

            durationDescription: timeline.durationDescription,
          },
        });
      }

      /**
       * ----------------------------------------------------------------------
       * 9. Project top-level fields
       * ----------------------------------------------------------------------
       *
       * Project has only title and coverImage as editable
       * top-level fields in the current schema.
       */
      if (dto.title !== undefined) {
        await tx.project.update({
          where: {
            id,
          },

          data: {
            title: dto.title,
          },
        });
      }

      /**
       * ----------------------------------------------------------------------
       * 10. Return updated project
       * ----------------------------------------------------------------------
       */
      return this.loadMappedProject(tx, id);
    });
  }

  /**
   * --------------------------------------------------------------------------
   * SUBMIT PROJECT
   * --------------------------------------------------------------------------
   */
  async submitProject(id: number, user: RequestUser) {
    const project = await this.prisma.project.findUnique({
      where: {
        id,
      },
      include: this.projectInclude,
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    if (user.role !== Role.CUSTOMER || project.clientId !== user.id) {
      throw new ForbiddenException(
        'Access denied: Only the project owner customer can submit their draft project',
      );
    }

    if (project.status !== ProjectStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot submit project. Current status is ${project.status}`,
      );
    }

    const missingFields = validateProjectForSubmission(project);

    if (missingFields.length > 0) {
      throw new BadRequestException({
        message: 'Project is incomplete and cannot be submitted',
        missingFields,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: {
          id,
        },

        data: {
          status: ProjectStatus.SUBMITTED,
        },
      });

      await this.logActivity(tx, {
        projectId: id,
        actor: user,
        action: ProjectActivityAction.PROJECT_SUBMITTED,
        fromStatus: ProjectStatus.DRAFT,
        toStatus: ProjectStatus.SUBMITTED,
        note: 'Project submitted for engineer review',
        metadata: {
          title: project.title,
          spacesCount: project.spaces.length,
          documentsCount: project.documents.length,
          stylePreferenceMode: project.stylePreference?.mode ?? null,
          budgetType: project.budget?.budgetType ?? null,
          hasAssignedEngineer: project.assignment !== null,
        },
      });

      return this.loadMappedProject(tx, id);
    });
  }

  /**
   * --------------------------------------------------------------------------
   * ASSIGN ENGINEER
   * --------------------------------------------------------------------------
   *
   * A project has exactly one responsible engineer.
   * Assigning a different engineer re-assigns the project
   * (allowed only before review has started).
   *
   * Returns the ProjectAssignment record (same as master).
   */
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
        include: {
          assignment: {
            include: {
              engineer: {
                select: { id: true, username: true },
              },
            },
          },
        },
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
        select: { id: true, username: true, role: true },
      });

      if (!engineer) {
        throw new NotFoundException(`User with ID ${dto.engineerId} not found`);
      }

      if (engineer.role !== Role.ENGINEER) {
        throw new BadRequestException(
          `Selected user ${dto.engineerId} does not have the ENGINEER role`,
        );
      }

      const previous = project.assignment;

      // Same engineer already assigned: idempotent, no duplicate activity.
      if (previous && previous.engineerId === engineer.id) {
        return tx.projectAssignment.findUniqueOrThrow({
          where: { projectId },
        });
      }

      const assignment = await tx.projectAssignment.upsert({
        where: { projectId },
        update: { engineerId: engineer.id },
        create: { projectId, engineerId: engineer.id },
      });

      const isReassignment = previous !== null;

      await this.logActivity(tx, {
        projectId,
        actor: user,
        action: isReassignment
          ? ProjectActivityAction.ENGINEER_REASSIGNED
          : ProjectActivityAction.ENGINEER_ASSIGNED,
        fromStatus: project.status,
        toStatus: project.status,
        note: isReassignment
          ? `Engineer changed from ${previous.engineer.username} to ${engineer.username}`
          : `Engineer ${engineer.username} assigned to the project`,
        metadata: {
          projectTitle: project.title,
          newEngineer: { id: engineer.id, username: engineer.username },
          previousEngineer: previous
            ? {
                id: previous.engineer.id,
                username: previous.engineer.username,
              }
            : null,
        },
      });

      return assignment;
    });
  }

  /**
   * --------------------------------------------------------------------------
   * GET ELIGIBLE ENGINEERS
   * --------------------------------------------------------------------------
   */
  async getEligibleEngineers() {
    return this.prisma.user.findMany({
      where: {
        role: Role.ENGINEER,
      },

      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },

      orderBy: {
        username: 'asc',
      },
    });
  }

  /**
   * --------------------------------------------------------------------------
   * Document Operation
   * --------------------------------------------------------------------------
   */
  async uploadDocument(
    projectId: number,
    file: {
      originalname: string;
      mimetype: string;
      size: number;
      path: string;
    },
    uploadDto: UploadProjectDocumentDto,
    currentUser: RequestUser,
  ) {
    return this.projectDocumentsService.uploadDocument(
      projectId,
      file,
      uploadDto,
      currentUser,
    );
  }

  async uploadCoverImage(
    projectId: number,
    file: {
      originalname: string;
      mimetype: string;
      size: number;
      path: string;
    },
    currentUser: RequestUser,
  ) {
    return this.projectDocumentsService.uploadCoverImage(
      projectId,
      file,
      currentUser,
    );
  }

  async deleteDocument(
    projectId: number,
    documentId: number,
    currentUser: RequestUser,
  ): Promise<void> {
    return this.projectDocumentsService.deleteDocument(
      projectId,
      documentId,
      currentUser,
    );
  }

  /**
   * ==========================================================================
   * PRIVATE HELPERS
   * ==========================================================================
   */

  /**
   * --------------------------------------------------------------------------
   * Log project activity
   * --------------------------------------------------------------------------
   *
   * Single entry point for writing timeline events, so every event
   * carries the actor, the actor role, the status transition and
   * structured metadata.
   */
  private async logActivity(
    tx: Prisma.TransactionClient,
    params: {
      projectId: number;
      actor: RequestUser;
      action: ProjectActivityAction;
      fromStatus: ProjectStatus | null;
      toStatus: ProjectStatus;
      note?: string;
      metadata?: Prisma.InputJsonValue;
    },
  ) {
    await tx.projectActivity.create({
      data: {
        projectId: params.projectId,
        actorId: params.actor.id,
        actorRole: params.actor.role,
        action: params.action,
        fromStatus: params.fromStatus,
        toStatus: params.toStatus,
        note: params.note,
        metadata: params.metadata,
      },
    });
  }

  /**
   * --------------------------------------------------------------------------
   * Load a project with everything and map it for the frontend
   * --------------------------------------------------------------------------
   */
  private async loadMappedProject(tx: Prisma.TransactionClient, id: number) {
    const project = await tx.project.findUnique({
      where: { id },
      include: this.projectInclude,
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return mapProjectToFrontend(project);
  }

  /**
   * --------------------------------------------------------------------------
   * Create Spaces
   * --------------------------------------------------------------------------
   *
   * The frontend sends one record per actual space.
   *
   * Example:
   *
   * [
   *   { type: "bedroom", customName: "Master Bedroom" },
   *   { type: "bedroom", customName: "Kids Bedroom" },
   *   { type: "bathroom", customName: "Bathroom 1" }
   * ]
   *
   * becomes exactly three Space records.
   */
  private async createSpaces(
    tx: Prisma.TransactionClient,
    projectId: number,
    spaces: CreateProjectDto['spaces'],
  ) {
    if (!spaces || spaces.length === 0) {
      return;
    }

    const rows = spaces.map((space) => ({
      projectId,

      type: toPrismaSpaceType(space.type),

      customName: space.customName,
    }));

    await tx.space.createMany({
      data: rows,
    });
  }
}
