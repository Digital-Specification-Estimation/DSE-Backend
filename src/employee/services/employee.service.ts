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
      include: { 
        trade_position: true,
        project: true 
      },
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
        project: true,
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

  async calculateProjectPayroll(projectId: string, companyId: string, startDate?: string, endDate?: string) {
    console.log('=== CALCULATE PROJECT PAYROLL DEBUG ===');
    console.log('Project ID:', projectId);
    console.log('Company ID:', companyId);
    console.log('Date Range:', startDate, 'to', endDate);
    
    // Get project employees with trade positions (matching attendance-payroll logic)
    const projectEmployees = await this.prisma.employee.findMany({
      where: {
        projectId: projectId,
        company_id: companyId,
      },
      include: {
        trade_position: true,
        attendance: true, // Include all attendance records
      },
    });

    console.log('Found employees:', projectEmployees.length);
    console.log('Employee details:', projectEmployees.map(emp => ({
      id: emp.id,
      username: emp.username,
      daily_rate: emp.daily_rate,
      monthly_rate: emp.monthly_rate,
      attendance_count: emp.attendance?.length || 0,
      trade_position: emp.trade_position ? {
        daily_planned_cost: emp.trade_position.daily_planned_cost,
        monthly_planned_cost: emp.trade_position.monthly_planned_cost
      } : null
    })));

    // Check if there are any attendance records at all
    const allAttendanceRecords = await this.prisma.attendance.findMany({
      where: {
        employee_id: { in: projectEmployees.map(emp => emp.id) }
      }
    });
    console.log('Total attendance records for all project employees:', allAttendanceRecords.length);
    
    // Check specifically for Jean Baptiste
    const jeanBaptiste = projectEmployees.find(emp => emp.username === 'Jean Baptiste');
    if (jeanBaptiste) {
      const jeanAttendance = await this.prisma.attendance.findMany({
        where: { employee_id: jeanBaptiste.id }
      });
      console.log('Jean Baptiste attendance records:', jeanAttendance.length);
      console.log('Jean Baptiste attendance details:', jeanAttendance);
    }

    if (!projectEmployees.length) {
      return {
        totalGrossPay: 0,
        totalNetPay: 0,
        totalDeductions: 0,
        employees: [],
        summary: {
          totalEmployees: 0,
          totalGrossPay: 0,
          totalNetPay: 0,
          totalDeductions: 0,
        },
      };
    }

    // Get deductions for project employees
    const deductions = await this.prisma.deduction.findMany({
      where: {
        employee_id: { in: projectEmployees.map(emp => emp.id) },
      },
    });

    let totalGrossPay = 0;
    let totalNetPay = 0;
    let totalDeductions = 0;
    const employeePayrollData: any[] = [];

    for (const employee of projectEmployees) {
      console.log(`\n--- Processing employee: ${employee.username} ---`);
      
      // Get daily rate - exact logic from attendance-payroll page
      let dailyRate = Number(employee.daily_rate || 0);
      console.log('Initial daily_rate:', dailyRate);
      
      if (dailyRate === 0 && employee.trade_position?.daily_planned_cost) {
        dailyRate = Number(employee.trade_position.daily_planned_cost);
        console.log('Using trade_position daily_planned_cost:', dailyRate);
      }
      // If still 0 and monthly rate exists, convert monthly to daily
      if (dailyRate === 0 && employee.trade_position?.monthly_planned_cost) {
        dailyRate = Number(employee.trade_position.monthly_planned_cost) / 30;
        console.log('Using trade_position monthly_planned_cost / 30:', dailyRate);
      }

      const monthlyRate = Number(employee.monthly_rate || 0);
      console.log('Monthly rate:', monthlyRate);
      
      // Filter attendance records by date range if provided
      let employeeAttendance = employee.attendance || [];
      console.log('Total attendance records:', employeeAttendance.length);
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        employeeAttendance = employeeAttendance.filter(att => {
          const attDate = new Date(att.date);
          return attDate >= start && attDate <= end;
        });
        console.log('Filtered attendance records:', employeeAttendance.length);
      }
      
      // Calculate attendance breakdown - exact logic from attendance-payroll (case insensitive)
      const presentDays = employeeAttendance.filter(att => att.status?.toLowerCase() === 'present').length;
      const lateDays = employeeAttendance.filter(att => att.status?.toLowerCase() === 'late').length;
      
      // Paid leave days (sick and vacation)
      const sickDays = employeeAttendance.filter(att => 
        att.status?.toLowerCase() === 'absent' && att.reason?.toLowerCase() === 'sick'
      ).length;
      const vacationDays = employeeAttendance.filter(att => 
        att.status?.toLowerCase() === 'absent' && att.reason?.toLowerCase() === 'vacation'
      ).length;
      
      // Unpaid absent days
      const absentDays = employeeAttendance.filter(att => 
        att.status?.toLowerCase() === 'absent' && (!att.reason || (att.reason?.toLowerCase() !== 'sick' && att.reason?.toLowerCase() !== 'vacation'))
      ).length;
      
      // Working days = present + late + paid leave (sick + vacation)
      // This matches the attendance-payroll logic exactly
      const employeeWorkingDays = presentDays + lateDays + sickDays + vacationDays;
      
      console.log('Attendance breakdown:', {
        presentDays,
        lateDays,
        sickDays,
        vacationDays,
        absentDays,
        workingDays: employeeWorkingDays
      });
      
      // Calculate gross pay - matching attendance-payroll logic
      const employeeActualPayroll = employeeWorkingDays * dailyRate;
      console.log('Gross pay calculation:', `${employeeWorkingDays} * ${dailyRate} = ${employeeActualPayroll}`);
      
      // Calculate automatic deductions - exact logic from attendance-payroll
      const lateDeduction = lateDays * (dailyRate * 0.1); // 10% penalty per late day
      
      // Get manual deductions for this employee
      const employeeDeductions = deductions.filter(ded => ded.employee_id === employee.id);
      const employeeManualDeductions = employeeDeductions.reduce((sum, ded) => sum + Number(ded.amount || 0), 0);
      
      const totalEmployeeDeductions = lateDeduction + employeeManualDeductions;
      
      // Net payroll - exact calculation from attendance-payroll
      // Note: Absent days are unpaid leave (0 pay), not deductions
      const netPayroll = employeeActualPayroll - totalEmployeeDeductions;

      totalGrossPay += employeeActualPayroll;
      totalDeductions += totalEmployeeDeductions;
      totalNetPay += netPayroll;

      employeePayrollData.push({
        employee_id: employee.id,
        employee_name: employee.username,
        daily_rate: dailyRate,
        monthly_rate: monthlyRate,
        working_days: employeeWorkingDays,
        present_days: presentDays,
        late_days: lateDays,
        sick_days: sickDays,
        vacation_days: vacationDays,
        absent_days: absentDays,
        gross_pay: employeeActualPayroll,
        late_penalty: lateDeduction,
        manual_deductions: employeeManualDeductions,
        total_deductions: totalEmployeeDeductions,
        net_pay: netPayroll,
      });
    }

    return {
      totalGrossPay,
      totalNetPay,
      totalDeductions,
      employees: employeePayrollData,
      summary: {
        totalEmployees: projectEmployees.length,
        totalGrossPay,
        totalNetPay,
        totalDeductions,
        period: startDate && endDate ? `${startDate} to ${endDate}` : 'All time',
      },
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

  // CSV Bulk Upload Implementation - Comprehensive Master Template Processing
  async bulkUploadFromCSV(csvData: any[], userId: string, companyId: string) {
    console.log(`Starting bulk upload for company ${companyId} with ${csvData.length} records`);
    
    const results = {
      success: true,
      message: '',
      details: {
        locations: { created: 0, existing: 0, names: [] as string[] },
        projects: { created: 0, existing: 0, names: [] as string[] },
        trades: { created: 0, existing: 0, names: [] as string[] },
        employees: { created: 0, existing: 0, names: [] as string[] },
      },
      errors: [] as string[],
    };

    try {
      // STEP 1: LOCATION PROCESSING
      console.log('Step 1: Processing locations...');
      const uniqueLocations = [...new Set(csvData.map(row => row.location_name?.trim()).filter(Boolean))];
      
      for (const locationName of uniqueLocations) {
        const existingLocation = await this.prisma.location.findFirst({
          where: {
            location_name: { equals: locationName, mode: 'insensitive' },
            company_id: companyId,
          },
        });

        if (!existingLocation) {
          await this.prisma.location.create({
            data: {
              location_name: locationName,
              company_id: companyId,
            },
          });
          results.details.locations.created++;
          results.details.locations.names.push(locationName);
          console.log(`Created location: ${locationName}`);
        } else {
          results.details.locations.existing++;
          console.log(`Location already exists: ${locationName}`);
        }
      }

      // STEP 2: PROJECT PROCESSING
      console.log('Step 2: Processing projects...');
      const uniqueProjects = csvData.reduce((acc, row) => {
        const key = `${row.project_name?.trim()}_${row.location_name?.trim()}`;
        if (!acc[key] && row.project_name?.trim()) {
          acc[key] = {
            project_name: row.project_name.trim(),
            location_name: row.location_name?.trim(),
            budget: parseFloat(row.project_budget) || 0,
            start_date: new Date(row.project_start_date),
            end_date: new Date(row.project_end_date),
          };
        }
        return acc;
      }, {});

      for (const projectData of Object.values(uniqueProjects) as any[]) {
        const existingProject = await this.prisma.project.findFirst({
          where: {
            project_name: { equals: projectData.project_name, mode: 'insensitive' },
            location_name: { equals: projectData.location_name, mode: 'insensitive' },
            company_id: companyId,
          },
        });

        if (!existingProject) {
          await this.prisma.project.create({
            data: {
              ...projectData,
              company_id: companyId,
            },
          });
          results.details.projects.created++;
          results.details.projects.names.push(projectData.project_name);
          console.log(`Created project: ${projectData.project_name}`);
        } else {
          results.details.projects.existing++;
          console.log(`Project already exists: ${projectData.project_name}`);
        }
      }

      // STEP 3: TRADE PROCESSING WITH ENHANCED VALIDATION
      console.log('Step 3: Processing trades with system-wide validation...');
      
      // Get ALL existing trades in the database for this company
      const existingTrades = await this.prisma.tradePosition.findMany({
        where: { company_id: companyId },
        select: {
          trade_name: true,
          daily_planned_cost: true,
          monthly_planned_cost: true,
          location_name: true,
        },
      });

      // Build a map of existing trade rates (by trade name only, ignoring location)
      const existingTradeRates = new Map();
      const databaseInconsistencies: string[] = [];

      existingTrades.forEach(trade => {
        const tradeName = trade.trade_name?.toLowerCase();
        if (tradeName) {
          const dailyRate = Number(trade.daily_planned_cost || 0);
          const monthlyRate = Number(trade.monthly_planned_cost || 0);
          
          if (existingTradeRates.has(tradeName)) {
            const existing = existingTradeRates.get(tradeName);
            if (existing.daily !== dailyRate || existing.monthly !== monthlyRate) {
              databaseInconsistencies.push(
                `Database inconsistency: Trade '${trade.trade_name}' already exists with different rates. ` +
                `Expected: Daily=${existing.daily}, Monthly=${existing.monthly}. ` +
                `Found: Daily=${dailyRate}, Monthly=${monthlyRate}`
              );
            }
          } else {
            existingTradeRates.set(tradeName, { daily: dailyRate, monthly: monthlyRate });
          }
        }
      });

      // Report database inconsistencies
      if (databaseInconsistencies.length > 0) {
        results.errors = results.errors.concat(databaseInconsistencies);
        console.warn('Database inconsistencies found:', databaseInconsistencies);
      }

      // Extract unique trades from CSV and validate against existing rates
      const csvTradeMap = new Map();
      const csvTradeErrors: string[] = [];

      csvData.forEach((row, index) => {
        const tradeName = row.trade_name?.trim();
        if (tradeName) {
          const dailyRate = parseFloat(row.trade_daily_planned_cost) || 0;
          const monthlyRate = parseFloat(row.trade_monthly_planned_cost) || 0;
          const tradeKey = tradeName.toLowerCase();

          // Check against existing database rates
          if (existingTradeRates.has(tradeKey)) {
            const existing = existingTradeRates.get(tradeKey);
            if (existing.daily !== dailyRate || existing.monthly !== monthlyRate) {
              csvTradeErrors.push(
                `Row ${index + 2}: Trade '${tradeName}' already exists in system with different rates. ` +
                `Expected: Daily=${existing.daily}, Monthly=${existing.monthly}. ` +
                `CSV has: Daily=${dailyRate}, Monthly=${monthlyRate}`
              );
            }
          }

          // Check internal CSV consistency
          if (csvTradeMap.has(tradeKey)) {
            const existing = csvTradeMap.get(tradeKey);
            if (existing.daily !== dailyRate || existing.monthly !== monthlyRate) {
              csvTradeErrors.push(
                `Row ${index + 2}: Trade '${tradeName}' has inconsistent rates within CSV. ` +
                `First occurrence: Daily=${existing.daily}, Monthly=${existing.monthly}. ` +
                `This row: Daily=${dailyRate}, Monthly=${monthlyRate}`
              );
            }
          } else {
            csvTradeMap.set(tradeKey, {
              trade_name: tradeName,
              daily: dailyRate,
              monthly: monthlyRate,
              location_name: null, // Don't tie trades to specific locations
            });
          }
        }
      });

      // If there are trade validation errors, stop processing
      if (csvTradeErrors.length > 0) {
        results.success = false;
        results.errors = results.errors.concat(csvTradeErrors);
        results.message = `Trade validation failed. Found ${csvTradeErrors.length} rate inconsistencies.`;
        return results;
      }

      // Create trades that don't exist
      for (const [tradeKey, tradeData] of csvTradeMap.entries()) {
        if (!existingTradeRates.has(tradeKey)) {
          await this.prisma.tradePosition.create({
            data: {
              trade_name: tradeData.trade_name,
              daily_planned_cost: tradeData.daily,
              monthly_planned_cost: tradeData.monthly,
              location_name: null,
              company_id: companyId,
            },
          });
          results.details.trades.created++;
          results.details.trades.names.push(tradeData.trade_name);
          console.log(`Created trade: ${tradeData.trade_name}`);
        } else {
          results.details.trades.existing++;
          console.log(`Trade already exists: ${tradeData.trade_name}`);
        }
      }

      // STEP 4: ASSIGN TRADES TO PROJECTS
      console.log('Step 4: Assigning trades to projects...');
      
      // Create a map of unique project-trade combinations from CSV
      const projectTradeAssignments = new Map();
      csvData.forEach(row => {
        if (row.project_name?.trim() && row.trade_name?.trim()) {
          const key = `${row.project_name.trim()}-${row.trade_name.trim()}`;
          if (!projectTradeAssignments.has(key)) {
            projectTradeAssignments.set(key, {
              project_name: row.project_name.trim(),
              trade_name: row.trade_name.trim(),
              location_name: row.location_name?.trim(),
              work_days: parseInt(row.trade_work_days) || 22,
              planned_salary: parseFloat(row.trade_planned_salary) || 0,
            });
          }
        }
      });

      // Assign trades to projects
      for (const [key, assignment] of projectTradeAssignments.entries()) {
        const project = await this.prisma.project.findFirst({
          where: {
            project_name: { equals: assignment.project_name, mode: 'insensitive' },
            location_name: { equals: assignment.location_name, mode: 'insensitive' },
            company_id: companyId,
          },
        });

        const tradePosition = await this.prisma.tradePosition.findFirst({
          where: {
            trade_name: { equals: assignment.trade_name, mode: 'insensitive' },
            company_id: companyId,
          },
        });

        if (project && tradePosition) {
          // Check if trade is already assigned to this project
          const existingAssignment = await this.prisma.tradePosition.findFirst({
            where: {
              id: tradePosition.id,
              projectId: project.id,
            },
          });

          if (!existingAssignment) {
            // Update the trade to assign it to the project
            await this.prisma.tradePosition.update({
              where: { id: tradePosition.id },
              data: {
                projectId: project.id,
                work_days: assignment.work_days,
                planned_salary: assignment.planned_salary,
              },
            });
            console.log(`Assigned trade ${assignment.trade_name} to project ${assignment.project_name}`);
          }
        }
      }

      // STEP 5: EMPLOYEE PROCESSING
      console.log('Step 5: Processing employees...');
      
      for (const row of csvData) {
        if (!row.employee_name?.trim()) continue;

        // Get the project for this employee
        const project = await this.prisma.project.findFirst({
          where: {
            project_name: { equals: row.project_name?.trim(), mode: 'insensitive' },
            location_name: { equals: row.location_name?.trim(), mode: 'insensitive' },
            company_id: companyId,
          },
        });

        // Get the trade position for this employee
        const tradePosition = await this.prisma.tradePosition.findFirst({
          where: {
            trade_name: { equals: row.trade_name?.trim(), mode: 'insensitive' },
            company_id: companyId,
          },
        });

        if (!project || !tradePosition) {
          results.errors = results.errors.concat([
            `Employee ${row.employee_name}: Could not find ${!project ? 'project' : 'trade position'}`
          ]);
          continue;
        }

        // Check if employee already exists
        const existingEmployee = await this.prisma.employee.findFirst({
          where: {
            username: { equals: row.employee_name.trim(), mode: 'insensitive' },
            company_id: companyId,
          },
        });

        if (!existingEmployee) {
          // Calculate days projection
          let daysProjection = 0;
          if (row.employee_contract_start_date && row.employee_contract_finish_date) {
            daysProjection = this.calculateBusinessDays(
              new Date(row.employee_contract_start_date),
              new Date(row.employee_contract_finish_date)
            );
          }

          await this.prisma.employee.create({
            data: {
              username: row.employee_name.trim(),
              trade_position_id: tradePosition.id,
              daily_rate: parseFloat(row.employee_daily_rate) || 0,
              monthly_rate: parseFloat(row.employee_monthly_rate) || 0,
              contract_start_date: row.employee_contract_start_date ? new Date(row.employee_contract_start_date) : null,
              contract_finish_date: row.employee_contract_finish_date ? new Date(row.employee_contract_finish_date) : null,
              days_projection: daysProjection,
              budget_baseline: parseFloat(row.employee_budget_baseline) || 0,
              company_id: companyId,
              projectId: project.id,
            },
          });
          
          results.details.employees.created++;
          results.details.employees.names.push(row.employee_name.trim());
          console.log(`Created employee: ${row.employee_name.trim()}`);
        } else {
          results.details.employees.existing++;
          console.log(`Employee already exists: ${row.employee_name.trim()}`);
        }
      }

      // Final success message
      const totalCreated = 
        results.details.locations.created + 
        results.details.projects.created + 
        results.details.trades.created + 
        results.details.employees.created;

      results.message = `Successfully processed CSV! Created ${totalCreated} new entities: ` +
        `${results.details.locations.created} locations, ` +
        `${results.details.projects.created} projects, ` +
        `${results.details.trades.created} trades, ` +
        `${results.details.employees.created} employees.`;

      console.log('Bulk upload completed successfully:', results.message);
      return results;

    } catch (error) {
      console.error('Bulk upload failed:', error);
      results.success = false;
      results.message = 'Bulk upload failed due to an error';
      results.errors = results.errors.concat([error.message || 'Unknown error occurred']);
      return results;
    }
  }
}
