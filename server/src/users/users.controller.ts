import {
  Body,
  Controller,
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Role } from '../generated/prisma/client.js';
import { CreateInternalUserDto } from './dto/create-internal-user.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {}

  @Post()
  @Roles(Role.ADMINISTRATOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create internal persona account (Admin only)' })
  @ApiResponse({ status: 201, description: 'Internal user account created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Requires ADMINISTRATOR role',
  })
  @ApiResponse({ status: 400, description: 'Validation failure' })
  async createInternalUser(@Body() createDto: CreateInternalUserDto) {
    return this.usersService.createInternalUser(createDto);
  }
}
