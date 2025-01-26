/*
  Warnings:

  - You are about to drop the column `resetPasswordTokenExpirsAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `_UserQuizzes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_UserQuizzes" DROP CONSTRAINT "_UserQuizzes_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserQuizzes" DROP CONSTRAINT "_UserQuizzes_B_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "resetPasswordTokenExpirsAt",
ADD COLUMN     "resetPasswordTokenExpiresAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "_UserQuizzes";

-- CreateTable
CREATE TABLE "user_answers" (
    "user_answer_id" SERIAL NOT NULL,
    "attempt_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "answer_id" INTEGER,
    "answer_text" TEXT,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_answers_pkey" PRIMARY KEY ("user_answer_id")
);

-- AddForeignKey
ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "attempts"("attempt_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("question_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "answers"("answer_id") ON DELETE SET NULL ON UPDATE CASCADE;
