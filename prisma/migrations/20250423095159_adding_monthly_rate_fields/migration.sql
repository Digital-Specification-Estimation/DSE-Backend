-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "monthly_rate" DECIMAL(65,30) DEFAULT 0;

-- AlterTable
ALTER TABLE "TradePosition" ADD COLUMN     "monthly_planned_cost" DECIMAL(10,2);
