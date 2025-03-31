-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "refresh_token" DROP NOT NULL,
ALTER COLUMN "business_name" DROP NOT NULL,
ALTER COLUMN "notification_sending" DROP NOT NULL,
ALTER COLUMN "send_email_alerts" DROP NOT NULL,
ALTER COLUMN "deadline_notify" DROP NOT NULL;
