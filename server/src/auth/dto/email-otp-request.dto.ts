import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

/** Purpose is determined by the dedicated endpoint, never by the caller. */
export class EmailOtpRequestDto {
  @ApiProperty({
    example: 'customer@example.com',
    description:
      'Real email address; temporaryLogin is never an email destination',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
