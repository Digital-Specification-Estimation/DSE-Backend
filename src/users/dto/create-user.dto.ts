import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  isString,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto implements User {
  @ApiProperty()
  @IsOptional()
  id: string;
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  username: string | null;
  @IsString()
  @ApiProperty()
  @IsOptional()
  current_role: string | null;
  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  role: string[];
  @IsEmail()
  @ApiProperty()
  @IsNotEmpty()
  email: string | null;
  @ApiProperty()
  @IsString()
  @IsStrongPassword()
  password: string | null;
  @ApiProperty()
  @IsOptional()
  refresh_token: string | null;
  @ApiProperty()
  @IsOptional()
  company_id: string | null;
  @ApiProperty()
  @IsOptional()
  @IsString()
  business_name: string | null;
  @ApiProperty()
  @IsOptional()
  @IsString()
  google_id: string | null;
  @ApiProperty()
  @IsString()
  @IsOptional()
  apple_id: string | null;
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  notification_sending: boolean | null;
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  send_email_alerts: boolean | null;
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  deadline_notify: boolean | null;
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  remind_approvals: boolean | null;
  @ApiProperty()
  @IsString()
  @IsOptional()
  image_url: string | null;
  @ApiProperty()
  @IsString()
  @IsOptional()
  salary_calculation: string | null;
  @ApiProperty()
  @IsString()
  @IsOptional()
  currency: string | null;
  @ApiProperty()
  @IsString()
  @IsOptional()
  payslip_format: string | null;
}
