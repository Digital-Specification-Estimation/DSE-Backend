import { ApiProperty } from '@nestjs/swagger';
import { Notification } from '@prisma/client';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class NotificationEntity implements Notification {
  @IsString()
  @IsOptional()
  @ApiProperty()
  id: string;
  @IsString()
  @IsOptional()
  @ApiProperty()
  message: string;
  @IsString()
  @ApiProperty()
  @IsOptional()
  user_id: string;
  @IsBoolean()
  @ApiProperty()
  @IsOptional()
  read: boolean;
}
