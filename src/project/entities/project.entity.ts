import { ApiProperty } from '@nestjs/swagger';
import { Project } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class ProjectEntity implements Project {
  @IsString()
  @IsOptional()
  @ApiProperty()
  id: string;
  @IsString()
  @IsOptional()
  @ApiProperty()
  project_name: string;
  @IsOptional()
  @ApiProperty()
  budget: Decimal | null;
  @IsString()
  @IsOptional()
  @ApiProperty()
  company_id: string | null;
  @IsString()
  @IsOptional()
  @ApiProperty()
  location_name: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @ApiProperty()
  start_date: Date;
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @ApiProperty()
  end_date: Date;
}
