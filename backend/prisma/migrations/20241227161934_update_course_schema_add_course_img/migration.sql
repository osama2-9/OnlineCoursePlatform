/*
  Warnings:

  - Added the required column `course_img` to the `courses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "course_img" TEXT NOT NULL;
