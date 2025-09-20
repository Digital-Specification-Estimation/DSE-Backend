import { ApiProperty } from '@nestjs/swagger';

export class UserSettingsEntity {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Role name (e.g., admin, hr_manager, employee, departure_manager)' })
  role: string | null;

  @ApiProperty({ description: 'Company ID this settings belong to' })
  company_id: string | null;

  @ApiProperty({ description: 'Full access to all features' })
  full_access: boolean | null;

  @ApiProperty({ description: 'Can approve attendance' })
  approve_attendance: boolean | null;

  @ApiProperty({ description: 'Can manage payroll' })
  manage_payroll: boolean | null;

  @ApiProperty({ description: 'Can view reports' })
  view_reports: boolean | null;

  @ApiProperty({ description: 'Can approve leaves' })
  approve_leaves: boolean | null;

  @ApiProperty({ description: 'Can view payslips' })
  view_payslip: boolean | null;

  @ApiProperty({ description: 'Can mark attendance' })
  mark_attendance: boolean | null;

  @ApiProperty({ description: 'Can manage employees' })
  manage_employees: boolean | null;

  @ApiProperty({ description: 'Can generate reports' })
  generate_reports: boolean | null;

  constructor(partial: Partial<UserSettingsEntity >) {
    Object.assign(this, partial);
  }
}
