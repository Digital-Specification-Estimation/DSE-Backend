import { IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateProjectRevenueDto {
  @IsDateString()
  from_date: string;

  @IsDateString()
  to_date: string;

  @IsNumber()
  quantity_completed: number;

  @IsNumber()
  rate: number;

  @IsNumber()
  amount: number;

  @IsString()
  unit: string;

  @IsString()
  project_id: string;

  @IsString()
  boq_item_id: string;

  @IsString()
  boq_item_no: string;

  @IsString()
  boq_description: string;

  @IsString()
  company_id: string;
}
