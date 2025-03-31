import { PartialType } from '@nestjs/mapped-types';
import { CreateTradePositionDto } from './create-trade-position.dto';

export class UpdateTradePositionDto extends PartialType(CreateTradePositionDto) {}
