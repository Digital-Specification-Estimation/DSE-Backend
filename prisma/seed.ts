import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a User
  const user = await prisma.user.create({
    data: {
      username: 'john_doe',
      email: 'john.doe@example.com',
      password: 'hashedpassword123', // In a real scenario, hash the password
      business_name: 'Doe Enterprises',
      notification_sending: true,
      send_email_alerts: true,
      deadline_notify: true,
    },
  });

  // Create a Company
  const company = await prisma.company.create({
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
          id: user.id,
        },
      },
    },
  });

  // Create a TradePosition
  const tradePosition = await prisma.tradePosition.create({
    data: {
      trade_name: 'Carpenter',
      daily_planned_cost: 200.0,
      location_name: 'Site A',
      work_days: 5,
      planned_salary: 1000.0,
    },
  });

  // Create an Employee
  const employee = await prisma.employee.create({
    data: {
      username: 'jane_smith',
      trade_position_id: tradePosition.id,
      daily_rate: 150.0,
      contract_finish_date: new Date('2023-12-31'),
      days_projection: 100,
      budget_baseline: 15000.0,
      company_id: company.id,
    },
  });

  // Create an Attendance record
  const attendance = await prisma.attendance.create({
    data: {
      employee_id: employee.id,
      status: 'present',
      reason: null,
      overtime_hours: 2.5,
    },
  });

  // Create a Log
  const log = await prisma.log.create({
    data: {
      user_id: user.id,
      action: 'Logged in',
    },
  });

  // Create a Notification
  const notification = await prisma.notification.create({
    data: {
      message: 'Welcome to the system!',
      user_id: user.id,
      read: false,
    },
  });

  // Create a Location
  const location = await prisma.location.create({
    data: {
      location_name: 'Site B',
    },
  });

  // Create a Project
  const project = await prisma.project.create({
    data: {
      location_name: 'Site C',
      currency: 'USD',
      start_date: new Date('2023-01-01'),
      end_date: new Date('2023-12-31'),
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
