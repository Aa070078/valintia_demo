import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'customer@example.com' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    description:
      'Token returned by /api/otp/verify for EMAIL_VERIFICATION of this username/email',
  })
  @IsString()
  @IsNotEmpty()
  verificationToken!: string;
}
