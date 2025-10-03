import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LocationDataDto {
  @ApiProperty()
  location_name: string;
}

export class TradeDataDto {
  @ApiProperty()
  trade_name: string;

  @ApiProperty()
  location_name: string;

  @ApiProperty({ required: false })
  daily_planned_cost?: string;

  @ApiProperty({ required: false })
  monthly_planned_cost?: string;

  @ApiProperty({ required: false })
  work_days?: number;

  @ApiProperty({ required: false })
  planned_salary?: string;

  @ApiProperty({ required: false })
  project_name?: string;
}

export class ProjectDataDto {
  @ApiProperty()
  project_name: string;

  @ApiProperty()
  location_name: string;

  @ApiProperty({ required: false })
  budget?: string;

  @ApiProperty()
  start_date: string;

  @ApiProperty()
  end_date: string;
}

export class EmployeeDataDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  trade_name: string;

  @ApiProperty()
  location_name: string;

  @ApiProperty({ required: false })
  daily_rate?: string;

  @ApiProperty({ required: false })
  monthly_rate?: string;

  @ApiProperty({ required: false })
  contract_start_date?: string;

  @ApiProperty({ required: false })
  contract_finish_date?: string;

  @ApiProperty({ required: false })
  days_projection?: number;

  @ApiProperty({ required: false })
  budget_baseline?: string;
}

export class BulkUploadDto {
  @ApiProperty({ type: [LocationDataDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationDataDto)
  locations: LocationDataDto[];

  @ApiProperty({ type: [TradeDataDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TradeDataDto)
  trades: TradeDataDto[];

  @ApiProperty({ type: [ProjectDataDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectDataDto)
  projects: ProjectDataDto[];

  @ApiProperty({ type: [EmployeeDataDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmployeeDataDto)
  employees: EmployeeDataDto[];
}
