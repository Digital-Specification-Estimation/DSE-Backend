import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { AttendanceService } from '../services/attendance.service';
import { CreateAttendanceDto } from '../dto/create-attendance.dto';
import { UpdateAttendanceDto } from '../dto/update-attendance.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}
  @Post('add')
  async addingAttendance(@Body() createAttendance: CreateAttendanceDto) {
    return this.attendanceService.addingAttendance(createAttendance);
  }
  @Put('edit')
  async editingAttendance(@Body() updateAttendance: UpdateAttendanceDto) {
    return this.attendanceService.editingAttendance(updateAttendance);
  }
  @Delete('delete/:id')
  async deleteAttendance(@Param('id') id: string) {
    return this.attendanceService.deleteAttendance(id);
  }
}
