-- AlterTable
ALTER TABLE "TradePosition" ADD COLUMN     "projectId" TEXT;

-- AddForeignKey
ALTER TABLE "TradePosition" ADD CONSTRAINT "TradePosition_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
