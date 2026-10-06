import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

type UploadedFile = {
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
};
@Injectable()
export class FilesService {
  private readonly uploadsRoot = path.join(
    process.cwd(),
    'uploads',
  );

  private readonly allowedDocumentMimeTypes = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ]);

  private readonly allowedImageMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
  ]);

  async saveProjectDocument(
    projectId: number,
    file: UploadedFile
  ) {
    this.validateFile(
      file,
      this.allowedDocumentMimeTypes,
      'document',
    );

    const projectDirectory = path.join(
      this.uploadsRoot,
      'projects',
      String(projectId),
      'documents',
    );

    await fs.mkdir(projectDirectory, {
      recursive: true,
    });

const safeOriginalName =
  this.sanitizeFileName(file.originalname);

let storedFileName =
  safeOriginalName;

let counter = 1;

while (
  await this.fileExists(
    path.join(
      projectDirectory,
      storedFileName,
    ),
  )
) {
  const extension =
    path.extname(safeOriginalName);

  const baseName =
    path.basename(
      safeOriginalName,
      extension,
    );

  storedFileName =
    `${baseName}-${counter}${extension}`;

  counter++;
}

    const destinationPath =
      path.join(
        projectDirectory,
        storedFileName,
      );

    await fs.rename(
      file.path,
      destinationPath,
    );

    return {
      name: safeOriginalName,
      url: `/uploads/projects/${projectId}/documents/${storedFileName}`,
      sizeBytes: file.size,
    };
  }

  async saveProjectCoverImage(
    projectId: number,
    file: UploadedFile
  ) {
    this.validateFile(
      file,
      this.allowedImageMimeTypes,
      'image',
    );

    const projectDirectory = path.join(
      this.uploadsRoot,
      'projects',
      String(projectId),
      'cover',
    );

    await fs.mkdir(projectDirectory, {
      recursive: true,
    });

    const extension =
      path.extname(
        this.sanitizeFileName(
          file.originalname,
        ),
      );

    const storedFileName =
      `${randomUUID()}${extension}`;

    const destinationPath =
      path.join(
        projectDirectory,
        storedFileName,
      );

    await fs.rename(
      file.path,
      destinationPath,
    );

    return {
      url: `/uploads/projects/${projectId}/cover/${storedFileName}`,
      sizeBytes: file.size,
    };
  }

  async deleteFileByUrl(
    url: string,
  ): Promise<void> {
    if (!url.startsWith('/uploads/')) {
      return;
    }

    const relativePath =
      url.replace(
        /^\/uploads\//,
        '',
      );

    const filePath =
      path.join(
        this.uploadsRoot,
        relativePath,
      );

    const resolvedRoot =
      path.resolve(
        this.uploadsRoot,
      );

    const resolvedFile =
      path.resolve(filePath);

    if (
      !resolvedFile.startsWith(
        `${resolvedRoot}${path.sep}`,
      )
    ) {
      return;
    }

    try {
      await fs.unlink(
        resolvedFile,
      );
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        return;
      }

      throw error;
    }
  }

  private validateFile(
    file: UploadedFile,
    allowedMimeTypes: Set<string>,
    type: 'document' | 'image',
  ): void {
    if (!file) {
      throw new BadRequestException(
        'File is required.',
      );
    }

    if (
      !allowedMimeTypes.has(
        file.mimetype,
      )
    ) {
      throw new BadRequestException(
        `Unsupported ${type} file type.`,
      );
    }

    if (file.size <= 0) {
      throw new BadRequestException(
        'Uploaded file is empty.',
      );
    }
  }

  private sanitizeFileName(
    fileName: string,
  ): string {
    const baseName =
      path.basename(fileName);

    return baseName
      .replace(
        /[^a-zA-Z0-9._-]/g,
        '_',
      )
      .replace(
        /_+/g,
        '_',
      );
  }

  private async fileExists(
  filePath: string,
): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
}