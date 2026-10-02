import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'PASSWORD_RESET proof returned by /api/otp/verify',
  })
  @IsString()
  @IsNotEmpty()
  passwordResetToken!: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword!: string;
}
