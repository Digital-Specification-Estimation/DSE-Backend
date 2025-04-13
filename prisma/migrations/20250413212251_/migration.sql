/*
  Warnings:

  - You are about to drop the column `deadline_notify` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `notification_sending` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `send_email_alerts` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "holidays" TEXT[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "deadline_notify",
DROP COLUMN "notification_sending",
DROP COLUMN "send_email_alerts",
ADD COLUMN     "role" TEXT;

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "salary_calculation" TEXT,
    "currency" TEXT,
    "payslip_format" TEXT,
    "notification_sending" BOOLEAN,
    "send_email_alerts" BOOLEAN,
    "deadline_notify" BOOLEAN,
    "remind_approvals" BOOLEAN,
    "full_access" BOOLEAN,
    "approve_attendance" BOOLEAN,
    "manage_payroll" BOOLEAN,
    "view_reports" BOOLEAN,
    "approve_leaves" BOOLEAN,
    "view_payslip" BOOLEAN,
    "mark_attendance" BOOLEAN,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
