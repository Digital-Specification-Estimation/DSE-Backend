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
} from '@nestjs/common';
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
    @Body() userId: string,
    @Body() createAttendance: CreateAttendanceDto,
    @Response() response,
  ) {
    try {
      this.attendanceService.addingAttendance(createAttendance);
      this.notificationGateway.sendPersonalNotification(
        userId,
        `the attendance is made for employee with this id ${createAttendance.employee_id}`,
      );
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
}
