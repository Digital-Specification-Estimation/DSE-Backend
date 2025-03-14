import { Module } from '@nestjs/common';
import { TradePositionService } from './trade-position.service';
import { TradePositionController } from './trade-position.controller';

@Module({
  controllers: [TradePositionController],
  providers: [TradePositionService],
})
export class TradePositionModule {}
