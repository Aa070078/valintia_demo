import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { ALLOWED_SCOPE_TYPES } from './project-enums.js';
/**
 * --------------------------------------------------------------------------
 * Project scope
 * --------------------------------------------------------------------------
 */
export class ProjectScopeDto {
  @ApiPropertyOptional({
    example: 'full_fitout',
    enum: ALLOWED_SCOPE_TYPES,
  })
  @IsOptional()
  @IsString()
  @IsIn(ALLOWED_SCOPE_TYPES)
  scopeType?: string;

  @ApiPropertyOptional({
    example: 'Focus on functional family spaces.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  notes?: string;
}