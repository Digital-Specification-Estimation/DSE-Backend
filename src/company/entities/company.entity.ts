import { ApiProperty } from '@nestjs/swagger';
import { Company } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDecimal,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
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
  @IsOptional()
  @IsArray()
  holidays: string[];
  @ApiProperty()
  @IsString()
  @IsOptional()
  company_profile: string | null;
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
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  overtime_rate: Decimal;
  @ApiProperty()
  @IsDecimal()
  @IsOptional()
  daily_total_actual_cost: Decimal | null;
  @ApiProperty()
  @IsDecimal()
  @IsOptional()
  daily_total_planned_cost: Decimal | null;
}
