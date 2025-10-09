-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "TradePosition" ADD COLUMN     "late_deduction_rate" DECIMAL(65,30) DEFAULT 0.1;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
