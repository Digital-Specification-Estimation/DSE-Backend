import { Module } from '@nestjs/common';
import { CompanyService } from './services/company.service';
import { CompanyController } from './controllers/company.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { NotificationsGateway } from 'src/notifications/gateways/notifications.gateway';
import { NotificationsService } from 'src/notifications/services/notifications.service';

@Module({
  controllers: [CompanyController],
  providers: [
    CompanyService,
    PrismaService,
    NotificationsGateway,
    NotificationsService,
  ],
  imports: [NotificationsModule],
})
export class CompanyModule {}
