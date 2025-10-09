import { PartialType } from '@nestjs/mapped-types';
import { CreateDeductionDto } from './create-deduction.dto';
import { IsString } from 'class-validator';

export class UpdateDeductionDto extends PartialType(CreateDeductionDto) {
  @IsString()
  id: string;
}
