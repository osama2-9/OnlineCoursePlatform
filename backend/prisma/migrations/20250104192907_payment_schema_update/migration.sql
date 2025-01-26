/*
  Warnings:

  - Added the required column `lesson_order` to the `lessons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "lesson_order" INTEGER NOT NULL;
