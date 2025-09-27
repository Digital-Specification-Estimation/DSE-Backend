import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsString } from 'class-validator';

export class UpdateProjectBudgetDto {
  @ApiProperty({ description: 'The new budget amount' })
  @IsDecimal()
  budget: string;

  @ApiProperty({ description: 'The ID of the project to update' })
  @IsString()
  projectId: string;
}
