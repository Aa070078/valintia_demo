import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/** Registration consumes OTP proof; it does not accept frontend verified flags. */
export class RegisterDto {
  // Existing contract uses username for the email bound to verificationToken.
  @ApiProperty({ example: 'customer@example.com' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  // Required proof from /otp/verify, not an access JWT; service verification checks
  // its authenticity, expiry, purpose, and email beyond this DTO's string checks.
  @ApiProperty({
    description:
      'Token returned by /api/otp/verify for EMAIL_VERIFICATION of this username/email',
  })
  @IsString()
  @IsNotEmpty()
  verificationToken!: string;
}
