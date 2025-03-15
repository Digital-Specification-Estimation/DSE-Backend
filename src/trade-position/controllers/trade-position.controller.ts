import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CreateTradePositionDto } from '../dto/create-trade-position.dto';
import { UpdateTradePositionDto } from '../dto/update-trade-position.dto';
import { TradePositionService } from '../services/trade-position.service';

@Controller('trade-position')
export class TradePositionController {
  constructor(private readonly tradePositionService: TradePositionService) {}
  @Post()
  async addTrade(@Body() createTrade: CreateTradePositionDto) {
    return await this.tradePositionService.addTrade(createTrade);
  }
}
