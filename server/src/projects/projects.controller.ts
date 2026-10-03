import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,

} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
  ApiTags,
} from '@nestjs/swagger';
import {
  FileInterceptor,
} from '@nestjs/platform-express';

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
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { UploadProjectDocumentDto } from './dto/upload-project-document.dto.js';


const projectUploadStorage = diskStorage({
  destination: (_req, _file, cb) => {
    const tempDirectory = path.join(
      process.cwd(),
      'uploads',
      'tmp',
    );

    mkdirSync(tempDirectory, {
      recursive: true,
    });

    cb(null, tempDirectory);
  },

  filename: (_req, file, cb) => {
    cb(
      null,
      `${randomUUID()}${extname(file.originalname)}`,
    );
  },
});

@ApiTags('projects')
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class ProjectsController {
  constructor(
    @Inject(ProjectsService) private readonly projectsService: ProjectsService,
  ) { }

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

  @Get('engineers')
  @Roles(Role.PROJECT_MANAGER, Role.ADMINISTRATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all eligible engineers (PM / Admin)' })
  @ApiResponse({ status: 200, description: 'List of engineers' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Requires PM or Admin role' })
  async getEligibleEngineers() {
    return this.projectsService.getEligibleEngineers();
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
    description:
      'Bad Request: Validation error or project is not in DRAFT status',
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

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit a DRAFT project (Customer)' })
  @ApiResponse({ status: 200, description: 'Project submitted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Project is not in DRAFT status',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Insufficient access to project',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async submitProject(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: RequestUser,
  ) {
    return this.projectsService.submitProject(id, currentUser);
  }

  @Post(':id/assign-engineer')
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


  @Post(':id/documents')
  @Roles(Role.CUSTOMER)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: projectUploadStorage,
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        category: {
          type: 'string',
          example: 'contract',
        },
      },
      required: ['file', 'category'],
    },
  })
  @ApiOperation({
    summary: 'Upload a project document',
  })
  @ApiResponse({
    status: 201,
    description: 'Project document uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or document category',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: User cannot modify this project',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async uploadDocument(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: {
      originalname: string;
      mimetype: string;
      size: number;
      path: string;
    },
    @Body() uploadDto: UploadProjectDocumentDto,
    @CurrentUser() currentUser: RequestUser,
  ) {
    return this.projectsService.uploadDocument(
      id,
      file,
      uploadDto,
      currentUser,
    );
  }

  @Post(':id/cover-image')
  @Roles(Role.CUSTOMER)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: projectUploadStorage,
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiOperation({
    summary: 'Upload or replace project cover image',
  })
  @ApiResponse({
    status: 201,
    description: 'Project cover image uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid image or project is not editable',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: User cannot modify this project',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async uploadCoverImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile()
    file: {
      originalname: string;
      mimetype: string;
      size: number;
      path: string;
    },
    @CurrentUser() currentUser: RequestUser,
  ) {
    return this.projectsService.uploadCoverImage(
      id,
      file,
      currentUser,
    );
  }

  @Delete(':id/documents/:documentId')
  @Roles(Role.CUSTOMER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a project document',
  })
  @ApiResponse({
    status: 204,
    description: 'Project document deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: User cannot modify this project',
  })
  @ApiResponse({
    status: 404,
    description: 'Project or document not found',
  })
  async deleteDocument(
    @Param('id', ParseIntPipe) id: number,
    @Param('documentId', ParseIntPipe) documentId: number,
    @CurrentUser() currentUser: RequestUser,
  ) {
    await this.projectsService.deleteDocument(
      id,
      documentId,
      currentUser,
    );
  }
}
