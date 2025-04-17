import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roles = ['admin', 'hr manager', 'departure manager', 'employee'];

  for (const role of roles) {
    await prisma.userSettings.create({
      data: {
        role,
        full_access: false,
        approve_attendance: false,
        manage_payroll: false,
        view_reports: false,
        approve_leaves: false,
        view_payslip: false,
        mark_attendance: false,
      },
    });
  }

  console.log(' Seeded user settings with default roles');
}

main()
  .catch((e) => {
    console.error(' Error while seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
