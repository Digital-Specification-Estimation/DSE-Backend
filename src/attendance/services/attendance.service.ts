import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttendanceDto } from '../dto/create-attendance.dto';
import { UpdateAttendanceDto } from '../dto/update-attendance.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReasonType } from '../interfaces/utility.interface';
import { Cron, CronExpression } from '@nestjs/schedule';
import { startOfMonth, endOfMonth, getDate } from 'date-fns';

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
  async getDailyAttendancePercentage(companyId: string) {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    console.log('start', start);
    console.log('end', end);
    // Get all employees
    const employees = await this.prisma.employee.findMany({
      where: { company_id: companyId },
    });
    const totalEmployees = employees.length;

    // Get all attendance records in the current month
    const attendanceRecords = await this.prisma.attendance.findMany({
      where: {
        company_id: companyId,
        date: {
          gte: start,
          lte: end,
        },
        status: { equals: 'present', mode: 'insensitive' },
      },
    });
    console.log('records', attendanceRecords);
    // Initialize days in month
    const daysInMonth = getDate(end);
    const dailyAttendance: {
      day: number;
      attendance: number;
      highlight?: boolean;
    }[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayAttendance = attendanceRecords.filter(
        (record) => new Date(record.date).getDate() === day,
      );

      const percentage = totalEmployees
        ? Math.round((dayAttendance.length / totalEmployees) * 100)
        : 0;

      dailyAttendance.push({
        day,
        attendance: percentage,
      });
    }

    // Add highlight to the highest attendance day
    const max = Math.max(...dailyAttendance.map((item) => item.attendance));
    const highlightIndex = dailyAttendance.findIndex(
      (item) => item.attendance === max,
    );
    if (highlightIndex !== -1) {
      dailyAttendance[highlightIndex].highlight = true;
    }

    return dailyAttendance;
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
        where: {
          date: previousStartDate,
          status: { equals: status, mode: 'insensitive' },
        },
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
        status: { equals: status, mode: 'insensitive' },
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
          status: { equals: status, mode: 'insensitive' },
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
  @Cron(CronExpression.EVERY_DAY_AT_4PM)
  async createDefaultDailyAttendance() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const attendancesFiltered = await this.prisma.attendance.findFirst({
      where: {
        date: { gte: startOfDay, lt: endOfDay },
      },
    });
    if (!attendancesFiltered) {
      console.log('Running daily attendance creating job');
      const employees = await this.prisma.employee.findMany();
      const entries = employees.map((employee) => ({
        employee_id: employee.id,
        status: 'present',
      }));
      await this.prisma.attendance.createMany({
        data: entries,
        skipDuplicates: true,
      });
      const today = new Date();
      console.log('default attendance created for today', today);
    } else {
      console.log('attendance arleady made');
    }
  }
  async editingAttendanceByDate(
    employeeId: string,
    date: Date,
    status: string,
  ) {
    return this.prisma.attendance.updateMany({
      where: {
        employee_id: employeeId,
        date,
      },
      data: {
        status,
      },
    });
  }
  async editStatusUser(
    userId: string,
    status: string,
    date: string,
    time: string,
  ) {
    if (time === 'today') {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      const attendanceExist = await this.prisma.attendance.findFirst({
        where: {
          date: { gte: startOfDay, lte: endOfDay },
          employee_id: userId,
        },
      });
      if (!attendanceExist) {
        return await this.prisma.attendance.create({
          data: {
            employee_id: userId,
            status,
          },
        });
      }
      return await this.prisma.attendance.updateMany({
        where: {
          employee_id: userId,
          date: { gte: startOfDay, lte: endOfDay },
        },
        data: {
          status,
        },
      });
    } else {
      const update = await this.prisma.attendance.updateMany({
        where: {
          employee_id: userId,
          date: new Date(date),
        },
        data: {
          status,
        },
      });
    }
  }
}
