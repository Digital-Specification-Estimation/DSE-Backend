import { ApiProperty } from '@nestjs/swagger';
import { Log } from '@prisma/client';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class LogEntity implements Log {
  constructor(partial: Partial<Log> | null) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
  @ApiProperty()
  @IsString()
  @IsOptional()
  id: string;
  @ApiProperty()
  @IsDate()
  @IsOptional()
  createdAt: Date;
  @ApiProperty()
  @IsString()
  @IsOptional()
  user_id: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  action: string;
}
