import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { RequestUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Role } from '../generated/prisma/client.js';
import { AssignEngineerDto } from './dto/assign-engineer.dto.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { ProjectsService } from './projects.service.js';

@ApiTags('projects')
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class ProjectsController {
  constructor(
    @Inject(ProjectsService) private readonly projectsService: ProjectsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new draft project for current client' })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully in DRAFT status',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Invalid input or unknown fields',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createDto: CreateProjectDto,
    @CurrentUser() currentUser: RequestUser,
  ) {
    return this.projectsService.create(createDto, currentUser);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List projects authorized for current user' })
  @ApiResponse({ status: 200, description: 'List of accessible projects' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@CurrentUser() currentUser: RequestUser) {
    return this.projectsService.findAllForUser(currentUser);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get project details by ID with authorization' })
  @ApiResponse({ status: 200, description: 'Project details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Insufficient access to project',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: RequestUser,
  ) {
    return this.projectsService.findOneForUser(id, currentUser);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update editable Draft project data' })
  @ApiResponse({
    status: 200,
    description: 'Draft project updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Validation error or project is not in DRAFT status',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Insufficient access to project',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async updateDraft(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProjectDto,
    @CurrentUser() currentUser: RequestUser,
  ) {
    return this.projectsService.updateDraft(id, updateDto, currentUser);
  }

  @Post(':id/assign')
  @Roles(Role.PROJECT_MANAGER, Role.ADMINISTRATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign engineer to project (PM / Admin)' })
  @ApiResponse({ status: 200, description: 'Project assigned successfully' })
  @ApiResponse({ status: 400, description: 'User does not have ENGINEER role' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: PM / Admin role required',
  })
  @ApiResponse({ status: 404, description: 'Project or Engineer not found' })
  async assignEngineer(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignDto: AssignEngineerDto,
    @CurrentUser() currentUser: RequestUser,
  ) {
    return this.projectsService.assignEngineer(id, assignDto, currentUser);
  }
}

