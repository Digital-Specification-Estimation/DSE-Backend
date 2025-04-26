-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "company_id" TEXT;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "company_id" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "company_id" TEXT;

-- AlterTable
ALTER TABLE "TradePosition" ADD COLUMN     "company_id" TEXT;
