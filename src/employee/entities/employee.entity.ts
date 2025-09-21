import { ApiProperty } from '@nestjs/swagger';
import { Employee } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsDecimal,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class EmployeeEntity implements Employee {
  constructor(partial: Partial<Employee> | null = null) {
    if (partial) Object.assign(this, partial);
  }

  @ApiProperty({ description: 'Employee ID' })
  @IsUUID()
  @IsOptional()
  id: string;

  @ApiProperty({ description: 'Employee username' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Trade Position ID' })
  @IsUUID()
  trade_position_id: string;

  @ApiProperty({ description: 'Daily rate', required: false })
  @IsOptional()
  @IsDecimal()
  daily_rate: Decimal;

  @ApiProperty({ description: 'Monthly rate', required: false })
  @IsOptional()
  @IsDecimal()
  monthly_rate: Decimal;

  @ApiProperty({ description: 'Contract start date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  contract_start_date: Date;

  @ApiProperty({ description: 'Contract finish date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  contract_finish_date: Date;

  @ApiProperty({ description: 'Projected working days', required: false })
  @IsOptional()
  @IsNumber()
  days_projection: number;

  @ApiProperty({ description: 'Budget baseline', required: false })
  @IsOptional()
  @IsDecimal()
  budget_baseline: Decimal;

  @ApiProperty({ description: 'Company ID' })
  @IsUUID()
  company_id: string;

  @ApiProperty({ description: 'Creation date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  created_date: Date;
}
