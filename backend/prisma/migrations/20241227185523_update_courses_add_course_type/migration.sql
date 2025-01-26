-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('free', 'paid');

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "course_type" "CourseType";
