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
  getAttendanceDaysBasedOnReason = async (
    employeeId: string,
    reason: string,
  ) => {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });
    if (!employee) {
      throw new NotFoundException('employee not found');
    }
    const attendances = await this.prisma.attendance.findMany({
      where: {
        employee_id: employeeId,
        reason: { equals: reason, mode: 'insensitive' },
      },
    });
    if (!attendances) {
      return 0;
    }
    return attendances.length;
  };
  getRemainingDays(targetDateString: Date): number {
    const today = new Date();
    const targetDate = new Date(targetDateString);

    // Set both dates to the beginning of the day to avoid partial days
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    const timeDiff = targetDate.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return dayDiff;
  }
  async getCurrentProjectForEmployee(employeeId: string) {
    try {
      const employee = await this.prisma.employee.findUnique({
        where: { id: employeeId },
        include: { trade_position: true },
      });
      if (!employee) {
        throw new NotFoundException('employee not found');
      }
      const project = await this.prisma.project.findFirst({
        where: {
          location_name: {
            equals: employee.trade_position.location_name ?? undefined,
            mode: 'insensitive',
          },
        },
      });
      if (!project) {
        return 'no project';
      }
      return project.project_name;
    } catch (error) {
      console.log(error);
    }
  }

  private months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  async getMonthlyStatistics(salary_calculation: string): Promise<any[]> {
    const employees = await this.prisma.employee.findMany({
      include: { trade_position: true },
    });

    const dataMap: { [key: string]: { cost: number; planned: number } } = {};
    for (let i = 0; i < 12; i++) {
      const month = this.months[i];
      dataMap[month] = { cost: 0, planned: 0 };
    }

    employees.forEach((employee) => {
      const date = new Date(employee.created_date);
      const monthIndex = date.getMonth();
      const monthName = this.months[monthIndex];
      if (salary_calculation === 'monthly rate') {
        dataMap[monthName].cost += Number(employee.monthly_rate);
        dataMap[monthName].planned += Number(
          employee.trade_position.monthly_planned_cost,
        );
      } else {
        dataMap[monthName].cost += Number(employee.daily_rate);
        dataMap[monthName].planned += Number(
          employee.trade_position.daily_planned_cost,
        );
      }
    });

    const currentMonth = new Date().getMonth();

    return this.months.map((month, index) => ({
      month,
      cost: dataMap[month].cost,
      planned: dataMap[month].planned,
      ...(index === currentMonth ? { highlight: true } : {}),
    }));
  }
  async getEmployees(salary_calculation: string) {
    const employees = await this.prisma.employee.findMany({
      include: {
        trade_position: { include: { project: true } },
        company: true,
        attendance: true,
      },
    });

    const employeeWithExtras = await Promise.all(
      employees.map(async (employee) => {
        const sickDays = await this.getAttendanceDaysBasedOnReason(
          employee.id,
          'sick',
        );
        const vacationDays = await this.getAttendanceDaysBasedOnReason(
          employee.id,
          'vacation',
        );
        const unpaidDays = await this.getAttendanceDaysBasedOnReason(
          employee.id,
          'unpaid',
        );
        let plannedVsActual = 0;
        let totalPlannedBytrade = 0;
        let totalActualPayroll = 0;
        if (salary_calculation === 'monthly rate') {
          plannedVsActual =
            Number(
              Number(
                employee.trade_position.monthly_planned_cost
                  ? employee.trade_position.monthly_planned_cost
                  : 0,
              ) *
                Number(
                  await this.getDaysBetween(
                    employee.created_date
                      ? new Date(employee.created_date)
                      : new Date(),
                  ),
                ),
            ) -
            Number(
              Number(employee.monthly_rate ? employee.monthly_rate : 0) *
                Number(
                  await this.getDaysBetween(
                    employee.created_date
                      ? new Date(employee.created_date)
                      : new Date(),
                  ),
                ),
            );
          totalPlannedBytrade = Number(
            Number(
              employee.trade_position.monthly_planned_cost
                ? employee.trade_position.monthly_planned_cost
                : 0,
            ) *
              Number(
                await this.getDaysBetween(
                  employee.created_date
                    ? new Date(employee.created_date)
                    : new Date(),
                ),
              ),
          );
          totalActualPayroll =
            Number(employee.monthly_rate ? employee.monthly_rate : 0) *
            Number(
              await this.getDaysBetween(
                employee.created_date
                  ? new Date(employee.created_date)
                  : new Date(),
              ),
            );
        } else {
          plannedVsActual =
            Number(
              Number(
                employee.trade_position.daily_planned_cost
                  ? employee.trade_position.daily_planned_cost
                  : 0,
              ) *
                Number(
                  await this.getDaysBetween(
                    employee.created_date
                      ? new Date(employee.created_date)
                      : new Date(),
                  ),
                ),
            ) -
            Number(
              Number(employee.daily_rate ? employee.daily_rate : 0) *
                Number(
                  await this.getDaysBetween(
                    employee.created_date
                      ? new Date(employee.created_date)
                      : new Date(),
                  ),
                ),
            );
          totalPlannedBytrade = Number(
            Number(
              employee.trade_position.daily_planned_cost
                ? employee.trade_position.daily_planned_cost
                : 0,
            ) *
              Number(
                await this.getDaysBetween(
                  employee.created_date
                    ? new Date(employee.created_date)
                    : new Date(),
                ),
              ),
          );
          totalActualPayroll =
            Number(employee.daily_rate ? employee.daily_rate : 0) *
            Number(
              await this.getDaysBetween(
                employee.created_date
                  ? new Date(employee.created_date)
                  : new Date(),
              ),
            );
        }
        return {
          ...employee,
          budget_baseline: employee.budget_baseline?.toString(),
          daily_rate: employee.daily_rate?.toString(),
          days_worked: Number(
            await this.getDaysBetween(
              employee.created_date
                ? new Date(employee.created_date)
                : new Date(),
            ),
          ),
          remaining_days: this.getRemainingDays(
            employee.contract_finish_date
              ? employee.contract_finish_date
              : new Date(),
          ),
          sickDays,
          vacationDays,
          unpaidDays,
          totalPlannedBytrade,
          plannedVsActual:
            plannedVsActual < 0
              ? `Over Budget ${plannedVsActual}`
              : `Planned ${plannedVsActual}`,
          totalActualPayroll,
        };
      }),
    );

    return employeeWithExtras;
  }

  async getEmployeeNumber() {
    return this.prisma.employee.count();
  }
  async getEmployee(id: string) {
    return await this.prisma.employee.findUnique({ where: { id } });
  }
  async getDaysBetween(pastDate: Date) {
    const now = new Date();

    // Strip time part from both dates
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfPastDay = new Date(
      pastDate.getFullYear(),
      pastDate.getMonth(),
      pastDate.getDate(),
    );

    const timeDifference = startOfToday.getTime() - startOfPastDay.getTime();
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
      const daysFromCreation = await this.getDaysBetween(
        new Date(employee.created_date),
      );
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
