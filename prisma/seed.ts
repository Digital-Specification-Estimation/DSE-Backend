import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create users
  const user1 = await prisma.user.create({
    data: {
      username: 'user1',
      email: 'user1@example.com',
      password: 'password123', // Ensure passwords are hashed in real projects
      refresh_token: 'refresh-token-1',
      business_name: 'User1 Business',
      notification_sending: true,
      send_email_alerts: true,
      deadline_notify: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'user2',
      email: 'user2@example.com',
      password: 'password123',
      refresh_token: 'refresh-token-2',
      business_name: 'User2 Business',
      notification_sending: false,
      send_email_alerts: false,
      deadline_notify: false,
    },
  });

  // Create a company
  const company1 = await prisma.company.create({
    data: {
      company_profile: 'Company Profile 1',
      company_name: 'Company One',
      business_type: 'IT',
      standard_work_hours: 8,
      weekly_work_limit: 40,
      overtime_rate: 15.0,
      daily_total_planned_cost: 1000.0,
      daily_total_actual_cost: 800.0,
      users: {
        connect: [{ id: user1.id }, { id: user2.id }],
      },
    },
  });

  // Create TradePosition
  const tradePosition1 = await prisma.tradePosition.create({
    data: {
      trade_name: 'Software Engineer',
      daily_planned_cost: 250.0,
      work_days: 5,
      planned_salary: 5000.0,
    },
  });

  // Create an employee and link them to a TradePosition using `trade_position_id`
  const employee1 = await prisma.employee.create({
    data: {
      username: 'employee1',
      trade_position_id: tradePosition1.id, // Directly assigning the trade_position_id
      daily_rate: 200.0,
      contract_finish_date: new Date('2025-12-31'),
      days_projection: 180,
      budget_baseline: 5000.0,
      company_id: company1.id,
    },
  });

  // Create attendance record
  await prisma.attendance.create({
    data: {
      employee_id: employee1.id,
      status: 'present',
      reason: null,
      overtime_hours: 2.0,
    },
  });

  // Create a notification for a user
  await prisma.notification.create({
    data: {
      message: 'Your task is due tomorrow.',
      user_id: user1.id,
      read: false,
    },
  });

  console.log('Database has been seeded.');
}

// Run the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
