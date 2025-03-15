import { Module } from '@nestjs/common';
import { NotificationsService } from './services/notifications.service';
import { NotificationsGateway } from './gateways/notifications.gateway';

@Module({
  providers: [NotificationsGateway, NotificationsService],
})
export class NotificationsModule {}
