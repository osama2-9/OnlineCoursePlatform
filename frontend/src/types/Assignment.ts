interface Instructor {
    full_name: string;
    user_id: number;
}

interface Course {
    course_id: number;
    title: string;
}

interface Pagination {
    total: number;
    limit: number;
    currentPage: number;
    totalPages: number;
}

interface Assignment {
    assignment_id: number;
    course_id: number;
    instructor_id: number;
    title: string;
    description: string;
    start_date: Date;
    end_date: Date;
    points: number;
    created_at: Date;
    updated_at: Date;
    instructor: Instructor;
    course: Course;
    _count: {
        submissions: number;
    };
    submissions: number;  
    total_students: number;
}

export type { Assignment, Pagination };