import { ApiProperty } from '@nestjs/swagger';
import { Company } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
export class CompanyEntity implements Company {
  constructor(partial: Partial<Company> | null) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
  @ApiProperty()
  id: string;
  @ApiProperty()
  company_name: string;
  @ApiProperty()
  company_profile: string;
  @ApiProperty()
  business_type: string;
  @ApiProperty()
  standard_work_hours: number;
  @ApiProperty()
  weekly_work_limit: number;
  @ApiProperty()
  overtime_rate: Decimal;
  @ApiProperty()
  daily_total_actual_cost: Decimal;
  @ApiProperty()
  daily_total_planned_cost: Decimal;
}
