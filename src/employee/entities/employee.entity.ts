import { ApiProperty } from '@nestjs/swagger';
import { Employee } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class EmployeeEntity implements Employee {
  constructor(partial: Partial<Employee> | null) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  trade_position_id: string;

  @ApiProperty()
  daily_rate: Decimal;

  @ApiProperty()
  contract_finish_date: Date;

  @ApiProperty()
  days_projection: number;

  @ApiProperty()
  budget_baseline: Decimal;

  @ApiProperty()
  company_id: string;

  @ApiProperty()
  created_date: Date;
}
