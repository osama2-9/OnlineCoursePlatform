export interface Course {
    course_id: number;
    title: string;
    price: number;
    category: string;
    course_img: string;
    is_published: boolean;
    course_type: 'free' | 'paid';
    description: string
    created_at: Date;
    content:string
    learning_outcomes: string[]
    instructor: {
        full_name: string;
        user_id: number;
    };
}
