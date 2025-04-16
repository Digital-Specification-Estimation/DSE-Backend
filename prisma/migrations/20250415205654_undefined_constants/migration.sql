-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "company_profile" DROP NOT NULL,
ALTER COLUMN "daily_total_planned_cost" DROP NOT NULL,
ALTER COLUMN "daily_total_actual_cost" DROP NOT NULL;
