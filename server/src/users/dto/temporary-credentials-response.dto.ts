import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../generated/prisma/client.js';

export class TemporaryCredentialsResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty({ example: 'AbdMoh98' }) username!: string;
  @ApiProperty({
    example: 'abdmoh98@internal.local',
    description:
      'Provisioning login identifier, NOT an email or OTP destination. Invalid after expiry, reissue or activation.',
  })
  temporaryLogin!: string;
  @ApiProperty({
    example: 'Tmp!<random>',
    description:
      'Returned once to the administrator. Store only its bcrypt hash.',
  })
  temporaryPassword!: string;
  @ApiProperty({ enum: Role }) role!: Role;
  @ApiProperty() emailVerified!: boolean;
  @ApiProperty({ example: true }) mustChangePassword!: boolean;
  @ApiProperty({
    type: String,
    format: 'date-time',
    description: '48-hour default validity; configurable 24–72 hours',
  })
  temporaryCredentialsExpiresAt!: string;
  @ApiPropertyOptional({ type: String, format: 'date-time' })
  createdAt?: string;
}
