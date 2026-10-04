import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/** The endpoint chooses the transition; status, actor and assignment are server-owned. */
export class ReviewActionDto {
  @ApiPropertyOptional({
    description:
      'Optional customer-visible review note, trimmed; nonblank when supplied',
    example:
      'Reviewed the available project information; ready for consultation.',
    maxLength: 2000,
    nullable: true,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  note?: string | null;
}
