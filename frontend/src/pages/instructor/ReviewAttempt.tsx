import axios from "axios";
import toast from "react-hot-toast";
import { useLocation, useParams } from "react-router-dom";
import { API } from "../../API/ApiBaseUrl";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners"; // Loading spinner
import { InstructorLayout } from "../../layouts/InstructorLayout";
import Markdown from "react-markdown";
interface QuizAnswers {
  quiz: {
    quiz_id: number;
    title: string;
  };
  questions: {
    question_id: number;
    question_text: string;
    question_type: string;
    marks: number;
    choices: {
      is_correct: boolean;
      choice_text: string;
      question_id: number;
      choice_id: number;
    }[];
  }[];

  attempt: {
    start_time: Date;
    end_time: Date;
    attempt_id: number;
    score: number;
    quiz_id: number;

    answers: {
      question_id: number;
      answer_id: number;
      answer_text: string;
      answer_id_choice: number | null;
    }[];
  }[];
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalQuestions: number;
    totalPages: number;
  };
}

export const ReviewAttempt = () => {
  const { attemptId } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<QuizAnswers>();
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<{ [key: number]: boolean }>({});
  const [totalScore, setTotalScore] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 5,
    totalQuestions: 0,
    totalAnswers: 0,
    totalPages: 0,
  });
  const questionsPerPage = 5;

  const [cachedPages, setCachedPages] = useState<{
    [key: number]: QuizAnswers;
  }>({});

  const getUsersAnswers = async (page: number) => {
    try {
      setLoading(true);

      if (cachedPages[page]) {
        setQuiz(cachedPages[page]);
        return;
      }

      const res = await axios.get(
        `${API}/instructor/get-user-answers/${attemptId}/quiz/${state.quizId}/course/${state.courseId}/ins/${user?.userId}`,
        {
          params: {
            page,
            limit: questionsPerPage,
          },
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const data = res.data;

      if (data) {
        setQuiz(data.data.quiz);
        setPagination(data.pagination);

        setCachedPages((prev) => ({
          ...prev,
          [page]: data.data.quiz,
        }));
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (
    questionId: number,
    isCorrect: boolean,
    marks: number
  ) => {
    setScores((prev) => ({ ...prev, [questionId]: isCorrect }));
    if (isCorrect) {
      setTotalScore((prev) => prev + marks);
    } else {
      setTotalScore((prev) => prev - marks);
    }
  };

  const submitScores = async () => {
    try {
      await axios.post(
        `${API}/instructor/update-scores`,
        { scores, attemptId },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      toast.success("Scores updated successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error || "Failed to update scores");
    }
  };

  const handleNextPage = () => {
    setPagination((prev) => ({
      ...prev,
      currentPage: prev.currentPage + 1,
    }));
  };

  const handlePrevPage = () => {
    setPagination((prev) => ({
      ...prev,
      currentPage: prev.currentPage - 1,
    }));
  };

  useEffect(() => {
    if (pagination?.currentPage) {
      getUsersAnswers(pagination.currentPage);
    }
  }, [pagination?.currentPage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <BeatLoader color="#3B82F6" size={15} />
      </div>
    );
  }

  return (
    <InstructorLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">{quiz?.quiz?.title}</h1>
          <div className="space-y-6">
            {quiz?.questions.map((question) => {
              const userAnswer = quiz.attempt[0].answers.find(
                (answer) => answer.question_id === question.question_id
              );
              const correctChoice = question.choices.find(
                (choice) => choice.is_correct
              );

              return (
                <div
                  key={question.question_id}
                  className="border p-4 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">
                      <Markdown>{question.question_text}</Markdown>
                    </h2>
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        handleCheckboxChange(
                          question.question_id,
                          e.target.checked,
                          question.marks
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    {question.choices.map((choice) => (
                      <div
                        key={choice.choice_id}
                        className={`p-2 rounded ${
                          choice.is_correct ? "bg-green-100" : "bg-gray-100"
                        }`}
                      >
                        {choice.choice_text}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      <strong>User's Answer:</strong>{" "}
                      <Markdown>
                        {userAnswer?.answer_text || "No answer provided"}
                      </Markdown>
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Correct Answer:</strong>{" "}
                      {correctChoice?.choice_text || "No correct answer"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex justify-between items-center">
            <div className="text-lg font-semibold">
              Total Score: {totalScore}
            </div>
            <button
              onClick={submitScores}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Submit Scores
            </button>
          </div>
          <div className="mt-4 flex justify-between items-center">
            {/* Pagination Information */}
            <div className="text-gray-600 text-sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            {/* Pagination Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={pagination.currentPage === 1}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
};
