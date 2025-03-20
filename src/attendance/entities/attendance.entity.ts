import { ApiProperty } from '@nestjs/swagger';
import { Attendance } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { IsDate, IsDecimal, IsOptional, IsString } from 'class-validator';

export class AttendanceEntity implements Attendance {
  @IsString()
  @IsOptional()
  @ApiProperty()
  id: string;
  @IsString()
  @IsOptional()
  @ApiProperty()
  employee_id: string;
  @IsString()
  @ApiProperty()
  @IsOptional()
  status: string;
  @IsString()
  @ApiProperty()
  @IsOptional()
  reason: string | null;
  @IsDecimal()
  @IsOptional()
  @ApiProperty()
  overtime_hours: Decimal;
  @IsDate()
  @IsOptional()
  @ApiProperty()
  date: Date;
}
