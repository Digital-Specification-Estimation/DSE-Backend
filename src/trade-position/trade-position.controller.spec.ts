import { Test, TestingModule } from '@nestjs/testing';
import { TradePositionController } from './trade-position.controller';
import { TradePositionService } from './trade-position.service';

describe('TradePositionController', () => {
  let controller: TradePositionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TradePositionController],
      providers: [TradePositionService],
    }).compile();

    controller = module.get<TradePositionController>(TradePositionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
