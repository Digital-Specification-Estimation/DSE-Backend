import { Module } from '@nestjs/common';
import { TradePositionController } from './controllers/trade-position.controller';
import { TradePositionService } from './services/trade-position.service';

@Module({
  controllers: [TradePositionController],
  providers: [TradePositionService],
})
export class TradePositionModule {}
