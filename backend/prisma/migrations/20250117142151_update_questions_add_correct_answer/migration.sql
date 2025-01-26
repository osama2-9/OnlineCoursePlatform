/*
  Warnings:

  - The values [MCQ,TRUE_FALSE,TEXT] on the enum `QuestionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QuestionType_new" AS ENUM ('mcq', 'truefalse', 'text');
ALTER TABLE "questions" ALTER COLUMN "question_type" TYPE "QuestionType_new" USING ("question_type"::text::"QuestionType_new");
ALTER TYPE "QuestionType" RENAME TO "QuestionType_old";
ALTER TYPE "QuestionType_new" RENAME TO "QuestionType";
DROP TYPE "QuestionType_old";
COMMIT;
