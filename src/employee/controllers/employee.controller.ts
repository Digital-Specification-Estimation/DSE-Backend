import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  Query,
  Request,
} from '@nestjs/common';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { EmployeeService } from '../services/employee.service';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { strict } from 'assert';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}
  @Post('add')
  async addEmployee(@Body() creatEmployee: CreateEmployeeDto) {
    return await this.employeeService.addEmployee(creatEmployee);
  }
  @Put('edit')
  async editEmployee(@Body() updateEmployee: UpdateEmployeeDto) {
    return await this.employeeService.editEmployee(updateEmployee);
  }
  @Delete('delete/:id')
  async deleteEmployee(@Param('id') id: string) {
    return await this.employeeService.deleteEmployee(id);
  }
  // not tested
  //sample of ids passed -> 1,3,4,4
  @Delete('delete-many')
  async deleteManyEmployees(@Query('ids') ids: string) {
    const idArray = ids.split(',');
    return await this.employeeService.deleteManyEmployees(idArray);
  }
  @Get('get/employees')
  async getEmployees(@Request() req: any) {
    return await this.employeeService.getEmployees(req.user.salary_calculation);
  }

  @Get('get/number')
  async getEmployeeNumber() {
    return await this.employeeService.getEmployeeNumber();
  }
  @Get('get/employees/:id')
  async getEmployee(@Param('id') id: string) {
    return await this.employeeService.getEmployee(id);
  }
  @Get('payroll/:year/:month')
  async getTotalPayroll(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return this.employeeService.getPayrollForMonth(year, month);
  }
  @Get('days-worked/:id')
  async getDaysWorked(@Param('id') id: string) {
    try {
      return await this.employeeService.getDaysWorked(id);
    } catch (error) {
      console.log(error);
    }
  }
  @Get('plannedVsActual-user/:id')
  async getPlannedVsActual(@Param('id') id: string) {
    try {
      return await this.employeeService.getPlannedVsActual(id);
    } catch (error) {
      console.log(error);
    }
  }
  @Get('monthly-stats')
  async getMonthlyStats(@Request() req: any) {
    return await this.employeeService.getMonthlyStatistics(
      req.user.salary_calculation,
    );
  }
}
