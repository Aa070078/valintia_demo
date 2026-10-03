import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { ALLOWED_DEADLINE_TYPES } from './project-enums.js';

/**
 * --------------------------------------------------------------------------
 * Target completion
 * --------------------------------------------------------------------------
 */
export class TargetCompletionDto {
  @ApiPropertyOptional({
    example: 'specific_date',
    enum: ALLOWED_DEADLINE_TYPES,
  })
  @IsOptional()
  @IsString()
  @IsIn(ALLOWED_DEADLINE_TYPES)
  deadlineType?: string;

  @ApiPropertyOptional({
    example: '2027-06-30T00:00:00.000Z',
    description:
      'Required when deadlineType is specific_date.',
  })
  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @ApiPropertyOptional({
    example: '6 months',
    description:
      'Required when deadlineType is duration.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  durationDescription?: string;
}