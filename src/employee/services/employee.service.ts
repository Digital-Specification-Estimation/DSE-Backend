import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { UsersService } from 'src/users/services/users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundError } from 'rxjs';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}
  async addEmployee(createEmployee: CreateEmployeeDto) {
    return await this.prisma.employee.create({
      data: { ...createEmployee },
    });
  }
  async editEmployee(updateEmployee: UpdateEmployeeDto) {
    if (!updateEmployee.id) {
      throw new NotFoundException('employee id not found');
    }
    if (await this.employeeExists(updateEmployee.id)) {
      return await this.prisma.employee.update({
        where: { id: updateEmployee.id },
        data: { ...updateEmployee },
      });
    } else {
      throw new NotFoundException('employee not found');
    }
  }
  async deleteEmployee(employeeId: string) {
    if (await this.employeeExists(employeeId)) {
      return this.prisma.employee.delete({ where: { id: employeeId } });
    } else {
      throw new NotFoundException('employee not found');
    }
  }
  async employeeExists(id: string): Promise<boolean> {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    return !!employee;
  }
  async getEmployees() {
    return this.prisma.employee.findMany();
  }
  async getEmployeeNumber() {
    return this.prisma.employee.count();
  }
  async getEmployee(id: string) {
    return await this.prisma.employee.findUnique({ where: { id } });
  }
  getDaysBetween(pastDate: Date) {
    const now = new Date();
    const timeDifference = now.getTime() - pastDate.getTime();
    return Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  }
  async getPayrollBasedOnTime(daysAgo: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    const filteredEmployees = await this.prisma.employee.findMany({
      where: { created_date: startDate },
      include: { trade_position: true },
    });
    let totalPLannedPayrollOfEMployees = 0;
    let totalPayrollOfEmployees = 0;
    for (const employee of filteredEmployees) {
      const daysFromCreation = this.getDaysBetween(employee.created_date);
      const totalEmployeePayrollToNow =
        Number(employee.daily_rate) * daysFromCreation;
      const totalPLannedEmployeePayrollToNow =
        Number(employee.trade_position.daily_planned_cost) * daysFromCreation;

      totalPLannedPayrollOfEMployees += totalPLannedEmployeePayrollToNow;
      totalPayrollOfEmployees += totalEmployeePayrollToNow;
    }
    //simple percentage
    const percentage =
      (totalPayrollOfEmployees / totalPLannedPayrollOfEMployees) * 100;
    return {
      totalPayrollOfEmployees,
      totalPLannedPayrollOfEMployees,
      percentage,
    };
  }
}
