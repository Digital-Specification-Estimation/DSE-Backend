import { ApiProperty } from '@nestjs/swagger';
import { User, RoleRequestStatus } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
  constructor(partial: Partial<UserEntity> | null) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @ApiProperty()
  id: string;

  @ApiProperty({ required: false })
  username: string | null;
  @ApiProperty({ required: false })
  role: string[];
  @ApiProperty({ required: false })
  current_role: string | null;
  @ApiProperty({ required: false })
  email: string | null;

  @Exclude()
  @ApiProperty({ required: false })
  password: string | null;

  @ApiProperty({ required: false })
  refresh_token: string | null;

  @ApiProperty({ required: false })
  company_id: string | null;

  @ApiProperty({ required: false })
  business_name: string | null;

  @ApiProperty({ required: false })
  google_id: string | null;

  @ApiProperty({ required: false })
  apple_id: string | null;
  @ApiProperty({ required: false })
  remind_approvals: boolean | null;
  @ApiProperty({ required: false })
  salary_calculation: string | null;
  @ApiProperty({ required: false })
  currency: string | null;
  @ApiProperty({ required: false })
  payslip_format: string | null;
  @ApiProperty({ required: false })
  image_url: string | null;
  @ApiProperty({ required: false })
  notification_sending: boolean | null;
  @ApiProperty({ required: false })
  send_email_alerts: boolean | null;
  @ApiProperty({ required: false })
  deadline_notify: boolean | null;
  @ApiProperty({ required: false, type: () => [String] })
  logs: string[];
  @ApiProperty({ required: false, enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  role_request_approval: RoleRequestStatus | null;
}
