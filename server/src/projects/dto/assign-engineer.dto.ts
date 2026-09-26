import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignEngineerDto {
  @ApiProperty({ example: 3, description: 'ID of the engineer to assign' })
  @IsInt()
  @IsNotEmpty()
  engineerId!: number;
}
