import { Test, TestingModule } from '@nestjs/testing';
import { TradePositionService } from './trade-position.service';

describe('TradePositionService', () => {
  let service: TradePositionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TradePositionService],
    }).compile();

    service = module.get<TradePositionService>(TradePositionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
