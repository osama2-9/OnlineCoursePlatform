/*
  Warnings:

  - You are about to drop the column `is_approved` on the `articles_approvel` table. All the data in the column will be lost.
  - You are about to drop the column `user_approved_id` on the `articles_approvel` table. All the data in the column will be lost.
  - You are about to drop the column `is_approved` on the `lessons_approvel` table. All the data in the column will be lost.
  - You are about to drop the column `user_approved_id` on the `lessons_approvel` table. All the data in the column will be lost.
  - Added the required column `approved_by` to the `articles_approvel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `approved_by` to the `lessons_approvel` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ApprovelStatus" AS ENUM ('pending', 'approved', 'rejected');

-- DropForeignKey
ALTER TABLE "articles_approvel" DROP CONSTRAINT "articles_approvel_user_approved_id_fkey";

-- DropForeignKey
ALTER TABLE "lessons_approvel" DROP CONSTRAINT "lessons_approvel_user_approved_id_fkey";

-- AlterTable
ALTER TABLE "articles_approvel" DROP COLUMN "is_approved",
DROP COLUMN "user_approved_id",
ADD COLUMN     "approved_by" INTEGER NOT NULL,
ADD COLUMN     "reason" TEXT,
ADD COLUMN     "status" "ApprovelStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "lessons_approvel" DROP COLUMN "is_approved",
DROP COLUMN "user_approved_id",
ADD COLUMN     "approved_by" INTEGER NOT NULL,
ADD COLUMN     "reason" TEXT,
ADD COLUMN     "status" "ApprovelStatus" NOT NULL DEFAULT 'pending';

-- AddForeignKey
ALTER TABLE "lessons_approvel" ADD CONSTRAINT "lessons_approvel_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles_approvel" ADD CONSTRAINT "articles_approvel_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
