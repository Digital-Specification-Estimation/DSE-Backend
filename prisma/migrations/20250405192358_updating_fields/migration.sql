-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "daily_rate" DROP NOT NULL,
ALTER COLUMN "daily_rate" SET DEFAULT 0,
ALTER COLUMN "contract_finish_date" DROP NOT NULL,
ALTER COLUMN "days_projection" DROP NOT NULL,
ALTER COLUMN "budget_baseline" DROP NOT NULL,
ALTER COLUMN "budget_baseline" SET DEFAULT 0;
