import { ApiProperty } from '@nestjs/swagger';
import { Project } from '@prisma/client';
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
  @IsString()
  @IsOptional()
  @ApiProperty()
  location_name: string;
  @IsString()
  @IsOptional()
  @ApiProperty()
  currency: string;
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
