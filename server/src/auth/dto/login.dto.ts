import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description:
      'Real email for permanent login. Incomplete internal accounts supply their generated temporaryLogin in this field.',
  })
  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'PermanentPassword123!' })
  password!: string;
}
