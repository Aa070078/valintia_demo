import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { SpaceType } from '../../generated/prisma/client.js';

export class CreateSpaceDto {
  @ApiProperty({
    enum: SpaceType,
    example: SpaceType.LIVING_ROOM,
    description: 'Type of space',
  })
  @IsEnum(SpaceType)
  @IsNotEmpty()
  type!: SpaceType;
}
