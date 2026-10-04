import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../generated/prisma/client.js';

export class AuthIdentityDto {
  @ApiProperty() id!: number;
  @ApiProperty() username!: string;
  @ApiProperty({ type: String, nullable: true }) email!: string | null;
  @ApiProperty() emailVerified!: boolean;
  @ApiProperty({ enum: Role }) role!: Role;
  @ApiProperty() mustChangePassword!: boolean;
  @ApiProperty() onboardingRequired!: boolean;
}
export class AccessLoginResponseDto {
  @ApiProperty({
    description: 'Normal application JWT containing sub and role',
  })
  accessToken!: string;
  @ApiProperty({ type: AuthIdentityDto }) user!: AuthIdentityDto;
}
export class OnboardingLoginResponseDto {
  @ApiProperty({
    description:
      '15-minute restricted bearer credential. Only me, onboarding email request/verify and change-password. Revoked by reissue or activation.',
  })
  onboardingToken!: string;
  @ApiProperty({ example: true }) onboardingRequired!: boolean;
  @ApiProperty({ type: AuthIdentityDto }) user!: AuthIdentityDto;
}
export class EmailEnrollmentResponseDto {
  @ApiProperty() success!: boolean;
  @ApiProperty() email!: string;
  @ApiProperty() emailVerified!: boolean;
  @ApiProperty() mustChangePassword!: boolean;
  @ApiProperty() onboardingComplete!: boolean;
  @ApiProperty() message!: string;
}
