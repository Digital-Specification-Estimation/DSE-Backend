import { Module } from '@nestjs/common';
import { AttendanceService } from './services/attendance.service';
import { AttendanceController } from './controllers/attendance.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { NotificationsGateway } from 'src/notifications/gateways/notifications.gateway';
import { NotificationsService } from 'src/notifications/services/notifications.service';

@Module({
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    PrismaService,
    NotificationsGateway,
    NotificationsService,
  ],
  imports: [PrismaModule, NotificationsModule],
})
export class AttendanceModule {}
