import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Response,
  BadRequestException,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AttendanceService } from '../services/attendance.service';
import { CreateAttendanceDto } from '../dto/create-attendance.dto';
import { UpdateAttendanceDto } from '../dto/update-attendance.dto';
import { ReasonType } from '../interfaces/utility.interface';
import { NotificationsGateway } from 'src/notifications/gateways/notifications.gateway';

@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private notificationGateway: NotificationsGateway,
  ) {}
  @Post('add')
  async addingAttendance(
    @Body() data: { createAttendance: CreateAttendanceDto; userId: string },
    @Response() response,
  ) {
    try {
      const { userId, createAttendance } = data;
      const attendance =
        await this.attendanceService.addingAttendance(createAttendance);
      // this.notificationGateway.sendPersonalNotification(
      //   userId,
      //   `the attendance is made for employee with this id ${createAttendance.employee_id}`,
      // );
      return response.status(201).json({ ...attendance });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  @Put('edit')
  async editingAttendance(@Body() updateAttendance: UpdateAttendanceDto) {
    return this.attendanceService.editingAttendance(updateAttendance);
  }
  @Delete('delete/:id')
  async deleteAttendance(@Param('id') id: string) {
    return this.attendanceService.deleteAttendance(id);
  }
  @Patch('reason')
  async addingReason(@Body() reasonType: ReasonType) {
    return this.attendanceService.addingReason(reasonType);
  }
  @Patch('update')
  async updateAttendance(
    @Body() body: { employeeId: string; date: string; status: string },
  ) {
    const { employeeId, date, status } = body;
    return this.attendanceService.editingAttendanceByDate(
      employeeId,
      new Date(date),
      status,
    );
  }
  @Get('time/:daysAgo/:status')
  async getAttendance(
    @Param('daysAgo', ParseIntPipe) daysAgo: number,
    @Param('status') status: string,
  ) {
    return this.attendanceService.getAttendancesBasedOnTime(daysAgo, status);
  }
  @Get('by-date')
  async getAttendancesStatisticsByDate(
    @Query('date') date: string,
    @Query('status') status: string,
  ) {
    return this.attendanceService.getAttendancesBasedOnDate(date, status);
  }
  // not tested
  //sample of id -> 1,2,3,4,5
  @Delete('delete-many')
  async deleteManyAttendences(@Query('ids') ids: string) {
    const idArray = ids.split(',');
    return await this.attendanceService.deleteManyAttendences(idArray);
  }
  @Get('daily-percentage-monthly')
  getDailyAttendance() {
    return this.attendanceService.getDailyAttendancePercentage();
  }
  @Put('edit-status-user')
  async editStatusUser(
    @Body()
    body: {
      employeeId: string;
      status: string;
      date: string;
      time: string;
    },
  ) {
    const { employeeId, status, date, time } = body;
    console.log('data', employeeId, status, date);
    const update = await this.attendanceService.editStatusUser(
      employeeId,
      status,
      date,
      time,
    );
    console.log('update', update);
    return update;
  }
}
