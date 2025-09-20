import { ApiProperty } from '@nestjs/swagger';

export class CreateUserSettingsDto {
  @ApiProperty({ description: 'User role (e.g., admin, hr_manager, employee, departure_manager)' })
  role: string;

  @ApiProperty({ description: 'Company ID this settings belong to' })
  companyId: string;

  @ApiProperty({ description: 'Full access to all features' })
  full_access?: boolean;

  @ApiProperty({ description: 'Can approve attendance' })
  approve_attendance?: boolean;

  @ApiProperty({ description: 'Can manage payroll' })
  manage_payroll?: boolean;

  @ApiProperty({ description: 'Can view reports' })
  view_reports?: boolean;

  @ApiProperty({ description: 'Can approve leaves' })
  approve_leaves?: boolean;

  @ApiProperty({ description: 'Can view payslips' })
  view_payslip?: boolean;

  @ApiProperty({ description: 'Can mark attendance' })
  mark_attendance?: boolean;

  @ApiProperty({ description: 'Can manage employees' })
  manage_employees?: boolean;

  @ApiProperty({ description: 'Can generate reports' })
  generate_reports?: boolean;
}
