import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Role } from '../../generated/prisma/client.js';

export class CreateInternalUserDto {
  @ApiPropertyOptional({ example: 'Ahmed' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Mohamed' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 1998 })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  birthYear?: number;

  @ApiPropertyOptional({ example: 'AhmedMoh98' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ enum: Role, example: Role.ENGINEER })
  @IsEnum(Role)
  @IsNotEmpty()
  role!: Role;
}
