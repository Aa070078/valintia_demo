import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { OtpPurpose } from '../enums/otp-purpose.enum.js';

/** Selects the normalized inbox and purpose for a challenge, not account creation. */
export class SendOtpDto {
  @ApiProperty({
    example: 'customer@example.com',
    description: 'Email address to send the verification OTP to',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  email!: string;

  @ApiPropertyOptional({
    enum: OtpPurpose,
    default: OtpPurpose.EMAIL_VERIFICATION,
    example: OtpPurpose.EMAIL_VERIFICATION,
    description: 'Purpose or context of the OTP',
  })
  @IsOptional()
  @IsEnum(OtpPurpose, {
    message:
      'Purpose must be one of: EMAIL_VERIFICATION, PASSWORD_RESET, LOGIN',
  })
  purpose?: OtpPurpose = OtpPurpose.EMAIL_VERIFICATION;
}
