/*
  Warnings:

  - You are about to drop the column `currency` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `deadline_notify` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `notification_sending` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `payslip_format` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `remind_approvals` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `salary_calculation` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `send_email_alerts` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `UserSettings` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserSettings" DROP CONSTRAINT "UserSettings_userId_fkey";

-- DropIndex
DROP INDEX "UserSettings_userId_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currency" TEXT,
ADD COLUMN     "deadline_notify" BOOLEAN,
ADD COLUMN     "notification_sending" BOOLEAN,
ADD COLUMN     "payslip_format" TEXT,
ADD COLUMN     "remind_approvals" BOOLEAN,
ADD COLUMN     "salary_calculation" TEXT,
ADD COLUMN     "send_email_alerts" BOOLEAN;

-- AlterTable
ALTER TABLE "UserSettings" DROP COLUMN "currency",
DROP COLUMN "deadline_notify",
DROP COLUMN "notification_sending",
DROP COLUMN "payslip_format",
DROP COLUMN "remind_approvals",
DROP COLUMN "salary_calculation",
DROP COLUMN "send_email_alerts",
DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "_userSettings" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_userSettings_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_userSettings_B_index" ON "_userSettings"("B");

-- AddForeignKey
ALTER TABLE "_userSettings" ADD CONSTRAINT "_userSettings_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userSettings" ADD CONSTRAINT "_userSettings_B_fkey" FOREIGN KEY ("B") REFERENCES "UserSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
