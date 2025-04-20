import { Controller, Delete, Get } from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getAllUnreadNotifications() {
    return await this.notificationsService.findAllUnreadNotifications();
  }
  @Get('read')
  async getAllReadNotifications() {
    return await this.notificationsService.findAllReadNotif();
  }

  @Delete()
  async deleteAllNotifications() {
    return await this.notificationsService.deleteAllNotifications();
  }
}
