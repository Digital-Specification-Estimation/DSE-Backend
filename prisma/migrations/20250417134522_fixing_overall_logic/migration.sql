-- AlterTable
ALTER TABLE "User" ADD COLUMN     "current_role" TEXT;

-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN     "role" TEXT;
