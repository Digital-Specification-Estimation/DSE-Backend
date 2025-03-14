import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TradePositionService } from './trade-position.service';
import { CreateTradePositionDto } from './dto/create-trade-position.dto';
import { UpdateTradePositionDto } from './dto/update-trade-position.dto';

@Controller('trade-position')
export class TradePositionController {
  constructor(private readonly tradePositionService: TradePositionService) {}

  @Post()
  create(@Body() createTradePositionDto: CreateTradePositionDto) {
    return this.tradePositionService.create(createTradePositionDto);
  }

  @Get()
  findAll() {
    return this.tradePositionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tradePositionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTradePositionDto: UpdateTradePositionDto) {
    return this.tradePositionService.update(+id, updateTradePositionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tradePositionService.remove(+id);
  }
}
