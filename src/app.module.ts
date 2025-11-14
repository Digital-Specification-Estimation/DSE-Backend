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
import { ProjectModule } from './project/project.module';
import { LocationModule } from './location/location.module';
import { ExpenseModule } from './expense/expense.module';
import { CostControlModule } from './cost-control/cost-control.module';
import { DeductionModule } from './deduction/deduction.module';
import { PassportModule } from '@nestjs/passport';
import { SessionSerializer } from './auth/utils/Session.serializer';
import { ScheduleModule } from '@nestjs/schedule';
import { MailModule } from './mail/mail.module';
import { VerificationModule } from './verification/verification.module';
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
    ScheduleModule.forRoot(),
    PassportModule.register({ session: true }),
    CompanyModule,
    AttendanceModule,
    ConfigModule.forRoot({ isGlobal: true }),
    LogModule,
    EmployeeModule,
    TradePositionModule,
    ProjectModule,
    LocationModule,
    ExpenseModule,
    CostControlModule,
    DeductionModule,
    MailModule,
    VerificationModule,
  ],
  controllers: [AppController],
  providers: [AppService, SessionSerializer],
})
export class AppModule {}
