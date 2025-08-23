interface QuizAttempt {
    attempt_id: number;
    quiz_id: number;
    quiz_title: string;
    score: number;
    start_time: string;
    end_time: string;
}

interface ProgressDetail {
    course_id: number;
    progress: number;
    is_completed: boolean;
    last_accessed: string;
}

interface Enrollment {
    enrollment_date: string;
    status: 'active' | 'completed' | 'dropped';
    total_score: number;
    is_eligible_for_certificate: boolean;
    access_granted: boolean;
    course_title: string;
}

interface StudentProgress {
    user_id: number;
    full_name: string;
    email: string;
    is_active: boolean;
    isEmailVerified: boolean;
    lastLogin: string;
    enrollment: Enrollment;
    progress: string;
    progress_details: ProgressDetail[];
    avg_quiz_score: string;
    quiz_attempts: QuizAttempt[];
}

interface CourseWithStudents {
    course_id: number;
    course_title: string;
    students: StudentProgress[];
}

interface Pagination {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

export type { StudentProgress, CourseWithStudents, Pagination };
