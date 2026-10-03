import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { RequestUser } from '../common/decorators/current-user.decorator.js';

import {
  ProjectStatus,
  Role,
} from '../generated/prisma/client.js';

import { PrismaService } from '../infrastructure/database/prisma.service.js';

import { FilesService } from '../files/files.service.js';

import { UploadProjectDocumentDto } from './dto/upload-project-document.dto.js';
import { toPrismaDocumentCategory } from './projects.mapper.js';

@Injectable()
export class ProjectDocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
  ) {}

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
    if (currentUser.role !== Role.CUSTOMER) {
      throw new ForbiddenException(
        'Only customers can upload project documents.',
      );
    }

    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
      select: {
        id: true,
        clientId: true,
        status: true,
      },
    });

    if (!project) {
      throw new NotFoundException(
        'Project not found.',
      );
    }

    if (project.clientId !== currentUser.id) {
      throw new ForbiddenException(
        'You do not have access to this project.',
      );
    }

    if (project.status !== ProjectStatus.DRAFT) {
      throw new BadRequestException(
        'Documents can only be uploaded while the project is in DRAFT status.',
      );
    }

    const storedFile =
      await this.filesService.saveProjectDocument(
        projectId,
        file,
      );

    try {
      return await this.prisma.projectDocument.create({
        data: {
          projectId,
          name: storedFile.name,
          category: toPrismaDocumentCategory(
            uploadDto.category,
          ),
          url: storedFile.url,
          sizeBytes: storedFile.sizeBytes,
        },
      });
    } catch (error) {
      await this.filesService.deleteFileByUrl(
        storedFile.url,
      );

      throw error;
    }
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
    if (currentUser.role !== Role.CUSTOMER) {
      throw new ForbiddenException(
        'Only customers can upload project cover images.',
      );
    }

    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
      select: {
        id: true,
        clientId: true,
        status: true,
        coverImage: true,
      },
    });

    if (!project) {
      throw new NotFoundException(
        'Project not found.',
      );
    }

    if (project.clientId !== currentUser.id) {
      throw new ForbiddenException(
        'You do not have access to this project.',
      );
    }

    if (project.status !== ProjectStatus.DRAFT) {
      throw new BadRequestException(
        'The cover image can only be changed while the project is in DRAFT status.',
      );
    }

    const oldCoverImage = project.coverImage;

    const storedFile =
      await this.filesService.saveProjectCoverImage(
        projectId,
        file,
      );

    try {
      const updatedProject =
        await this.prisma.project.update({
          where: {
            id: projectId,
          },
          data: {
            coverImage: storedFile.url,
          },
          select: {
            id: true,
            coverImage: true,
          },
        });

      if (oldCoverImage) {
        await this.filesService.deleteFileByUrl(
          oldCoverImage,
        );
      }

      return updatedProject;
    } catch (error) {
      await this.filesService.deleteFileByUrl(
        storedFile.url,
      );

      throw error;
    }
  }

  async deleteDocument(
    projectId: number,
    documentId: number,
    currentUser: RequestUser,
  ): Promise<void> {
    if (currentUser.role !== Role.CUSTOMER) {
      throw new ForbiddenException(
        'Only customers can delete project documents.',
      );
    }

    const document =
      await this.prisma.projectDocument.findUnique({
        where: {
          id: documentId,
        },
        select: {
          id: true,
          projectId: true,
          url: true,
          project: {
            select: {
              clientId: true,
              status: true,
            },
          },
        },
      });

    if (!document) {
      throw new NotFoundException(
        'Project document not found.',
      );
    }

    if (document.projectId !== projectId) {
      throw new NotFoundException(
        'Project document not found.',
      );
    }

    if (
      document.project.clientId !== currentUser.id
    ) {
      throw new ForbiddenException(
        'You do not have access to this project.',
      );
    }

    if (
      document.project.status !== ProjectStatus.DRAFT
    ) {
      throw new BadRequestException(
        'Documents can only be deleted while the project is in DRAFT status.',
      );
    }

    await this.prisma.projectDocument.delete({
      where: {
        id: documentId,
      },
    });

    await this.filesService.deleteFileByUrl(
      document.url,
    );
  }
}