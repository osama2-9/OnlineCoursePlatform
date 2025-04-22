-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ASSIGNMENT_NEW', 'ASSIGNMENT_DEADLINE', 'QUIZ_NEW', 'QUIZ_ENDING');

-- CreateTable
CREATE TABLE "notifications" (
    "notification_id" SERIAL NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "type" "NotificationType" NOT NULL,
    "course_with_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id")
);

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_course_with_id_fkey" FOREIGN KEY ("course_with_id") REFERENCES "courses"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;
