import { ApiProperty } from '@nestjs/swagger';
import { Company } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { IsDecimal, IsNumber, IsOptional, IsString } from 'class-validator';
export class CompanyEntity implements Company {
  constructor(partial: Partial<Company> | null) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
  @ApiProperty()
  @IsString()
  @IsOptional()
  id: string;
  @ApiProperty()
  @IsString()
  company_name: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  company_profile: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  business_type: string;
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  standard_work_hours: number;
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  weekly_work_limit: number;
  @ApiProperty()
  @IsDecimal()
  @IsOptional()
  overtime_rate: Decimal;
  @ApiProperty()
  @IsDecimal()
  @IsOptional()
  daily_total_actual_cost: Decimal;
  @ApiProperty()
  @IsDecimal()
  @IsOptional()
  daily_total_planned_cost: Decimal;
}
