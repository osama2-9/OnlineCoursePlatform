/*
  Warnings:

  - Added the required column `end_time` to the `attempts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `attempts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `quizzes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "attempts" ADD COLUMN     "end_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "start_time" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "duration" INTEGER NOT NULL;
