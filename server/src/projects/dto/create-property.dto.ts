import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreatePropertyDto {
  @ApiProperty({
    example: 'VILLA',
    description: 'Type of property (e.g. VILLA, APARTMENT)',
  })
  @IsString()
  @IsNotEmpty()
  propertyType!: string;

  @ApiProperty({ example: 450.5, description: 'Area in square meters' })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  areaSqm!: number;

  @ApiProperty({ example: 'Cairo', description: 'City location' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiPropertyOptional({
    example: 'Palm Hills',
    description: 'Compound or residential complex name',
  })
  @IsOptional()
  @IsString()
  compound?: string;
}
