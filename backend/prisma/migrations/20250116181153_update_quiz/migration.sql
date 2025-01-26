-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "marks" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "max_attempts" INTEGER NOT NULL DEFAULT 1;
