import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

import {
  ALLOWED_PROPERTY_CONDITIONS,
  ALLOWED_PROPERTY_TYPES,
} from './project-enums.js';

/**
 * --------------------------------------------------------------------------
 * Property
 * --------------------------------------------------------------------------
 *
 * The fields are optional intentionally.
 *
 * The project wizard saves progressively:
 * Step 1 may send only propertyType.
 * Step 2 can later send city, areaSqm, condition, etc.
 *
 * Final required-field validation belongs to the submit workflow.
 */
export class PropertyDto {
  @ApiPropertyOptional({
    example: 'villa',
    enum: ALLOWED_PROPERTY_TYPES,
  })
  @IsOptional()
  @IsString()
  @IsIn(ALLOWED_PROPERTY_TYPES)
  propertyType?: string;

  @ApiPropertyOptional({
    example: 'Mountain View',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  compound?: string;

  @ApiPropertyOptional({
    example: 'Cairo',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  governorate?: string;

  @ApiPropertyOptional({
    example: 'New Cairo',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;

  @ApiPropertyOptional({
    example: 250.5,
    description: 'Property area in square meters.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  areaSqm?: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'Number of floors.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  floors?: number;

  @ApiPropertyOptional({
    example: 'semi_finished',
    enum: ALLOWED_PROPERTY_CONDITIONS,
  })
  @IsOptional()
  @IsString()
  @IsIn(ALLOWED_PROPERTY_CONDITIONS)
  condition?: string;

  @ApiPropertyOptional({
    example: 'Main entrance has limited accessibility.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  accessibilityNotes?: string;
}