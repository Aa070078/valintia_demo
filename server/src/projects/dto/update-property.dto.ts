import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class UpdatePropertyDto {
  @ApiPropertyOptional({ example: 'VILLA', description: 'Type of property' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  propertyType?: string;

  @ApiPropertyOptional({ example: 450.5, description: 'Area in square meters' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  areaSqm?: number;

  @ApiPropertyOptional({ example: 'Cairo', description: 'City location' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;

  @ApiPropertyOptional({
    example: 'Palm Hills',
    description: 'Compound or residential complex name',
  })
  @IsOptional()
  @IsString()
  compound?: string;
}
