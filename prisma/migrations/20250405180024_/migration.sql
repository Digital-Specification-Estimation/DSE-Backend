/*
  Warnings:

  - You are about to alter the column `daily_planned_cost` on the `TradePosition` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "TradePosition" ALTER COLUMN "daily_planned_cost" SET DATA TYPE DECIMAL(10,2);
