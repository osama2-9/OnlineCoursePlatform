-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'moderator';

-- CreateTable
CREATE TABLE "lessons_approvel" (
    "lessoon_approvel_id" SERIAL NOT NULL,
    "lesson_id" INTEGER NOT NULL,
    "user_approved_id" INTEGER NOT NULL,
    "apporval_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "lessons_approvel_pkey" PRIMARY KEY ("lessoon_approvel_id")
);

-- CreateTable
CREATE TABLE "articles_approvel" (
    "article_approvel_id" SERIAL NOT NULL,
    "article_id" INTEGER NOT NULL,
    "user_approved_id" INTEGER NOT NULL,
    "apporval_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "articles_approvel_pkey" PRIMARY KEY ("article_approvel_id")
);

-- AddForeignKey
ALTER TABLE "lessons_approvel" ADD CONSTRAINT "lessons_approvel_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("lesson_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons_approvel" ADD CONSTRAINT "lessons_approvel_user_approved_id_fkey" FOREIGN KEY ("user_approved_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles_approvel" ADD CONSTRAINT "articles_approvel_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("article_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles_approvel" ADD CONSTRAINT "articles_approvel_user_approved_id_fkey" FOREIGN KEY ("user_approved_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
