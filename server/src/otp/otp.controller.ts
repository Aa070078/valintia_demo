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
import { OtpProofService } from './otp-proof.service.js';

@ApiTags('otp')
@Controller('otp')
export class OtpController {
  constructor(
    @Inject(OtpProofService) private readonly otpProof: OtpProofService,
  ) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Send registration OTP; use auth request endpoints for reset/login',
  })
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
    description: 'Too Many Requests: Code request cooldown active',
  })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.otpProof.sendRegistrationOtp(sendOtpDto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify submitted OTP' })
  @ApiResponse({
    status: 200,
    description:
      'EMAIL_VERIFICATION returns verificationToken; PASSWORD_RESET returns passwordResetToken. Use /api/auth/login/otp/verify for LOGIN.',
    schema: {
      type: 'object',
      required: ['success', 'message', 'verified'],
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Verification code verified successfully',
        },
        verified: { type: 'boolean', example: true },
        verificationToken: {
          type: 'string',
          description:
            'Returned only for EMAIL_VERIFICATION; submit in the registration body.',
        },
        passwordResetToken: {
          type: 'string',
          description:
            'Returned only for PASSWORD_RESET; accepted only by reset-password.',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request: Invalid code, expired code, or maximum attempts exceeded',
  })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.otpProof.verifyAndIssueProof(verifyOtpDto);
  }
}
