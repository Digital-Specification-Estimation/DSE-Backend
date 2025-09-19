import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  // Create Users
  const user1 = await prisma.user.create({
    data: {
      username: 'john_doe',
      email: 'john.doe@example.com',
      password: 'hashedpassword123',
      business_name: 'Doe Enterprises',
    },
  });
  // Define roles and default permissions
  const roles = [
    {
      role: 'admin',
      full_access: true,
      approve_attendance: true,
      manage_payroll: true,
      view_reports: true,
      approve_leaves: true,
      view_payslip: true,
      mark_attendance: true,
      generate_reports: true,
      manage_employees: true,
    },
    {
      role: 'hr manager',
      full_access: false,
      approve_attendance: true,
      manage_payroll: true,
      view_reports: true,
      approve_leaves: true,
      view_payslip: true,
      mark_attendance: false,
      generate_reports: true,
      manage_employees: true,
    },
    {
      role: 'departure manager',
      full_access: false,
      approve_attendance: false,
      manage_payroll: false,
      view_reports: true,
      approve_leaves: true,
      view_payslip: true,
      mark_attendance: false,
      generate_reports: true,
      manage_employees: false,
    },
    {
      role: 'employee',
      full_access: false,
      approve_attendance: false,
      manage_payroll: false,
      view_reports: false,
      approve_leaves: false,
      view_payslip: true,
      mark_attendance: true,
      generate_reports: false,
      manage_employees: false,
    },
  ];
  // Seed user settings if they don't exist
  for (const role of roles) {
    const existing = await prisma.userSettings.findFirst({
      where: { role: role.role },
    });
    if (!existing) {
      await prisma.userSettings.create({ data: role });
      console.log(`:white_check_mark: Inserted default settings for role: ${role.role}`);
    } else {
      console.log(`:information_source: Settings already exist for role: ${role.role}`);
    }
  }
  // Optional: Additional users
  // const user2 = await prisma.user.create({
  //   data: {
  //     username: 'alice_smith',
  //     email: 'alice.smith@example.com',
  //     password: 'hashedpassword123',
  //     business_name: 'Smith Solutions',
  //   },
  // });
  // Create Companies
  // const company1 = await prisma.company.create({
  //   data: {
  //     company_profile: 'Construction Company',
  //     company_name: 'BuildIt Corp',
  //     business_type: 'Construction',
  //     standard_work_hours: 40,
  //     weekly_work_limit: 50,
  //     overtime_rate: 1.5,
  //     daily_total_planned_cost: 1000.0,
  //     daily_total_actual_cost: 950.0,
  //     users: {
  //       connect: {
  //         id: user1.id,
  //       },
  //     },
  //   },
  // });
  // const company2 = await prisma.company.create({
  //   data: {
  //     company_profile: 'IT Solutions',
  //     company_name: 'TechGiant',
  //     business_type: 'Software Development',
  //     standard_work_hours: 40,
  //     weekly_work_limit: 45,
  //     overtime_rate: 1.25,
  //     daily_total_planned_cost: 500.0,
  //     daily_total_actual_cost: 480.0,
  //     users: {
  //       connect: {
  //         id: user2.id,
  //       },
  //     },
  //   },
  // });
  // Create Trade Positions
  // const tradePosition1 = await prisma.tradePosition.create({ ... });
  // const tradePosition2 = await prisma.tradePosition.create({ ... });
  // Create Employees
  // const employee1 = await prisma.employee.create({ ... });
  // const employee2 = await prisma.employee.create({ ... });
  // Create Attendance Records with distant dates
  // const attendance1 = await prisma.attendance.create({ ... });
  // const attendance2 = await prisma.attendance.create({ ... });
  // ... other attendances
  // Create Logs
  // const log1 = await prisma.log.create({ ... });
  // const log2 = await prisma.log.create({ ... });
  // Create Notifications
  // const notification1 = await prisma.notification.create({ ... });
  // const notification2 = await prisma.notification.create({ ... });
  // Create Locations
  // const location1 = await prisma.location.create({ ... });
  // const location2 = await prisma.location.create({ ... });
  // Create Projects
  // const project1 = await prisma.project.create({ ... });
  // const project2 = await prisma.project.create({ ... });
  console.log(':white_check_mark: Seed data created successfully');
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });