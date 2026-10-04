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
  ApiExtraModels,
  getSchemaPath,
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
import { AllowOnboarding } from '../common/decorators/allow-onboarding.decorator.js';
import { OnboardingService } from './onboarding.service.js';
import { OnboardingEmailVerifyDto } from './dto/onboarding-email-verify.dto.js';
import {
  AccessLoginResponseDto,
  OnboardingLoginResponseDto,
  AuthIdentityDto,
  EmailEnrollmentResponseDto,
} from './dto/identity-response.dto.js';

@ApiTags('auth')
@ApiExtraModels(AccessLoginResponseDto, OnboardingLoginResponseDto)
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(OnboardingService) private readonly onboarding: OnboardingService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Password login with real email or temporary onboarding identifier',
    description:
      'Supply only email and password. Incomplete ENGINEER, PROJECT_MANAGER and COMPANY_OWNER accounts supply temporaryLogin through email and receive onboardingToken only. Completed staff accounts use their verified real email and permanent password to receive accessToken.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      oneOf: [
        { $ref: getSchemaPath(AccessLoginResponseDto) },
        { $ref: getSchemaPath(OnboardingLoginResponseDto) },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid payload: email and password are required; additional properties are rejected',
  })
  @ApiResponse({
    status: 429,
    description:
      'Temporary login limited to five attempts per identifier per 15 minutes',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request PASSWORD_RESET OTP without revealing account existence',
    description:
      'Verified real email of an active account only. Temporary login identifiers and incomplete internal accounts never receive recovery mail.',
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
    description:
      'Verified real email of an active account only; never temporaryLogin.',
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
  @AllowOnboarding()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current authenticated user identity and role' })
  @ApiResponse({
    status: 200,
    description: 'Current account/onboarding state',
    type: AuthIdentityDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized / invalid token' })
  async getMe(@CurrentUser() currentUser: RequestUser) {
    return this.authService.getMe(currentUser.id);
  }

  @Post('change-password')
  @AllowOnboarding()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Replace password for authenticated account',
    description:
      'Allowed with onboardingToken; temporary password need not be submitted again. Must choose a different password. Completion revokes onboardingToken; sign in with verified email and new password for normal access.',
  })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized / invalid token' })
  async changePassword(
    @CurrentUser() currentUser: RequestUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(currentUser, changePasswordDto);
  }

  @Post('onboarding/email/request')
  @AllowOnboarding()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request/resend account-bound real-email verification',
    description:
      'Use onboardingToken. EMAIL_VERIFICATION purpose is fixed. Email is not persisted until verification. Also allows historical customers/admins to verify an unverified real email. Cannot replace an already verified email.',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent to real email; delivery and expiry metadata only',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or temporary email destination',
  })
  @ApiResponse({ status: 401, description: 'Expired/revoked session' })
  @ApiResponse({
    status: 403,
    description: 'Current onboarding session required',
  })
  @ApiResponse({
    status: 409,
    description: 'Duplicate email or account already verified',
  })
  @ApiResponse({ status: 429, description: 'Code request cooldown' })
  requestOnboardingEmail(
    @CurrentUser() actor: RequestUser,
    @Body() dto: EmailOtpRequestDto,
  ) {
    return this.onboarding.requestEmail(actor, dto.email);
  }

  @Post('onboarding/email/verify')
  @AllowOnboarding()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify real email for the authenticated onboarding account',
    description:
      'Accepts only the OTP requested by this account and current provisioning generation for this exact email. Public registration proof is not accepted. Completing both onboarding requirements revokes the onboarding token; sign in again.',
  })
  @ApiResponse({ status: 200, type: EmailEnrollmentResponseDto })
  @ApiResponse({
    status: 400,
    description:
      'Invalid payload/code, attempts exhausted, expired or consumed code',
  })
  @ApiResponse({ status: 401, description: 'Expired/revoked session' })
  @ApiResponse({
    status: 403,
    description: 'Current onboarding session required',
  })
  @ApiResponse({
    status: 409,
    description: 'Duplicate email or account already verified',
  })
  verifyOnboardingEmail(
    @CurrentUser() actor: RequestUser,
    @Body() dto: OnboardingEmailVerifyDto,
  ) {
    return this.onboarding.verifyEmail(actor, dto.email, dto.otp);
  }
}
