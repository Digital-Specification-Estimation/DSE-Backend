import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { CreateTradePositionDto } from '../dto/create-trade-position.dto';
import { UpdateTradePositionDto } from '../dto/update-trade-position.dto';
import { TradePositionService } from '../services/trade-position.service';

@Controller('trade-position')
export class TradePositionController {
  constructor(private readonly tradePositionService: TradePositionService) {}
  @Post('add')
  async addTrade(@Body() createTrade: CreateTradePositionDto) {
    return await this.tradePositionService.addTrade(createTrade);
  }
  @Get('get/:id')
  async getTrade(@Param('id') id: string) {
    return await this.tradePositionService.getTrade(id);
  }
  @Get('get/trades')
  async getTrades() {
    return await this.tradePositionService.getTrades();
  }
  @Delete('delete/:id')
  async deleteTrade(@Param('id') id: string) {
    return await this.tradePositionService.deleteTrade(id);
  }
  @Put('edit')
  async editTrade(@Body() updateTrade: UpdateTradePositionDto) {
    return await this.tradePositionService.editTrade(updateTrade);
  }
  @Get('number')
  async getNumber() {
    return await this.tradePositionService.getTradesNumber();
  }
}
