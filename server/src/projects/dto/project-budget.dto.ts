import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

import { ALLOWED_BUDGET_TYPES } from './project-enums.js';

/**
 * --------------------------------------------------------------------------
 * Budget
 * --------------------------------------------------------------------------
 *
 * Cross-field rules are intentionally NOT handled here.
 *
 * Examples:
 * exact     -> exactAmount required
 * range     -> minAmount + maxAmount required
 * undecided -> no amount required
 *
 * Those rules belong to the project service / submit validation.
 */
export class ProjectBudgetDto {
  @ApiPropertyOptional({
    example: 'range',
    enum: ALLOWED_BUDGET_TYPES,
  })
  @IsOptional()
  @IsString()
  @IsIn(ALLOWED_BUDGET_TYPES)
  budgetType?: string;

  @ApiPropertyOptional({
    example: 1000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  exactAmount?: number;

  @ApiPropertyOptional({
    example: 500000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  minAmount?: number;

  @ApiPropertyOptional({
    example: 1000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  maxAmount?: number;

  @ApiPropertyOptional({
    example: 'EGP',
    default: 'EGP',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  currency?: string;
}