-- AlterTable
ALTER TABLE "assignments" ADD COLUMN     "publish_marks" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "required_marks" INTEGER;

-- AlterTable
ALTER TABLE "enrollments" ADD COLUMN     "is_eligible_for_certificate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "total_score" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "publish_marks" BOOLEAN NOT NULL DEFAULT false;
