import toast from "react-hot-toast";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { InstructorLayout } from "../../layouts/InstructorLayout";
import Markdown from "react-markdown";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../API/axios";

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

interface AttemptResponse {
  data: {
    quiz: any;
  };
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalQuestions: number;
    totalAnswers: number;
    totalPages: number;
  };
}

export const ReviewAttempt = () => {
  const { attemptId } = useParams();
  const { state } = useLocation();
  const [quiz, setQuiz] = useState<QuizAnswers>();
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<{ [key: number]: boolean }>({});
  const [totalScore, setTotalScore] = useState(0);
  const [pagination, setPagination] = useState<AttemptResponse["pagination"]>({
    currentPage: 1,
    itemsPerPage: 0,
    totalQuestions: 0,
    totalAnswers: 0,
    totalPages: 0,
  });
  const questionsPerPage = 5;

  const getUsersAnswers = async (page: number) => {
    try {
      setLoading(true);
      const res = await axiosClient.get<AttemptResponse>(
        `/instructor/get-user-answers/${attemptId}/quiz/${state.quizId}/course/${state.courseId}`,
        {
          params: {
            page,
            limit: questionsPerPage,
          },
         
        }
      );
      const data = res.data;
      return data;
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const { data } = useQuery({
    queryKey: [
      "attempt",
      pagination.currentPage,
      pagination.totalPages,
      attemptId,
    ],
    queryFn: () => getUsersAnswers(pagination.currentPage),
    staleTime: 15 * 1000 * 60,
    refetchInterval: 15 * 1000 * 60,
    retry: 2,
  });

  useEffect(() => {
    if (data) {
      setQuiz(data.data.quiz);
      setPagination(data.pagination);
    }
  }, [data]);

  const handleCheckboxChange = (
    questionId: number,
    isCorrect: boolean,
    marks: number
  ) => {
    setScores((prev) => {
      const prevScore = prev[questionId] || false;
      const newScores = { ...prev, [questionId]: isCorrect };

      // Update total score
      if (isCorrect && !prevScore) {
        setTotalScore((prevTotal) => prevTotal + marks);
      } else if (!isCorrect && prevScore) {
        setTotalScore((prevTotal) => prevTotal - marks);
      }

      return newScores;
    });
  };

  const submitScores = async () => {
    try {
      await axiosClient.post(
        `/instructor/update-scores`,
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={25} />
      </div>
    );
  }

  return (
    <InstructorLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {quiz?.quiz?.title}
            </h1>
            <div className="flex items-center text-gray-600">
              <span className="mr-4">
                Total Questions: {quiz?.questions?.length || 0}
              </span>
              <span>Total Score: {totalScore}</span>
            </div>
          </div>

          {/* Questions Section */}
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
                  className="bg-white p-6 rounded-lg shadow-md transition-all hover:shadow-lg"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        <Markdown>{question.question_text}</Markdown>
                      </h2>
                      <span className="text-sm text-blue-600 font-medium">
                        Marks: {question.marks}
                      </span>
                    </div>
                    <div className="ml-4">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          onChange={(e) =>
                            handleCheckboxChange(
                              question.question_id,
                              e.target.checked,
                              question.marks
                            )
                          }
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Correct
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Choices Section */}
                  <div className="space-y-2 mb-6">
                    {question.choices.map((choice) => (
                      <div
                        key={choice.choice_id}
                        className={`p-3 rounded-lg border ${
                          choice.is_correct
                            ? "bg-green-50 border-green-200 text-green-800"
                            : "bg-gray-50 border-gray-200 text-gray-700"
                        }`}
                      >
                        {choice.choice_text}
                      </div>
                    ))}
                  </div>

                  {/* Answer Section */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700">
                        User's Answer:
                      </span>
                      <div className="mt-1 text-gray-600">
                        <Markdown>
                          {userAnswer?.answer_text || "No answer provided"}
                        </Markdown>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700">
                        Correct Answer:
                      </span>
                      <div className="mt-1 text-gray-600">
                        {correctChoice?.choice_text || "No correct answer"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Section */}
          <div className="sticky bottom-0 bg-white p-4 rounded-lg shadow-lg mt-6 border-t">
            <div className="flex justify-between items-center max-w-5xl mx-auto">
              <div className="flex items-center space-x-4">
                <span className="text-lg font-semibold text-gray-800">
                  Total Score: {totalScore}
                </span>
                <span className="text-sm text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={pagination.currentPage >= pagination.totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <button
                  onClick={submitScores}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Submit Scores
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
};
