import { Module } from '@nestjs/common';
import { AttendanceService } from './services/attendance.service';
import { AttendanceController } from './controllers/attendance.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService, PrismaService],
  imports: [PrismaModule],
})
export class AttendanceModule {}
