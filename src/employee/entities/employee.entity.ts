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
} from 'class-validator';

export class EmployeeEntity implements Employee {
  constructor(partial: Partial<Employee> | null) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
  @ApiProperty()
  @IsString()
  @IsOptional()
  id: string;

  @IsString()
  @ApiProperty()
  username: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  trade_position_id: string;

  @ApiProperty()
  @IsOptional()
  @IsDecimal()
  daily_rate: Decimal;
  @ApiProperty()
  @IsOptional()
  @IsDecimal()
  monthly_rate: Decimal | null;
  @ApiProperty()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  contract_finish_date: Date;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  days_projection: number;

  @ApiProperty()
  @IsOptional()
  @IsDecimal()
  budget_baseline: Decimal;

  @ApiProperty()
  @IsOptional()
  @IsString()
  company_id: string;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  created_date: Date;
}
