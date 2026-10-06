import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { ALLOWED_SPACE_TYPES } from './project-enums.js';

/**
 * --------------------------------------------------------------------------
 * Spaces
 * --------------------------------------------------------------------------
 *
 * Each entry represents one actual physical space.
 *
 * The frontend is responsible for expanding quantities into individual
 * space records before sending the request.
 *
 * Example:
 *
 * {
 *   "spaces": [
 *     {
 *       "type": "bedroom",
 *       "customName": "Master Bedroom"
 *     },
 *     {
 *       "type": "bedroom",
 *       "customName": "Kids Bedroom"
 *     },
 *     {
 *       "type": "bathroom",
 *       "customName": "Master Bathroom"
 *     }
 *   ]
 * }
 *
 * Each entry is stored as a separate Space record and receives its own
 * database ID.
 */

export class SpaceDto {
  @ApiProperty({
    example: 'bedroom',
    enum: ALLOWED_SPACE_TYPES,
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(ALLOWED_SPACE_TYPES)
  type!: string;

  @ApiPropertyOptional({
    example: 'Master Bedroom',
    description:
      'Optional custom name for this individual space.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  customName?: string;
}