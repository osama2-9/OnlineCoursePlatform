-- AlterTable
ALTER TABLE "users" ADD COLUMN     "backup_codes" TEXT[],
ADD COLUMN     "is_2fa_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "two_fa_secret" TEXT;
