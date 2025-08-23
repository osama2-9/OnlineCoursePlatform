export interface Course {
    course_id: number;
    title: string;
    price: number;
    category: string;
    course_img: string;
    is_published: boolean;
    course_type: 'free' | 'paid';
    description: string
    start_date: Date;
    end_date: Date;
    created_at: Date;
    content: string
    required_marks: number | null

    learning_outcomes: string[]
    instructor: {
        full_name: string;
        user_id: number;
    };
}
