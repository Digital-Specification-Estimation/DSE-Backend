import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  unit_price: number;

  @IsNumber()
  amount: number;

  @IsString()
  project_id: string;

  @IsString()
  company_id: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
