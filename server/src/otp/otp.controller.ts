import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SendOtpDto } from './dto/send-otp.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { OtpService } from './otp.service.js';

@ApiTags('otp')
@Controller('otp')
export class OtpController {
  constructor(@Inject(OtpService) private readonly otpService: OtpService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send email verification / authentication OTP' })
  @ApiResponse({
    status: 200,
    description: 'OTP generated and sent to email successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Invalid email or payload validation error',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests: Resend cooldown active',
  })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.otpService.generateAndSendOtp(sendOtpDto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify submitted OTP' })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully (single-use enforced)',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request: Invalid code, expired code, or maximum attempts exceeded',
  })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.otpService.verifyOtp(verifyOtpDto);
  }
}
