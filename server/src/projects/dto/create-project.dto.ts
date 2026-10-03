
/**
 * --------------------------------------------------------------------------
 * Create Project DTO
 * --------------------------------------------------------------------------
 *
 * IMPORTANT:
 *
 * This DTO intentionally supports partial draft creation.
 *
 * The wizard can call:
 *
 * Step 1:
 * {
 *   "property": {
 *     "propertyType": "villa"
 *   }
 * }
 *
 * Step 2:
 * {
 *   "property": {
 *     "city": "New Cairo",
 *     "areaSqm": 250
 *   }
 * }
 *
  * Step 3:
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
 * And so on.
 *
 * The project remains DRAFT until the submit endpoint performs the
 * complete business validation.
 */

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';


import { PropertyDto } from './property.dto.js';
import { SpaceDto } from './space.dto.js';
import { ProjectStylePreferenceDto } from './style-preference.dto.js';
import { CustomerLocationDto } from './customer-location.dto.js';
import { RepresentativeDto } from './representative.dto.js';
import { ProjectScopeDto } from './project-scope.dto.js';
import { ProjectBudgetDto } from './project-budget.dto.js';
import { TargetCompletionDto } from './target-completion.dto.js';

export class CreateProjectDto {
  @ApiPropertyOptional({
    example: 'New Villa Interior Design',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({
    type: PropertyDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyDto)
  property?: PropertyDto;

  @ApiPropertyOptional({
    type: [SpaceDto],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SpaceDto)
  spaces?: SpaceDto[];

  @ApiPropertyOptional({
    type: ProjectStylePreferenceDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectStylePreferenceDto)
  stylePreference?: ProjectStylePreferenceDto;

  @ApiPropertyOptional({
    type: CustomerLocationDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerLocationDto)
  customerLocation?: CustomerLocationDto;

  @ApiPropertyOptional({
    type: RepresentativeDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RepresentativeDto)
  representative?: RepresentativeDto;

  @ApiPropertyOptional({
    type: ProjectScopeDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectScopeDto)
  scope?: ProjectScopeDto;

  @ApiPropertyOptional({
    type: ProjectBudgetDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectBudgetDto)
  budget?: ProjectBudgetDto;

  @ApiPropertyOptional({
    type: TargetCompletionDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TargetCompletionDto)
  timeline?: TargetCompletionDto;
}
