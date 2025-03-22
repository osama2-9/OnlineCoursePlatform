-- CreateTable
CREATE TABLE "assignments" (
    "assignment_id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "instructor_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("assignment_id")
);

-- CreateTable
CREATE TABLE "assignment_submissions" (
    "submission_id" SERIAL NOT NULL,
    "assignment_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "file_url" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grade" DOUBLE PRECISION,
    "feedback" TEXT,

    CONSTRAINT "assignment_submissions_pkey" PRIMARY KEY ("submission_id")
);

-- CreateTable
CREATE TABLE "_InstructorAssignments" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_InstructorAssignments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_StudentSubmissions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_StudentSubmissions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_InstructorAssignments_B_index" ON "_InstructorAssignments"("B");

-- CreateIndex
CREATE INDEX "_StudentSubmissions_B_index" ON "_StudentSubmissions"("B");

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("assignment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InstructorAssignments" ADD CONSTRAINT "_InstructorAssignments_A_fkey" FOREIGN KEY ("A") REFERENCES "assignments"("assignment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InstructorAssignments" ADD CONSTRAINT "_InstructorAssignments_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentSubmissions" ADD CONSTRAINT "_StudentSubmissions_A_fkey" FOREIGN KEY ("A") REFERENCES "assignment_submissions"("submission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentSubmissions" ADD CONSTRAINT "_StudentSubmissions_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
