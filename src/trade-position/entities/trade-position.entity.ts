import { ApiProperty } from '@nestjs/swagger';
import { TradePosition } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { IsDecimal, IsNumber, IsOptional, IsString } from 'class-validator';

export class TradePositionEntity implements TradePosition {
  @IsOptional()
  @IsString()
  @ApiProperty()
  id: string;
  @IsOptional()
  @IsString()
  @ApiProperty()
  trade_name: string;
  @IsOptional()
  @ApiProperty()
  @IsDecimal()
  daily_planned_cost: Decimal;
  @IsOptional()
  @IsString()
  @ApiProperty()
  projectId: string | null;
  @IsOptional()
  @IsString()
  @ApiProperty()
  location_name: string;
  @IsOptional()
  @ApiProperty()
  @IsNumber()
  work_days: number;
  @IsOptional()
  @ApiProperty()
  @IsDecimal()
  planned_salary: Decimal;
}
