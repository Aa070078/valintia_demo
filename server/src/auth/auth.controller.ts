import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { RequestUser } from '../common/decorators/current-user.decorator.js';
import { AuthService } from './auth.service.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { EmailOtpRequestDto } from './dto/email-otp-request.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { LoginOtpVerifyDto } from './dto/login-otp-verify.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User authentication login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request PASSWORD_RESET OTP without revealing account existence',
  })
  @ApiResponse({
    status: 200,
    description:
      'Generic response for existing/unknown accounts, cooldown, or delivery failures',
  })
  @ApiResponse({ status: 400, description: 'Invalid email or payload' })
  forgotPassword(@Body() dto: EmailOtpRequestDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('login/otp/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request LOGIN OTP; purpose is fixed by the endpoint',
  })
  @ApiResponse({
    status: 200,
    description:
      'Generic response regardless of account existence, cooldown or delivery failure',
  })
  @ApiResponse({ status: 400, description: 'Invalid email or payload' })
  requestLoginOtp(@Body() dto: EmailOtpRequestDto) {
    return this.authService.requestLoginOtp(dto);
  }

  @Post('login/otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify LOGIN OTP and authenticate using the normal access JWT',
  })
  @ApiResponse({
    status: 200,
    description:
      'Same accessToken and user identity response as password login',
    schema: {
      type: 'object',
      required: ['accessToken', 'user'],
      properties: {
        accessToken: {
          type: 'string',
          description: 'Authentication JWT containing sub and role',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            role: { type: 'string' },
            mustChangePassword: { type: 'boolean' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email/OTP payload; purpose must not be supplied',
  })
  @ApiResponse({
    status: 401,
    description:
      'Invalid/expired/already-used code, attempts exceeded or no matching account',
  })
  loginWithOtp(@Body() dto: LoginOtpVerifyDto) {
    return this.authService.loginWithOtp(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Reset password using PASSWORD_RESET proof; does not revoke existing access JWTs',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully; proof can no longer be reused',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid, expired, already-used or wrong-purpose reset proof; invalid password',
  })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Customer self-registration' })
  @ApiResponse({ status: 201, description: 'Customer account created' })
  @ApiResponse({
    status: 400,
    description:
      'Validation failure or invalid/expired email verification token',
  })
  @ApiResponse({ status: 409, description: 'Duplicate username' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current authenticated user identity and role' })
  @ApiResponse({ status: 200, description: 'Current user retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized / invalid token' })
  async getMe(@CurrentUser() currentUser: RequestUser) {
    return this.authService.getMe(currentUser.id);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Change password for authenticated user' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized / invalid token' })
  async changePassword(
    @CurrentUser() currentUser: RequestUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(currentUser.id, changePasswordDto);
  }
}
