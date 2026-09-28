import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateSpaceDto } from './create-space.dto.js';
import { UpdatePropertyDto } from './update-property.dto.js';

export class UpdateProjectDto {
  @ApiPropertyOptional({
    example: 'Updated Villa Fit-Out',
    description: 'Project title',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated requirements and scope notes',
    description: 'Additional notes or requirements',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    type: () => UpdatePropertyDto,
    description: 'Property details to update',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePropertyDto)
  property?: UpdatePropertyDto;

  @ApiPropertyOptional({
    type: () => [CreateSpaceDto],
    description: 'List of spaces in the project',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSpaceDto)
  spaces?: CreateSpaceDto[];
}
