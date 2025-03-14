import { Injectable } from '@nestjs/common';
import { CreateTradePositionDto } from './dto/create-trade-position.dto';
import { UpdateTradePositionDto } from './dto/update-trade-position.dto';

@Injectable()
export class TradePositionService {
  create(createTradePositionDto: CreateTradePositionDto) {
    return 'This action adds a new tradePosition';
  }

  findAll() {
    return `This action returns all tradePosition`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tradePosition`;
  }

  update(id: number, updateTradePositionDto: UpdateTradePositionDto) {
    return `This action updates a #${id} tradePosition`;
  }

  remove(id: number) {
    return `This action removes a #${id} tradePosition`;
  }
}
