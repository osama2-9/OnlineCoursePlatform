-- DropForeignKey
ALTER TABLE "articles_approvel" DROP CONSTRAINT "articles_approvel_article_id_fkey";

-- DropForeignKey
ALTER TABLE "lessons_approvel" DROP CONSTRAINT "lessons_approvel_lesson_id_fkey";

-- AddForeignKey
ALTER TABLE "lessons_approvel" ADD CONSTRAINT "lessons_approvel_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("lesson_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles_approvel" ADD CONSTRAINT "articles_approvel_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("article_id") ON DELETE CASCADE ON UPDATE CASCADE;
