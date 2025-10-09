import { IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateProjectRevenueDto {
  @IsDateString()
  from_date: string;

  @IsDateString()
  to_date: string;

  @IsNumber()
  quantity_done: number;

  @IsNumber()
  rate: number;

  @IsNumber()
  amount: number;

  @IsString()
  project_id: string;

  @IsString()
  boq_item_id: string;

  @IsString()
  company_id: string;
}
