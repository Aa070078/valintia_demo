import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

import { ALLOWED_DOCUMENT_CATEGORIES } from './project-enums.js';

export class UploadProjectDocumentDto {
  @ApiProperty({
    example: 'architectural',
    enum: ALLOWED_DOCUMENT_CATEGORIES,
    description:
      'Document category selected by the customer.',
  })
  @IsString()
  @IsIn(ALLOWED_DOCUMENT_CATEGORIES)
  category!: string;
}