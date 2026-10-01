import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { OtpPurpose } from '../enums/otp-purpose.enum.js';

export class VerifyOtpDto {
  @ApiProperty({
    example: 'customer@example.com',
    description: 'Email address associated with the OTP',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  email!: string;

  @ApiProperty({
    example: '482910',
    description: '6-digit numeric verification code',
  })
  @IsString({ message: 'OTP must be a string' })
  @IsNotEmpty({ message: 'OTP code is required' })
  @Matches(/^[0-9]{6}$/, { message: 'OTP must be a 6-digit numeric code' })
  otp!: string;

  @ApiPropertyOptional({
    enum: OtpPurpose,
    default: OtpPurpose.EMAIL_VERIFICATION,
    example: OtpPurpose.EMAIL_VERIFICATION,
    description: 'Purpose or context of the OTP to verify',
  })
  @IsOptional()
  @IsEnum(OtpPurpose, {
    message:
      'Purpose must be one of: EMAIL_VERIFICATION, PASSWORD_RESET, LOGIN, GENERAL',
  })
  purpose?: OtpPurpose = OtpPurpose.EMAIL_VERIFICATION;
}
