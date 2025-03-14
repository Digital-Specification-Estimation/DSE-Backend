import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CompanyModule } from './company/company.module';
import { AttendanceModule } from './attendance/attendance.module';
import { LogModule } from './log/log.module';
import { EmployeeModule } from './employee/employee.module';
import { TradePositionModule } from './trade-position/trade-position.module';

@Module({
  imports: [PrismaModule, NotificationsModule, AuthModule, UserModule, CompanyModule, AttendanceModule, LogModule, EmployeeModule, TradePositionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
