import { ApiProperty } from '@nestjs/swagger';
import {
  ProjectActivityAction,
  ProjectStatus,
  Role,
  SpaceType,
} from '../../generated/prisma/client.js';
import { ProjectReviewAction } from '../enums/project-review-action.enum.js';

export class ReviewIdentityDto {
  @ApiProperty({ example: 3 }) id!: number;
  @ApiProperty({
    example: 'AbdMoh98',
    description: 'Stable application username; not the authentication email',
  })
  username!: string;
}

export class ReviewPropertyDto {
  @ApiProperty() id!: number;
  @ApiProperty() projectId!: number;
  @ApiProperty({ example: 'Apartment' }) propertyType!: string;
  @ApiProperty({
    type: String,
    example: '120',
    description: 'Decimal area serialized as a string',
  })
  areaSqm!: string;
  @ApiProperty({ example: 'Cairo' }) city!: string;
  @ApiProperty({ type: String, nullable: true }) compound!: string | null;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
  @ApiProperty({ type: String, format: 'date-time' }) updatedAt!: Date;
}

export class ReviewSpaceDto {
  @ApiProperty() id!: number;
  @ApiProperty() projectId!: number;
  @ApiProperty({ enum: SpaceType }) type!: SpaceType;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
  @ApiProperty({ type: String, format: 'date-time' }) updatedAt!: Date;
}

export class ReviewAssignmentDto {
  @ApiProperty() id!: number;
  @ApiProperty() projectId!: number;
  @ApiProperty() engineerId!: number;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
  @ApiProperty({ type: () => ReviewIdentityDto }) engineer!: ReviewIdentityDto;
}

export class ProjectActivityDto {
  @ApiProperty() id!: number;
  @ApiProperty() projectId!: number;
  @ApiProperty({ description: 'Authenticated actor, set by the backend' })
  actorId!: number;
  @ApiProperty({ enum: Role }) actorRole!: Role;
  @ApiProperty({ enum: ProjectActivityAction }) action!: ProjectActivityAction;
  @ApiProperty({ enum: ProjectStatus }) fromStatus!: ProjectStatus;
  @ApiProperty({ enum: ProjectStatus }) toStatus!: ProjectStatus;
  @ApiProperty({
    type: String,
    nullable: true,
    maxLength: 2000,
    description: 'Customer-visible review note',
  })
  note!: string | null;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
}

export class ProjectReviewContextDto {
  @ApiProperty() id!: number;
  @ApiProperty() title!: string;
  @ApiProperty({ enum: ProjectStatus }) status!: ProjectStatus;
  @ApiProperty({ type: String, nullable: true }) notes!: string | null;
  @ApiProperty() clientId!: number;
  @ApiProperty({ type: () => ReviewIdentityDto }) client!: ReviewIdentityDto;
  @ApiProperty({ type: () => ReviewPropertyDto, nullable: true })
  property!: ReviewPropertyDto | null;
  @ApiProperty({ type: () => [ReviewSpaceDto] }) spaces!: ReviewSpaceDto[];
  @ApiProperty({ type: () => ReviewAssignmentDto })
  assignment!: ReviewAssignmentDto;
  @ApiProperty({ type: () => [ProjectActivityDto] })
  activities!: ProjectActivityDto[];
  @ApiProperty({
    enum: ProjectReviewAction,
    isArray: true,
    description:
      'Actions available to this assigned Engineer; empty for DRAFT/ENGINEER_READY',
  })
  allowedActions!: ProjectReviewAction[];
  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
  @ApiProperty({ type: String, format: 'date-time' }) updatedAt!: Date;
}

export class ProjectReviewTransitionDto {
  @ApiProperty() projectId!: number;
  @ApiProperty({ enum: ProjectStatus }) status!: ProjectStatus;
  @ApiProperty({ type: () => ProjectActivityDto })
  activity!: ProjectActivityDto;
  @ApiProperty({ enum: ProjectReviewAction, isArray: true })
  allowedActions!: ProjectReviewAction[];
}
