import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}
  async findAllUnreadNotifications() {
    return await this.prisma.notification.findMany({ where: { read: false } });
  }
  async findAllReadNotif() {
    return await this.prisma.notification.findMany({ where: { read: true } });
  }
  async deleteAllNotifications() {
    return await this.prisma.notification.deleteMany();
  }
}
