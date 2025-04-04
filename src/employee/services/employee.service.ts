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
    return this.prisma.employee.findMany({
      include: { trade_position: true, company: true },
    });
  }
  async getEmployeeNumber() {
    return this.prisma.employee.count();
  }
  async getEmployee(id: string) {
    return await this.prisma.employee.findUnique({ where: { id } });
  }
  async getDaysBetween(pastDate: Date) {
    const now = new Date();
    const timeDifference = now.getTime() - pastDate.getTime();
    return Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  }
  async getPayrollForMonth(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const filteredEmployees = await this.prisma.employee.findMany({
      where: {
        created_date: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: { trade_position: true },
    });
    let totalPlannedPayrollOfEmployees = 0;
    let totalPayrollOfEmployees = 0;
    const daysInMonth =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    for (const employee of filteredEmployees) {
      const totalEmployeePayrollToNow =
        Number(employee.daily_rate) * daysInMonth;
      const totalPlannedEmployeePayrollToNow =
        Number(employee.trade_position.daily_planned_cost) * daysInMonth;
      console.log(daysInMonth);
      totalPlannedPayrollOfEmployees += totalPlannedEmployeePayrollToNow;
      totalPayrollOfEmployees += totalEmployeePayrollToNow;
    }

    const percentage =
      totalPlannedPayrollOfEmployees > 0
        ? (totalPayrollOfEmployees / totalPlannedPayrollOfEmployees) * 100
        : 0;

    return {
      totalPayrollOfEmployees,
      totalPlannedPayrollOfEmployees,
      percentage,
    };
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
      const daysFromCreation = await this.getDaysBetween(employee.created_date);
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
  async deleteManyEmployees(ids: string[]) {
    try {
      for (const id of ids) {
        return await this.prisma.employee.delete({ where: { id } });
      }
    } catch (error) {
      console.log(error);
    }
  }
  async getDaysWorked(id: string) {
    try {
      const employee = await this.prisma.employee.findUnique({ where: { id } });
      if (!employee) {
        throw new NotFoundException('employee not found');
      }
      return await this.getDaysBetween(employee.created_date);
    } catch (error) {
      console.log(error);
    }
  }
  async getPlannedVsActual(id: string) {
    try {
      const employee = await this.prisma.employee.findFirst({
        where: { id },
        include: { trade_position: true },
      });
      if (!employee) {
        throw new NotFoundException('employee not found');
      }
      const daysToCreation = await this.getDaysBetween(employee.created_date);
      const totalActual = daysToCreation * Number(employee.daily_rate);
      const totalPlanned =
        daysToCreation * Number(employee.trade_position.daily_planned_cost);
      const difference = totalPlanned - totalActual;
      if (difference == 0) {
        return 0;
      } else if (difference > 0) {
        return `${difference} below budget`;
      } else {
        return `${difference} over budget`;
      }
    } catch (error) {
      console.log(error);
    }
  }
}
