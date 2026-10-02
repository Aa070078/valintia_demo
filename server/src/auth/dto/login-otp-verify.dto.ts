import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { EmailOtpRequestDto } from './email-otp-request.dto.js';

/** LOGIN is fixed by the endpoint; a caller cannot substitute another purpose. */
export class LoginOtpVerifyDto extends EmailOtpRequestDto {
  @ApiProperty({
    example: '123456',
    description: 'Six-digit LOGIN OTP from the account inbox',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{6}$/)
  otp!: string;
}
