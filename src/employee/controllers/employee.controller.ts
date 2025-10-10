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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import * as csv from 'csv-parser';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { EmployeeService } from '../services/employee.service';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { strict } from 'assert';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}
@Post('add')
async addEmployee(
  @Body() createEmployee: CreateEmployeeDto,
  @Request() req: any,
) {
  // Pass the logged-in user's company
  return await this.employeeService.addEmployee(
    createEmployee,
    req.user.id,
    req.user.company_id, // <-- use this
  );
}

  @Put('edit')
  async editEmployee(@Body() updateEmployee: UpdateEmployeeDto) {
    return await this.employeeService.editEmployee(updateEmployee);
  }
  @Delete('delete/:id')
  async deleteEmployee(@Param('id') id: string, @Request() req: any) {
    return await this.employeeService.deleteEmployee(id, req.user.id);
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
  const { salary_calculation = null, currency = null, company_id } = req.user || {};
  return await this.employeeService.getEmployees(
    salary_calculation,
    currency,
    company_id,
  );
}


  @Get('get/number')
  async getEmployeeNumber() {
    return await this.employeeService.getEmployeeNumber();
  }
  @Get('get/employees/:id')
  async getEmployee(@Param('id') id: string) {
    return await this.employeeService.getEmployee(id);
  }
  @Get('payroll/project/:projectId')
  @UseGuards(AuthenticatedGuard)
  async getProjectPayroll(
    @Param('projectId') projectId: string,
    @Query('companyId') companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.employeeService.calculateProjectPayroll(projectId, companyId, startDate, endDate);
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
      req.user.company_id,
    );
  }

  @Post('bulk-upload')
  @UseInterceptors(FileInterceptor('file'))
  async bulkUpload(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.mimetype.includes('csv') && !file.originalname.endsWith('.csv')) {
      throw new BadRequestException('File must be a CSV');
    }

    try {
      // Parse CSV data
      const results: any[] = [];
      const csvString = file.buffer.toString('utf-8');
      
      return new Promise((resolve, reject) => {
        const stream = require('stream');
        const readable = new stream.Readable();
        readable.push(csvString);
        readable.push(null);

        readable
          .pipe(csv())
          .on('data', (data: any) => results.push(data))
          .on('end', async () => {
            try {
              console.log(`Parsed ${results.length} rows from CSV`);
              
              // Process the CSV data using the service
              const uploadResult = await this.employeeService.bulkUploadFromCSV(
                results,
                req.user.id,
                req.user.company_id,
              );
              
              resolve(uploadResult);
            } catch (error) {
              console.error('CSV processing error:', error);
              reject(new BadRequestException(error.message || 'Failed to process CSV'));
            }
          })
          .on('error', (error: any) => {
            console.error('CSV parsing error:', error);
            reject(new BadRequestException('Failed to parse CSV file'));
          });
      });
    } catch (error) {
      console.error('Bulk upload error:', error);
      throw new BadRequestException(error.message || 'Failed to process bulk upload');
    }
  }

  @Put('update-salary/:id')
  async updateEmployeeSalary(
    @Param('id') id: string,
    @Body() body: { daily_rate?: number; monthly_rate?: number }
  ) {
    try {
      console.log(`Updating salary for employee ${id}:`, body);
      
      const updatedEmployee = await this.employeeService.updateEmployeeSalary(
        id,
        body.daily_rate,
        body.monthly_rate
      );
      
      console.log('Employee salary updated:', updatedEmployee);
      return updatedEmployee;
    } catch (error) {
      console.error('Error updating employee salary:', error);
      throw new BadRequestException(error.message || 'Failed to update employee salary');
    }
  }
}
