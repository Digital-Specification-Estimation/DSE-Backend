import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CompanyModule } from './company/company.module';
import { AttendanceModule } from './attendance/attendance.module';
import { LogModule } from './log/log.module';
import { EmployeeModule } from './employee/employee.module';
import { TradePositionModule } from './trade-position/trade-position.module';
import { UsersModule } from './users/users.module';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    NotificationsModule,
    AuthModule,
    UsersModule,
    CompanyModule,
    AttendanceModule,
    ConfigModule.forRoot({ isGlobal: true }),
    LogModule,
    EmployeeModule,
    TradePositionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
