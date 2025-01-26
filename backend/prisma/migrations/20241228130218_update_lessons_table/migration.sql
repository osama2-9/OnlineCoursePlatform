/*
  Warnings:

  - Made the column `content` on table `lessons` required. This step will fail if there are existing NULL values in that column.
  - Made the column `video_url` on table `lessons` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `lessons` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "attachment" TEXT,
ALTER COLUMN "content" SET NOT NULL,
ALTER COLUMN "video_url" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL;
