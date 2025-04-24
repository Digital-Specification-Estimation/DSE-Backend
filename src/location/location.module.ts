import { Module } from '@nestjs/common';
import { LocationController } from './controllers/location.controller';
import { LocationService } from './services/location.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { NotificationsGateway } from 'src/notifications/gateways/notifications.gateway';
import { NotificationsService } from 'src/notifications/services/notifications.service';

@Module({
  controllers: [LocationController],
  providers: [
    LocationService,
    PrismaService,
    NotificationsGateway,
    NotificationsService,
  ],
  imports: [PrismaModule, NotificationsModule],
})
export class LocationModule {}
