/*
  Warnings:

  - You are about to drop the column `created_at` on the `answers` table. All the data in the column will be lost.
  - You are about to drop the column `is_correct` on the `answers` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `answers` table. All the data in the column will be lost.
  - You are about to drop the column `choices` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `correct_answer` on the `questions` table. All the data in the column will be lost.
  - You are about to alter the column `marks` on the `questions` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the `_AttemptAnswers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `attempts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_answers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `attempt_id` to the `answers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_AttemptAnswers" DROP CONSTRAINT "_AttemptAnswers_A_fkey";

-- DropForeignKey
ALTER TABLE "_AttemptAnswers" DROP CONSTRAINT "_AttemptAnswers_B_fkey";

-- DropForeignKey
ALTER TABLE "attempts" DROP CONSTRAINT "attempts_quiz_id_fkey";

-- DropForeignKey
ALTER TABLE "attempts" DROP CONSTRAINT "attempts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_answers" DROP CONSTRAINT "user_answers_attempt_id_fkey";

-- DropForeignKey
ALTER TABLE "user_answers" DROP CONSTRAINT "user_answers_question_id_fkey";

-- AlterTable
ALTER TABLE "answers" DROP COLUMN "created_at",
DROP COLUMN "is_correct",
DROP COLUMN "updated_at",
ADD COLUMN     "answer_id_choice" INTEGER,
ADD COLUMN     "attempt_id" INTEGER NOT NULL,
ALTER COLUMN "answer_text" DROP NOT NULL;

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "choices",
DROP COLUMN "correct_answer",
ALTER COLUMN "marks" SET DEFAULT 1,
ALTER COLUMN "marks" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "quizzes" ALTER COLUMN "duration" SET DEFAULT 60;

-- DropTable
DROP TABLE "_AttemptAnswers";

-- DropTable
DROP TABLE "attempts";

-- DropTable
DROP TABLE "user_answers";

-- CreateTable
CREATE TABLE "choices" (
    "choice_id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "choice_text" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "choices_pkey" PRIMARY KEY ("choice_id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "attempt_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3),
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("attempt_id")
);

-- AddForeignKey
ALTER TABLE "choices" ADD CONSTRAINT "choices_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("question_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("quiz_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "quiz_attempts"("attempt_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_answer_id_choice_fkey" FOREIGN KEY ("answer_id_choice") REFERENCES "choices"("choice_id") ON DELETE SET NULL ON UPDATE CASCADE;
