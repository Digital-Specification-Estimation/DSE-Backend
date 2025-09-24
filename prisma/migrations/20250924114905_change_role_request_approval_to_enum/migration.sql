/*
  Warnings:

  - The `role_request_approval` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "RoleRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role_request_approval",
ADD COLUMN     "role_request_approval" "RoleRequestStatus" DEFAULT 'PENDING';
