
interface QuizPageInterface {
    quiz: {
      quiz_id: number;
      course_id: number;
      title: string;
      description: string;
      created_at: string;
      updated_at: string;
      duration: number;
      max_attempts: number;
      is_published: boolean;
      remainingTime?: number;
      questions: Array<{
        question_text: string;
        question_type: string;
        marks: number;
        question_id: number;
        choices: {
          choice_id: number;
          choice_text: string;
          is_correct: boolean;
        }[];
      }>;
      pagination: {
        currentPage: number;
        totalPages: number;
        totalQuestions: number;
        questionsPerPage: number;
      };
    };
  }

  export type {QuizPageInterface}