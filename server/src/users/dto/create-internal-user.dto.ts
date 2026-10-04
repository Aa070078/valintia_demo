import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Role } from '../../generated/prisma/client.js';
import { INTERNAL_ROLES } from '../../auth/identity-policy.js';

export class CreateInternalUserDto {
  @ApiProperty({ example: 'Abd', maxLength: 80 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  firstName!: string;

  @ApiProperty({ example: 'Mohamed', maxLength: 80 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  lastName!: string;

  @ApiProperty({ example: 1998, minimum: 1900, maximum: 2100 })
  @IsInt()
  @Min(1900)
  @Max(2100)
  birthYear!: number;

  @ApiProperty({
    enum: INTERNAL_ROLES,
    example: Role.ENGINEER,
  })
  @IsIn(INTERNAL_ROLES)
  role!: Role;
}
