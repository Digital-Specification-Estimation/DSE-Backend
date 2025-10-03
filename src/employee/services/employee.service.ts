import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { UsersService } from 'src/users/services/users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundError } from 'rxjs';
import { NotificationsGateway } from 'src/notifications/gateways/notifications.gateway';
import { AttendanceEntity } from 'src/attendance/entities/attendance.entity';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class EmployeeService {
  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationsGateway,
  ) {}

  private calculateBusinessDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

async addEmployee(
  createEmployee: CreateEmployeeDto,
  userId: string,
  userCompanyId: string, // <-- company_id comes from the logged-in user
) {
  let daysProjection = 0;

  if (createEmployee.contract_start_date && createEmployee.contract_finish_date) {
    daysProjection = this.calculateBusinessDays(
      new Date(createEmployee.contract_start_date),
      new Date(createEmployee.contract_finish_date)
    );
  }

  const employee = await this.prisma.employee.create({
    data: {
      ...createEmployee,
      company_id: userCompanyId, // <-- always use logged-in user's company
      days_projection: daysProjection > 0 ? daysProjection : null
    },
  });

  if (employee) {
    await this.notificationGateway.sendBroadcastNotification(
      userId,
      `Employee called ${employee.username} is created`,
    );
  }

  return employee;
}



  async editEmployee(updateEmployee: UpdateEmployeeDto) {
    if (!updateEmployee.id) {
      throw new Error('Employee ID is required');
    }

    // If either contract date is being updated, recalculate days projection
    if (updateEmployee.contract_start_date || updateEmployee.contract_finish_date) {
      const existingEmployee = await this.prisma.employee.findUnique({
        where: { id: updateEmployee.id },
      });

      if (existingEmployee) {
        const startDate = updateEmployee.contract_start_date 
          ? new Date(updateEmployee.contract_start_date)
          : existingEmployee.contract_start_date
              ? new Date(existingEmployee.contract_start_date)
              : null;
              
        const finishDate = updateEmployee.contract_finish_date 
          ? new Date(updateEmployee.contract_finish_date)
          : existingEmployee.contract_finish_date
              ? new Date(existingEmployee.contract_finish_date)
              : null;

        if (startDate && finishDate) {
          updateEmployee.days_projection = this.calculateBusinessDays(startDate, finishDate);
        } else {
          updateEmployee.days_projection = 0;
        }
      }
    }

    if (await this.employeeExists(updateEmployee.id)) {
      return await this.prisma.employee.update({
        where: { id: updateEmployee.id },
        data: { ...updateEmployee },
      });
    } else {
      throw new Error('Employee does not exist');
    }
  }

  async deleteEmployee(employeeId: string, userId: string) {
    if (await this.employeeExists(employeeId)) {
      const employee = await this.prisma.employee.delete({
        where: { id: employeeId },
      });
      if (employee) {
        await this.notificationGateway.sendBroadcastNotification(
          userId,
          `Employee called ${employee.username} is deleted`,
        );
      }
      return employee;
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

  async getMonthlyStatistics(
    salary_calculation: string,
    company_id: string,
  ): Promise<any[]> {
    const employees = await this.prisma.employee.findMany({
      where: { company_id },
      include: { trade_position: true },
    });

    const dataMap: { [key: string]: { cost: number; planned: number } } = {};
    for (let i = 0; i < 12; i++) {
      const month = this.months[i];
      dataMap[month] = { cost: 0, planned: 0 };
    }

    employees.forEach((employee) => {
      const date = new Date(employee.contract_start_date ? employee.contract_start_date : new Date());
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
  async getEmployees(
    salary_calculation: string,
    currency: string,
    companyId: string,
  ) {
    const employees = await this.prisma.employee.findMany({
      where: { company_id: companyId },
      include: {
        trade_position: { include: { project: true } },
        company: true,
        attendance: true,
      },
    });
    const splitCurrencyValue = (str: string | undefined | null) => {
      if (!str) return null; // return early if str is undefined or null
      const match = str.match(/^([A-Z]+)([\d.]+)$/);
      if (!match) return null;
      return {
        currency: match[1],
        value: match[2],
      };
    };

    const employeeWithExtras = await Promise.all(
      employees.map(async (employee) => {
        let daysAbsentNoReason = 0;
        await employee.attendance.map((attend: AttendanceEntity) => {
          if (
            (attend.reason === '' || null || undefined) &&
            attend.status === 'absent'
          ) {
            daysAbsentNoReason += 1;
          }
        });
        let currencyValue = Number(splitCurrencyValue(currency)?.value);
        let currencyShort = splitCurrencyValue(currency)?.currency;
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
          'unpaid leave',
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
                (Number(
                  await this.getDaysBetween(
                    employee.contract_start_date
                      ? new Date(employee.contract_start_date)
                      : new Date(),
                  ),
                ) -
                  daysAbsentNoReason),
            ) -
            Number(
              Number(employee.monthly_rate ? employee.monthly_rate : 0) *
                (Number(
                  await this.getDaysBetween(
                    employee.contract_start_date
                      ? new Date(employee.contract_start_date)
                      : new Date(),
                  ),
                ) -
                  daysAbsentNoReason),
            );
          totalPlannedBytrade = Number(
            Number(
              employee.trade_position.monthly_planned_cost
                ? employee.trade_position.monthly_planned_cost
                : 0,
            ) *
              (Number(
                await this.getDaysBetween(
                  employee.contract_start_date
                    ? new Date(employee.contract_start_date)
                    : new Date(),
                ),
              ) -
                daysAbsentNoReason),
          );
          totalActualPayroll =
            Number(employee.monthly_rate ? employee.monthly_rate : 0) *
            (Number(
              await this.getDaysBetween(
                employee.contract_start_date
                  ? new Date(employee.contract_start_date)
                  : new Date(),
              ),
            ) -
              daysAbsentNoReason);
        } else {
          plannedVsActual =
            Number(
              Number(
                employee.trade_position.daily_planned_cost
                  ? employee.trade_position.daily_planned_cost
                  : 0,
              ) *
                (Number(
                  await this.getDaysBetween(
                    employee.contract_start_date
                      ? new Date(employee.contract_start_date)
                      : new Date(),
                  ),
                ) -
                  daysAbsentNoReason),
            ) -
            Number(
              Number(employee.daily_rate ? employee.daily_rate : 0) *
                (Number(
                  await this.getDaysBetween(
                    employee.contract_start_date
                      ? new Date(employee.contract_start_date)
                      : new Date(),
                  ),
                ) -
                  daysAbsentNoReason),
            );
          totalPlannedBytrade = Number(
            Number(
              employee.trade_position.daily_planned_cost
                ? employee.trade_position.daily_planned_cost
                : 0,
            ) *
              (Number(
                await this.getDaysBetween(
                  employee.contract_start_date
                    ? new Date(employee.contract_start_date)
                    : new Date(),
                ),
              ) -
                daysAbsentNoReason),
          );
          totalActualPayroll =
            Number(employee.daily_rate ? employee.daily_rate : 0) *
            (Number(
              await this.getDaysBetween(
                employee.contract_start_date
                  ? new Date(employee.contract_start_date)
                  : new Date(),
              ),
            ) -
              daysAbsentNoReason);
        }
        return {
          ...employee,
          budget_baseline: employee.budget_baseline?.toString(),
          daily_rate: employee.daily_rate?.toString(),
          monthly_rate: employee.monthly_rate?.toString(),

          days_worked:
            Number(
              await this.getDaysBetween(
                employee.contract_start_date
                  ? new Date(employee.contract_start_date)
                  : new Date(),
              ),
            ) - daysAbsentNoReason,
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
              ? `Over Budget ${(plannedVsActual * currencyValue).toLocaleString()}`
              : `Planned ${(plannedVsActual * currencyValue).toLocaleString()}`,
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
        contract_start_date: {
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
      where: { contract_start_date: startDate },
      include: { trade_position: true },
    });
    let totalPLannedPayrollOfEMployees = 0;
    let totalPayrollOfEmployees = 0;
    for (const employee of filteredEmployees) {
      const daysFromCreation = await this.getDaysBetween(
        new Date(employee.contract_start_date ? employee.contract_start_date : new Date()),
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
      return await this.getDaysBetween(employee.contract_start_date ? employee.contract_start_date : new Date());
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
      const daysToCreation = await this.getDaysBetween(employee.contract_start_date ? employee.contract_start_date : new Date());
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

  async bulkUploadFromCSV(
    csvData: any[],
    userId: string,
    companyId: string,
  ) {
    const results = {
      locations: { created: 0, skipped: 0, errors: [] as string[] },
      trades: { created: 0, skipped: 0, errors: [] as string[] },
      projects: { created: 0, skipped: 0, errors: [] as string[] },
      employees: { created: 0, skipped: 0, errors: [] as string[] },
    };

    // Maps to store created entities for reference
    const locationMap = new Map<string, string>(); // location_name -> id
    const tradeMap = new Map<string, string>(); // trade_name+location -> id
    const projectMap = new Map<string, string>(); // project_name+location -> id

    try {
      // Step 1: Process Locations
      const uniqueLocations = new Set<string>();
      csvData.forEach((row) => {
        if (row.location_name) {
          uniqueLocations.add(row.location_name.trim());
        }
      });

      for (const locationName of uniqueLocations) {
        try {
          // Check if location already exists
          const existing = await this.prisma.location.findFirst({
            where: {
              location_name: { equals: locationName, mode: 'insensitive' },
              company_id: companyId,
            },
          });

          if (existing) {
            locationMap.set(locationName.toLowerCase(), existing.id);
            results.locations.skipped++;
          } else {
            const newLocation = await this.prisma.location.create({
              data: { location_name: locationName, company_id: companyId },
            });
            locationMap.set(locationName.toLowerCase(), newLocation.id);
            results.locations.created++;
          }
        } catch (error) {
          results.locations.errors.push(
            `Location "${locationName}": ${error.message}`,
          );
        }
      }

      // Step 2: Process Projects
      const uniqueProjects = new Map<string, any>();
      csvData.forEach((row) => {
        const projectName = row.project_name || row.project_name;
        const locationName = row.location_name || row.location_name;
        const projectBudget = row.project_budget || row.project_budget;
        const projectStartDate = row.project_start_date || row.project_start_date;
        const projectEndDate = row.project_end_date || row.project_end_date;

        if (projectName && locationName) {
          const key = `${projectName.trim()}|${locationName.trim()}`;
          if (!uniqueProjects.has(key)) {
            uniqueProjects.set(key, {
              project_name: projectName.trim(),
              location_name: locationName.trim(),
              budget: projectBudget || '0',
              start_date: projectStartDate || new Date().toISOString(),
              end_date: projectEndDate || new Date().toISOString(),
            });
          }
        }
      });

      for (const [key, projectData] of uniqueProjects) {
        try {
          // Check if project already exists
          const existing = await this.prisma.project.findFirst({
            where: {
              project_name: {
                equals: projectData.project_name,
                mode: 'insensitive',
              },
              location_name: {
                equals: projectData.location_name,
                mode: 'insensitive',
              },
              company_id: companyId,
            },
          });

          if (existing) {
            projectMap.set(key.toLowerCase(), existing.id);
            results.projects.skipped++;
          } else {
            const newProject = await this.prisma.project.create({
              data: {
                project_name: projectData.project_name,
                location_name: projectData.location_name,
                budget: projectData.budget,
                start_date: new Date(projectData.start_date),
                end_date: new Date(projectData.end_date),
                company_id: companyId,
              },
            });
            projectMap.set(key.toLowerCase(), newProject.id);
            results.projects.created++;
          }
        } catch (error) {
          results.projects.errors.push(
            `Project "${projectData.project_name}": ${error.message}`,
          );
        }
      }

      // Step 3: Process Trades
      const uniqueTrades = new Map<string, any>();
      csvData.forEach((row) => {
        const tradeName = row.trade_name || row.trade_name;
        const locationName = row.location_name || row.location_name;
        const dailyPlannedCost = row.trade_daily_planned_cost || row.daily_planned_cost;
        const monthlyPlannedCost = row.trade_monthly_planned_cost || row.monthly_planned_cost;
        const workDays = row.trade_work_days || row.work_days;
        const plannedSalary = row.trade_planned_salary || row.planned_salary;
        const projectName = row.project_name || row.project_name;

        if (tradeName && locationName) {
          const key = `${tradeName.trim()}|${locationName.trim()}`;
          if (!uniqueTrades.has(key)) {
            uniqueTrades.set(key, {
              trade_name: tradeName.trim(),
              location_name: locationName.trim(),
              daily_planned_cost: dailyPlannedCost || '0',
              monthly_planned_cost: monthlyPlannedCost || '0',
              work_days: workDays ? parseInt(workDays) : 0,
              planned_salary: plannedSalary || '0',
              project_name: projectName?.trim(),
            });
          }
        }
      });

      for (const [key, tradeData] of uniqueTrades) {
        try {
          // Check if trade already exists
          const existing = await this.prisma.tradePosition.findFirst({
            where: {
              trade_name: { equals: tradeData.trade_name, mode: 'insensitive' },
              location_name: {
                equals: tradeData.location_name,
                mode: 'insensitive',
              },
              company_id: companyId,
            },
          });

          if (existing) {
            tradeMap.set(key.toLowerCase(), existing.id);
            results.trades.skipped++;
          } else {
            // Get project ID if project_name is provided
            let projectId: string | null = null;
            if (tradeData.project_name) {
              const projectKey = `${tradeData.project_name}|${tradeData.location_name}`;
              projectId = projectMap.get(projectKey.toLowerCase()) || null;
            }

            const newTrade = await this.prisma.tradePosition.create({
              data: {
                trade_name: tradeData.trade_name,
                location_name: tradeData.location_name,
                daily_planned_cost: tradeData.daily_planned_cost,
                monthly_planned_cost: tradeData.monthly_planned_cost,
                work_days: tradeData.work_days,
                planned_salary: tradeData.planned_salary,
                company_id: companyId,
                projectId: projectId,
              },
            });
            tradeMap.set(key.toLowerCase(), newTrade.id);
            results.trades.created++;
          }
        } catch (error) {
          results.trades.errors.push(
            `Trade "${tradeData.trade_name}": ${error.message}`,
          );
        }
      }

      // Step 4: Process Employees
      for (const row of csvData) {
        // Support both old and new column names for backward compatibility
        const username = row.employee_name || row.username;
        const tradeName = row.trade_name || row.trade_name;
        const locationName = row.location_name || row.location_name;
        const dailyRate = row.employee_daily_rate || row.daily_rate;
        const monthlyRate = row.employee_monthly_rate || row.monthly_rate;
        const contractStartDate = row.employee_contract_start_date || row.contract_start_date;
        const contractFinishDate = row.employee_contract_finish_date || row.contract_finish_date;
        const budgetBaseline = row.employee_budget_baseline || row.budget_baseline;

        if (!username || !tradeName || !locationName) {
          results.employees.errors.push(
            `Row missing required fields: employee_name, trade_name, or location_name`,
          );
          continue;
        }

        try {
          // Find the trade position
          const tradeKey = `${tradeName.trim()}|${locationName.trim()}`;
          const tradePositionId = tradeMap.get(tradeKey.toLowerCase());

          if (!tradePositionId) {
            results.employees.errors.push(
              `Employee "${username}": Trade position not found`,
            );
            continue;
          }

          // Always calculate days projection from contract dates
          let daysProjection = 0;
          if (contractStartDate && contractFinishDate) {
            daysProjection = this.calculateBusinessDays(
              new Date(contractStartDate),
              new Date(contractFinishDate),
            );
          }

          const newEmployee = await this.prisma.employee.create({
            data: {
              username: username.trim(),
              trade_position_id: tradePositionId,
              daily_rate: dailyRate || '0',
              monthly_rate: monthlyRate || '0',
              contract_start_date: contractStartDate
                ? new Date(contractStartDate)
                : new Date(),
              contract_finish_date: contractFinishDate
                ? new Date(contractFinishDate)
                : null,
              days_projection: daysProjection > 0 ? daysProjection : null,
              budget_baseline: budgetBaseline || '0',
              company_id: companyId,
            },
          });

          results.employees.created++;
        } catch (error) {
          results.employees.errors.push(
            `Employee "${username}": ${error.message}`,
          );
        }
      }

      // Send notification
      if (
        results.locations.created > 0 ||
        results.trades.created > 0 ||
        results.projects.created > 0 ||
        results.employees.created > 0
      ) {
        await this.notificationGateway.sendBroadcastNotification(
          userId,
          `Bulk upload completed: ${results.employees.created} employees, ${results.trades.created} trades, ${results.projects.created} projects, ${results.locations.created} locations created`,
        );
      }

      return results;
    } catch (error) {
      console.error('Bulk upload error:', error);
      throw error;
    }
  }
}
