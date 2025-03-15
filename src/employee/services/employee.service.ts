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
  async editEmployee(updateEmployee: UpdateEmployeeDto, id: string) {
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
  async getEmployees(id: string) {
    return this.prisma.employee.findMany();
  }
  async getEmployeeNumber() {
    return this.prisma.employee.count();
  }
}
