import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';


/**
 * --------------------------------------------------------------------------
 * Customer location
 * --------------------------------------------------------------------------
 */

export class CustomerLocationDto {
  @ApiPropertyOptional({
    example: 'Egypt',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  country?: string;

  @ApiPropertyOptional({
    example: 'EG',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  countryCode?: string;

  @ApiPropertyOptional({
    example: 'Cairo',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;

  @ApiPropertyOptional({
    example: 'Africa/Cairo',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  timezone?: string;

  @ApiPropertyOptional({
    example: '+201001234567',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phone?: string;

  @ApiPropertyOptional({
    example: '+20',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phoneCountryCode?: string;
}