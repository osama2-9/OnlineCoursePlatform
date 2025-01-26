export interface QuizDetails {
    quiz: {
        quiz_id: number;
        title: string;
        description: string;
        is_published: boolean;
        max_attempts: number;
        duration: number;
        course_id: number;
    };
    questions: {
        question_id: number;
        quiz_id: number;
        question_text: string;
        question_type: "mcq" | "truefalse" | "text";
        marks: number;
        choices?: {
            choice_id: number;
            choice_text: string;
            is_correct: boolean;
        }[];
    }[];
}