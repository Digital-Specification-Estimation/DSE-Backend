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
  //sample of ids passed -> 1,3,4,4
  @Delete('delete-many')
  async deleteManyEmployees(@Query('ids') ids: string) {
    const idArray = ids.split(',');
    return await this.employeeService.deleteManyEmployees(idArray);
  }
  @Get('get/employees')
  async getEmployees() {
    return await this.employeeService.getEmployees();
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
}
