import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateProjectExpenseDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsString()
  category: string; // Materials, Labor, Equipment, Transportation, Permits, Other

  @IsString()
  description: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string; // M, M², M³, KG, TON, NO, LS, HR, DAY, LOAD

  @IsNumber()
  unit_price: number;

  @IsNumber()
  amount: number;

  @IsString()
  project_id: string;

  @IsString()
  company_id: string;
}
