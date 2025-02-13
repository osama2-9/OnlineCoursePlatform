-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "instructor_applications" (
    "application_id" SERIAL NOT NULL,
    "application_status" "ApplicationStatus" NOT NULL DEFAULT 'pending',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "notes" TEXT,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT,
    "bio" TEXT,
    "profile_picture_url" TEXT,
    "expertise_area" TEXT[],
    "certifications" TEXT[],
    "years_of_experience" INTEGER NOT NULL,
    "education_background" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "previous_courses" TEXT[],
    "teaching_style" TEXT,
    "language_skills" TEXT[],
    "preferred_schedule" TEXT,
    "preferred_course_type" "CourseType",

    CONSTRAINT "instructor_applications_pkey" PRIMARY KEY ("application_id")
);
