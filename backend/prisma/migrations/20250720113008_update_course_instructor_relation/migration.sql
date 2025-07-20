-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_instructor_id_fkey";

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
