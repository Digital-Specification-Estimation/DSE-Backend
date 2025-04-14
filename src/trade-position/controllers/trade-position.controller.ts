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
  @Get('trades')
  async getTrades() {
    const trades = await this.tradePositionService.getTrades();
    return trades.map((trade) => ({
      ...trade,
      daily_planned_cost: trade.daily_planned_cost?.toString(),
    }));
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
  @Get('trades-location-name/:location_name')
  async getTradesBylocationName(@Param('location_name') locationName: string) {
    return await this.tradePositionService.getTradesByLocationName(
      locationName,
    );
  }
}
