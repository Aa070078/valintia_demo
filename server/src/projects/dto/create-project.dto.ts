import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreatePropertyDto } from './create-property.dto.js';
import { CreateSpaceDto } from './create-space.dto.js';

export class CreateProjectDto {
  @ApiProperty({
    example: 'Palm Hills Modern Villa',
    description: 'Project title',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({
    example: 'Client requested modern minimalist interior',
    description: 'Additional notes or requirements',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    type: () => CreatePropertyDto,
    description: 'Property details',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePropertyDto)
  property?: CreatePropertyDto;

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
