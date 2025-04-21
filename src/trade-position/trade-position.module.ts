import { Module } from '@nestjs/common';
import { TradePositionController } from './controllers/trade-position.controller';
import { TradePositionService } from './services/trade-position.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationsGateway } from 'src/notifications/gateways/notifications.gateway';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { NotificationsService } from 'src/notifications/services/notifications.service';

@Module({
  controllers: [TradePositionController],
  providers: [
    TradePositionService,
    PrismaService,
    NotificationsGateway,
    NotificationsService,
  ],
  imports: [PrismaModule, NotificationsModule],
})
export class TradePositionModule {}
