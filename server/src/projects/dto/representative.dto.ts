import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * --------------------------------------------------------------------------
 * Project representative
 * --------------------------------------------------------------------------
 */

export class RepresentativeDto {
  @ApiPropertyOptional({
    example: false,
    description:
      'Whether the customer has an external representative.',
  })
  @IsOptional()
  @IsBoolean()
  hasRepresentative?: boolean;

  @ApiPropertyOptional({
    example: true,
    description:
      'Whether Valentia manages the project directly without an external representative.',
  })
  @IsOptional()
  @IsBoolean()
  valentiaManagedDirectly?: boolean;

  @ApiPropertyOptional({
    example: 'Ahmed Mohamed',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

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

  @ApiPropertyOptional({
    example: 'ahmed@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'Property Owner',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  relationship?: string;

  @ApiPropertyOptional({
    example:
      'Can approve design changes and coordinate site access.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  authorizationScope?: string;
}