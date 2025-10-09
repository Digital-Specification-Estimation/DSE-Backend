import { PartialType } from '@nestjs/mapped-types';
import { CreateExpenseDto } from './create-expense.dto';
import { IsString } from 'class-validator';

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {
  @IsString()
  id: string;
}
