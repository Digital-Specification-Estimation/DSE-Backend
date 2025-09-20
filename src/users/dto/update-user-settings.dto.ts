import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { CreateUserSettingsDto } from './create-user-settings.dto';

export class UpdateUserSettingsDto extends PartialType(CreateUserSettingsDto) {
  @ApiProperty({ required: false, description: 'Role name (e.g., admin, hr_manager, employee, departure_manager)' })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiProperty({ required: false, description: 'Company ID this settings belong to' })
  @IsString()
  @IsOptional()
  companyId?: string;

  @ApiProperty({ required: false, description: 'Full access to all features' })
  @IsBoolean()
  @IsOptional()
  fullAccess?: boolean;

  @ApiProperty({ required: false, description: 'Can approve attendance' })
  @IsBoolean()
  @IsOptional()
  approveAttendance?: boolean;

  @ApiProperty({ required: false, description: 'Can manage payroll' })
  @IsBoolean()
  @IsOptional()
  managePayroll?: boolean;

  @ApiProperty({ required: false, description: 'Can view reports' })
  @IsBoolean()
  @IsOptional()
  viewReports?: boolean;

  @ApiProperty({ required: false, description: 'Can approve leaves' })
  @IsBoolean()
  @IsOptional()
  approveLeaves?: boolean;

  @ApiProperty({ required: false, description: 'Can view payslips' })
  @IsBoolean()
  @IsOptional()
  viewPayslip?: boolean;

  @ApiProperty({ required: false, description: 'Can mark attendance' })
  @IsBoolean()
  @IsOptional()
  markAttendance?: boolean;

  @ApiProperty({ required: false, description: 'Can manage employees' })
  @IsBoolean()
  @IsOptional()
  manageEmployees?: boolean;

  @ApiProperty({ required: false, description: 'Can generate reports' })
  @IsBoolean()
  @IsOptional()
  generateReports?: boolean;
}
