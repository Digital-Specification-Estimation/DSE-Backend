import { Module } from '@nestjs/common';
import { TradePositionController } from './controllers/trade-position.controller';
import { TradePositionService } from './services/trade-position.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
	controllers: [TradePositionController],
	providers: [TradePositionService,PrismaService],
	imports:[PrismaModule]
})
export class TradePositionModule {}
