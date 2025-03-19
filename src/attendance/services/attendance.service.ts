import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttendanceDto } from '../dto/create-attendance.dto';
import { UpdateAttendanceDto } from '../dto/update-attendance.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReasonType } from '../interfaces/utility.interface';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}
  async addingAttendance(createAttendance: CreateAttendanceDto) {
    return this.prisma.attendance.create({ data: { ...createAttendance } });
  }
  async editingAttendance(updateAttendance: UpdateAttendanceDto) {
    if (!updateAttendance.id) {
      throw new NotFoundException('attendance id not found');
    }
    if (await this.attendanceExists(updateAttendance.id)) {
      return this.prisma.attendance.update({
        where: { id: updateAttendance.id },
        data: { ...updateAttendance },
      });
    } else {
      throw new NotFoundException('the attendance does exists');
    }
  }
  async deleteAttendance(id: string) {
    if (await this.attendanceExists(id)) {
      return this.prisma.attendance.delete({
        where: { id },
      });
    } else {
      throw new NotFoundException('the attendance does exists');
    }
  }
  async attendanceExists(id: string) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
    });
    return !!attendance;
  }
  async addingReason(reasonType: ReasonType) {
    if (await !this.attendanceExists(reasonType.id)) {
      throw new NotFoundException('the attendance does exists');
    }
    return this.prisma.attendance.update({
      where: { id: reasonType.id, employee_id: reasonType.employee_id },
      data: { reason: reasonType.reason },
    });
  }
}
