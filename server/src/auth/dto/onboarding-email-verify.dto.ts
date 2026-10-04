import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
import { EmailOtpRequestDto } from './email-otp-request.dto.js';

export class OnboardingEmailVerifyDto extends EmailOtpRequestDto {
  @ApiProperty({
    example: '482910',
    description:
      'EMAIL_VERIFICATION code requested by this account for this real email',
  })
  @IsString()
  @Matches(/^[0-9]{6}$/)
  otp!: string;
}
