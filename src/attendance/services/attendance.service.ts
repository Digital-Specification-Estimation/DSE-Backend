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
  async getAttendancesBasedOnTime(daysAgo: number, status: string) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const attendancesFiltered = await this.prisma.attendance.findMany({
      where: { date: { gte: startDate }, status },
    });

    if (!attendancesFiltered || attendancesFiltered.length === 0) {
      throw new NotFoundException();
    }

    const totalAttendance = await this.prisma.attendance.count({
      where: { date: { gte: startDate } },
    });

    const attendancePercentage =
      totalAttendance > 0
        ? (attendancesFiltered.length / totalAttendance) * 100
        : 0;

    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - 1);

    const attendanceFilteredPreviousDay = await this.prisma.attendance.findMany(
      {
        where: { date: previousStartDate, status },
      },
    );

    const totalPreviousAttendance = await this.prisma.attendance.count({
      where: { date: previousStartDate },
    });

    const previousAttendancePercentage =
      totalPreviousAttendance > 0
        ? (attendanceFilteredPreviousDay.length / totalPreviousAttendance) * 100
        : 0;

    const percentageDifference =
      attendancePercentage - previousAttendancePercentage;

    return { attendancesFiltered, attendancePercentage, percentageDifference };
  }
  async getAttendancesBasedOnDate(dateString: string, status: string) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD or ISO 8601.');
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const attendancesFiltered = await this.prisma.attendance.findMany({
      where: {
        date: { gte: startOfDay, lt: endOfDay },
        status,
      },
    });

    if (!attendancesFiltered.length) {
      throw new NotFoundException(
        'No attendance records found for the given date and status.',
      );
    }

    const totalAttendance = await this.prisma.attendance.count({
      where: { date: { gte: startOfDay, lt: endOfDay } },
    });

    const attendancePercentage =
      totalAttendance > 0
        ? (attendancesFiltered.length / totalAttendance) * 100
        : 0;

    const previousStartDate = new Date(startOfDay);
    previousStartDate.setDate(previousStartDate.getDate() - 1);

    const previousEndDate = new Date(endOfDay);
    previousEndDate.setDate(previousEndDate.getDate() - 1);

    const attendanceFilteredPreviousDay = await this.prisma.attendance.findMany(
      {
        where: {
          date: { gte: previousStartDate, lt: previousEndDate },
          status,
        },
      },
    );

    const totalPreviousAttendance = await this.prisma.attendance.count({
      where: { date: { gte: previousStartDate, lt: previousEndDate } },
    });

    const previousAttendancePercentage =
      totalPreviousAttendance > 0
        ? (attendanceFilteredPreviousDay.length / totalPreviousAttendance) * 100
        : 0;

    const percentageDifference =
      attendancePercentage - previousAttendancePercentage;

    return {
      attendancesFiltered,
      attendancePercentage,
      percentageDifference,
    };
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
  async deleteManyAttendences(ids: string[]) {
    try {
      for (const id of ids) {
        return await this.prisma.attendance.delete({ where: { id } });
      }
    } catch (error) {
      console.log(error);
    }
  }
}
