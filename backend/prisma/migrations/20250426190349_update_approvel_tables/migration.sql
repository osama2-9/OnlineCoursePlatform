-- DropForeignKey
ALTER TABLE "articles_approvel" DROP CONSTRAINT "articles_approvel_approved_by_fkey";

-- DropForeignKey
ALTER TABLE "lessons_approvel" DROP CONSTRAINT "lessons_approvel_approved_by_fkey";

-- AlterTable
ALTER TABLE "articles_approvel" ALTER COLUMN "apporval_date" DROP NOT NULL,
ALTER COLUMN "apporval_date" DROP DEFAULT,
ALTER COLUMN "approved_by" DROP NOT NULL;

-- AlterTable
ALTER TABLE "lessons_approvel" ALTER COLUMN "apporval_date" DROP NOT NULL,
ALTER COLUMN "apporval_date" DROP DEFAULT,
ALTER COLUMN "approved_by" DROP NOT NULL;
