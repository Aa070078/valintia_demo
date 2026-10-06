import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import { ALLOWED_STYLE_PREFERENCE_MODES } from './project-enums.js';

/**
 * --------------------------------------------------------------------------
 * Space style preference
 * --------------------------------------------------------------------------
 *
 * A space style references an already-existing style from the frontend
 * style catalog.
 *
 * Reference images belonging to the static style catalog are NOT stored
 * in every project record.
 */

export class SpaceStylePreferenceDto {
  @ApiProperty({
    example: 101,
    description: 'Actual Space database ID.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  spaceId!: number;

  @ApiProperty({
    example: 'modern',
    description: 'Style ID from the style catalog.',
  })
  @IsString()
  @IsNotEmpty()
  styleId!: string;

  @ApiPropertyOptional({
    example: 'Modern',
    description: 'Optional style-name snapshot.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  styleName?: string;

  @ApiPropertyOptional({
    example: 'Warm colors and more storage.',
    description: 'Optional notes for this specific space style.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  notes?: string;
}

/**
 * --------------------------------------------------------------------------
 * Project style preference
 * --------------------------------------------------------------------------
 *
 * Modes:
 *
 * WHOLE_PROJECT
 *   One style applies to the entire project.
 *
 * PER_SPACE
 *   Each actual Space can have its own style.
 *
 * ENGINEER_DECIDES
 *   Customer does not select a style.
 */

export class ProjectStylePreferenceDto {
  @ApiProperty({
    example: 'whole_project',
    enum: ALLOWED_STYLE_PREFERENCE_MODES,
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(ALLOWED_STYLE_PREFERENCE_MODES)
  mode!: string;

  @ApiPropertyOptional({
    example: 'modern',
    description:
      'Required when mode is whole_project. Style ID comes from the style catalog.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  styleId?: string;

  @ApiPropertyOptional({
    example: 'Modern',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  styleName?: string;

  @ApiPropertyOptional({
    example: 'Customer prefers warm neutral colors.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  notes?: string;

  @ApiPropertyOptional({
    type: [SpaceStylePreferenceDto],
    description:
      'Used when mode is per_space. Each entry references an actual Space ID.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpaceStylePreferenceDto)
  spacePreferences?: SpaceStylePreferenceDto[];
}