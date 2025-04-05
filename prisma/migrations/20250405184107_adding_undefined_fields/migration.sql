-- AlterTable
ALTER TABLE "TradePosition" ALTER COLUMN "trade_name" DROP NOT NULL,
ALTER COLUMN "daily_planned_cost" DROP NOT NULL,
ALTER COLUMN "work_days" DROP NOT NULL,
ALTER COLUMN "planned_salary" DROP NOT NULL,
ALTER COLUMN "location_name" DROP NOT NULL;
