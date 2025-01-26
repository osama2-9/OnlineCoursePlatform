/*
  Warnings:

  - You are about to drop the column `duration` on the `lessons` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "category" TEXT;

-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "duration",
ADD COLUMN     "description" TEXT;
