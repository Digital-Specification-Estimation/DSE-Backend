import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDeductionDto {
  @IsString()
  name: string;

  @Type(() => Number)
  @IsNumber()
  amount: number;

  @IsString()
  type: string; // insurance, advance_payment, loan_repayment, tax, uniform_cost, damage_loss, other

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsString()
  employee_id: string;

  @IsOptional()
  @IsString()
  company_id?: string;
}
