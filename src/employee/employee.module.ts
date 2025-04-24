import { Module } from '@nestjs/common';
import { EmployeeService } from './services/employee.service';
import { EmployeeController } from './controllers/employee.controller';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/services/users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationsGateway } from 'src/notifications/gateways/notifications.gateway';
import { NotificationsService } from 'src/notifications/services/notifications.service';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  controllers: [EmployeeController],
  providers: [
    EmployeeService,
    UsersService,
    PrismaService,
    NotificationsGateway,
    NotificationsService,
  ],
  imports: [UsersModule, PrismaModule, NotificationsModule],
})
export class EmployeeModule {}
