import { Module } from '@nestjs/common';
import { NotificationsService } from './services/notifications.service';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationsController } from './controllers/notifications.controller';

@Module({
  imports: [PrismaModule],
  providers: [NotificationsGateway, NotificationsService, PrismaService],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
