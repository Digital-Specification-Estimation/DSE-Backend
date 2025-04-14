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

  const user2 = await prisma.user.create({
    data: {
      username: 'alice_smith',
      email: 'alice.smith@example.com',
      password: 'hashedpassword123',
      business_name: 'Smith Solutions',
    },
  });

  // Create Companies
  const company1 = await prisma.company.create({
    data: {
      company_profile: 'Construction Company',
      company_name: 'BuildIt Corp',
      business_type: 'Construction',
      standard_work_hours: 40,
      weekly_work_limit: 50,
      overtime_rate: 1.5,
      daily_total_planned_cost: 1000.0,
      daily_total_actual_cost: 950.0,
      users: {
        connect: {
          id: user1.id,
        },
      },
    },
  });

  const company2 = await prisma.company.create({
    data: {
      company_profile: 'IT Solutions',
      company_name: 'TechGiant',
      business_type: 'Software Development',
      standard_work_hours: 40,
      weekly_work_limit: 45,
      overtime_rate: 1.25,
      daily_total_planned_cost: 500.0,
      daily_total_actual_cost: 480.0,
      users: {
        connect: {
          id: user2.id,
        },
      },
    },
  });

  // Create Trade Positions
  const tradePosition1 = await prisma.tradePosition.create({
    data: {
      trade_name: 'Carpenter',
      daily_planned_cost: 200.0,
      location_name: 'Site A',
      work_days: 5,
      planned_salary: 1000.0,
    },
  });

  const tradePosition2 = await prisma.tradePosition.create({
    data: {
      trade_name: 'Electrician',
      daily_planned_cost: 220.0,
      location_name: 'Site B',
      work_days: 5,
      planned_salary: 1100.0,
    },
  });

  // Create Employees
  const employee1 = await prisma.employee.create({
    data: {
      username: 'jane_smith',
      trade_position_id: tradePosition1.id,
      daily_rate: 150.0,
      contract_finish_date: new Date('2023-12-31'),
      days_projection: 100,
      budget_baseline: 15000.0,
      company_id: company1.id,
    },
  });

  const employee2 = await prisma.employee.create({
    data: {
      username: 'bob_jones',
      trade_position_id: tradePosition2.id,
      daily_rate: 160.0,
      contract_finish_date: new Date('2024-06-30'),
      days_projection: 120,
      budget_baseline: 17000.0,
      company_id: company2.id,
    },
  });

  // Create Attendance Records with distant dates
  const attendance1 = await prisma.attendance.create({
    data: {
      employee_id: employee1.id,
      status: 'present',
      reason: null,
      overtime_hours: 2.5,
    },
  });

  const attendance2 = await prisma.attendance.create({
    data: {
      employee_id: employee2.id,
      status: 'absent',
      reason: 'Sick leave',
      overtime_hours: 0,
    },
  });

  const attendance3 = await prisma.attendance.create({
    data: {
      employee_id: employee1.id,
      status: 'present',
      reason: 'Working overtime',
      overtime_hours: 3.5,
      date: new Date('2024-01-15'),
    },
  });

  const attendance4 = await prisma.attendance.create({
    data: {
      employee_id: employee2.id,
      status: 'present',
      reason: 'Regular shift',
      overtime_hours: 1.5,
      date: new Date('2024-03-10'),
    },
  });

  const attendance5 = await prisma.attendance.create({
    data: {
      employee_id: employee1.id,
      status: 'absent',
      reason: 'Vacation',
      overtime_hours: 0,
      date: new Date('2024-06-01'),
    },
  });

  const attendance6 = await prisma.attendance.create({
    data: {
      employee_id: employee2.id,
      status: 'present',
      reason: 'Working overtime',
      overtime_hours: 4.0,
      date: new Date('2025-01-20'),
    },
  });

  const attendance7 = await prisma.attendance.create({
    data: {
      employee_id: employee1.id,
      status: 'present',
      reason: 'Special project',
      overtime_hours: 5.0,
      date: new Date('2025-03-25'),
    },
  });

  const attendance8 = await prisma.attendance.create({
    data: {
      employee_id: employee2.id,
      status: 'absent',
      reason: 'Medical leave',
      overtime_hours: 0,
      date: new Date('2025-04-10'),
    },
  });

  // Create Logs
  const log1 = await prisma.log.create({
    data: {
      user_id: user1.id,
      action: 'Logged in',
    },
  });

  const log2 = await prisma.log.create({
    data: {
      user_id: user2.id,
      action: 'Logged in',
    },
  });

  // Create Notifications
  const notification1 = await prisma.notification.create({
    data: {
      message: 'Welcome to the system!',
      user_id: user1.id,
      read: false,
    },
  });

  const notification2 = await prisma.notification.create({
    data: {
      message: 'You have a new task assigned!',
      user_id: user2.id,
      read: false,
    },
  });

  // Create Locations
  const location1 = await prisma.location.create({
    data: {
      location_name: 'Site A',
    },
  });

  const location2 = await prisma.location.create({
    data: {
      location_name: 'Site B',
    },
  });

  // Create Projects
  const project1 = await prisma.project.create({
    data: {
      location_name: 'Site C',
      currency: 'USD',
      start_date: new Date('2023-01-01'),
      end_date: new Date('2023-12-31'),
    },
  });

  const project2 = await prisma.project.create({
    data: {
      location_name: 'Site D',
      currency: 'USD',
      start_date: new Date('2024-02-01'),
      end_date: new Date('2024-12-31'),
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
