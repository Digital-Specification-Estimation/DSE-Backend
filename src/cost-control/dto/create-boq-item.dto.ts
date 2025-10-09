import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateBOQItemDto {
  @IsString()
  item_no: string;

  @IsString()
  description: string;

  @IsString()
  unit: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  rate: number;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsNumber()
  completed_qty?: number;

  @IsString()
  project_id: string;

  @IsString()
  company_id: string;
}
