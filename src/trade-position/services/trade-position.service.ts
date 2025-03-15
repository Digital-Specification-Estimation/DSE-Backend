import { Injectable } from '@nestjs/common';
import { CreateTradePositionDto } from '../dto/create-trade-position.dto';
import { UpdateTradePositionDto } from '../dto/update-trade-position.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TradePositionService {
  constructor(prisma: PrismaService) {}
}
