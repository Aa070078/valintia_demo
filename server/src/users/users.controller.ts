import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Get,
  Post,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Role } from '../generated/prisma/client.js';
import { CreateInternalUserDto } from './dto/create-internal-user.dto.js';
import { UsersService } from './users.service.js';
import {
  CurrentUser,
  type RequestUser,
} from '../common/decorators/current-user.decorator.js';
import { TemporaryCredentialsResponseDto } from './dto/temporary-credentials-response.dto.js';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {}

  @Get()
  @Roles(Role.ADMINISTRATOR)
  @ApiOperation({
    summary: 'List internal staff and onboarding status (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Safe account metadata; no password hashes or onboarding secrets',
  })
  listInternalUsers() {
    return this.usersService.listInternalUsers();
  }

  @Post()
  @Roles(Role.ADMINISTRATOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Provision internal account (Admin only)',
    description:
      'Provide firstName, lastName, birthYear and role only. Backend generates credentials. temporaryLogin is not email; it authorizes restricted onboarding only. Verify a real email and replace the password before business access.',
  })
  @ApiResponse({
    status: 201,
    description: 'Generated credentials returned once',
    type: TemporaryCredentialsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Requires ADMINISTRATOR role',
  })
  @ApiResponse({ status: 400, description: 'Validation failure' })
  async createInternalUser(@Body() createDto: CreateInternalUserDto) {
    return this.usersService.createInternalUser(createDto);
  }

  @Post(':id/revoke-temporary-credentials')
  @Roles(Role.ADMINISTRATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke and reissue temporary onboarding credentials',
    description:
      'Atomically rotate login, password and generation; invalidate all previous onboarding sessions/challenges. Preserve user ID, username, role and project relationships. Audited without credential values. Completed accounts must use verified-email recovery.',
  })
  @ApiResponse({ status: 200, type: TemporaryCredentialsResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid user ID' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Administrator only' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 409,
    description: 'Account is active or not an internal onboarding account',
  })
  reissue(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() actor: RequestUser,
  ) {
    return this.usersService.reissue(id, actor.id);
  }
}
