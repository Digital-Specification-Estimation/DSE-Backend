/*
  Warnings:

  - You are about to alter the column `daily_planned_cost` on the `TradePosition` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "Attendance" ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "daily_rate" SET DEFAULT 0,
ALTER COLUMN "created_date" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "budget_baseline" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Log" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "project_name" SET DEFAULT 'Project';

-- AlterTable
ALTER TABLE "TradePosition" ALTER COLUMN "daily_planned_cost" SET DATA TYPE DECIMAL(10,2);
