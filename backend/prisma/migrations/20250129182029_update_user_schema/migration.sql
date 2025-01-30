-- AlterTable
ALTER TABLE "users" ADD COLUMN     "activeAccountToken" TEXT,
ADD COLUMN     "activeAccountTokenExpiresAt" TIMESTAMP(3);
