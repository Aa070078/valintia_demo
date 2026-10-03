import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../infrastructure/database/prisma.module.js';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';
import { FilesModule } from '../files/files.module.js';
import { ProjectStyleService } from './project-style.service.js';
import { ProjectDocumentsService } from './project-documents.service.js';

@Module({
  imports: [PrismaModule, AuthModule, FilesModule],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    ProjectStyleService,
    ProjectDocumentsService,
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}