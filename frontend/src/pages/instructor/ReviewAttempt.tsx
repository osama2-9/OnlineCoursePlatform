import { useLocation, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import { useEffect, useState } from "react";
import { InstructorLayout } from "../../layouts/InstructorLayout";
import { FaCheck, FaTimes, FaArrowLeft, FaArrowRight } from "react-icons/fa"; // Import icons from react-icons
import ReactMarkdown from "react-markdown";
import { BeatLoader } from "react-spinners"; // Import BeatLoader from react-spinners

interface Choice {
  choice_id: number;
  question_id: number;
  choice_text: string;
  is_correct: boolean;
}

interface Question {
  question_id: number;
  question_text: string;
  question_type: "mcq" | "truefalse" | "text";
  marks: number;
  choices: Choice[];
  answer_id: number | null;
  answer_text: string | null;
}

interface Quiz {
  quiz_id: number;
  title: string;
  questions: Question[];
}

interface UserAnswersResponse {
  data: {
    quiz: Quiz;
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
  const { state } = useLocation();
  const { attemptId } = useParams();
  const { user } = useAuth();
  const { quizId, courseId } = state;
  const [scores, setScores] = useState<{ [key: number]: number }>({});
  const [data, setData] = useState<UserAnswersResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false); // Loading state for pagination

  useEffect(() => {
    const fetchUserAnswers = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(
          `${API}/instructor/get-user-answers/${attemptId}/quiz/${quizId}/course/${courseId}/ins/${user?.userId}`,
          {
            params: { page: currentPage },
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        setData(res.data);
      } catch (error: any) {
        console.log(error);
        setIsError(true);
        toast.error(error?.response?.data?.error || "Failed to fetch data");
      } finally {
        setIsLoading(false); // Hide loading spinner after fetching data
      }
    };

    if (attemptId && quizId && courseId && user?.userId) {
      fetchUserAnswers();
    }
  }, [attemptId, quizId, courseId, user?.userId, currentPage]);

  const handleCheckboxChange = (questionId: number, marks: number) => {
    setScores((prev) => {
      const newScores = { ...prev };
      if (newScores[questionId]) {
        delete newScores[questionId];
        setTotalScore((prevTotal) => prevTotal - marks);
      } else {
        newScores[questionId] = marks;
        setTotalScore((prevTotal) => prevTotal + marks);
      }
      return newScores;
    });
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
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to update scores");
    }
  };

  const handlePageChange = async (newPage: number) => {
    setIsPageLoading(true); // Show loading spinner while changing pages
    setCurrentPage(newPage);
    setIsPageLoading(false); // Hide loading spinner after changing pages
  };

  if (isLoading) {
    return (
      <InstructorLayout>
        <div className="flex justify-center items-center h-screen">
          <BeatLoader color="#3B82F6" size={15} /> {/* Loading spinner */}
        </div>
      </InstructorLayout>
    );
  }

  if (isError) {
    return (
      <InstructorLayout>
        <div className="text-center text-red-600 py-10">
          Error fetching data. Please try again later.
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="p-5 max-w-7xl mx-auto">
        {/* Header with improved styling */}
        <div className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Review Quiz Attempt
          </h1>
          <p className="text-gray-600 mt-2">Quiz: {data?.data.quiz.title}</p>
        </div>

        {/* Questions List with improved styling */}
        <div className="space-y-8">
          {data?.data.quiz.questions.map((question) => {
            const correctAnswer = question.choices.find(
              (choice) => choice.is_correct
            )?.choice_text;
            const isCorrect = question.answer_text === correctAnswer;

            return (
              <div
                key={question.question_id}
                className="bg-white p-8 rounded-xl shadow-md border border-gray-200 transition-all hover:shadow-lg"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                        Question {question.question_id}
                      </span>
                      {question.question_type !== "text" && (
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2
                            ${
                              isCorrect
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                        >
                          {isCorrect ? <FaCheck /> : <FaTimes />}
                          {isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      )}
                    </div>
                    <p className="text-xl font-semibold text-gray-800 mb-6">
                      <ReactMarkdown>{question.question_text}</ReactMarkdown>
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4 text-gray-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-600">
                        Correct Answer
                      </p>
                      <p className="mt-1">
                        {correctAnswer || "No correct answer"}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-600">User Answer</p>
                      <p className="mt-1">
                        {question.answer_text || "No answer provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scoring section with improved styling */}
                <div className="mt-6 flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!scores[question.question_id]}
                        onChange={() =>
                          handleCheckboxChange(
                            question.question_id,
                            question.marks
                          )
                        }
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Award marks
                      </span>
                    </label>
                    <span className="text-sm font-medium text-blue-600">
                      ({question.marks} points)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination with improved styling */}
        <div className="mt-10 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50 disabled:hover:bg-blue-50 transition-colors"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isPageLoading}
          >
            {isPageLoading ? (
              <BeatLoader color="#2563eb" size={8} />
            ) : (
              <>
                <FaArrowLeft />
                <span>Previous</span>
              </>
            )}
          </button>
          <span className="font-medium text-gray-700">
            Page {currentPage} of {data?.pagination.totalPages}
          </span>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50 disabled:hover:bg-blue-50 transition-colors"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={
              currentPage === data?.pagination.totalPages || isPageLoading
            }
          >
            {isPageLoading ? (
              <BeatLoader color="#2563eb" size={8} />
            ) : (
              <>
                <span>Next</span>
                <FaArrowRight />
              </>
            )}
          </button>
        </div>

        {/* Total Score and Submit Button with improved styling */}
        <div className="mt-8 p-6 bg-white rounded-xl shadow-md flex justify-between items-center sticky bottom-5 border border-gray-200">
          <div className="text-xl font-semibold text-gray-800">
            Total Score: <span className="text-blue-600">{totalScore / 2}</span>
          </div>
          <button
            onClick={submitScores}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            Submit Scores
            <FaCheck className="text-sm" />
          </button>
        </div>
      </div>
    </InstructorLayout>
  );
};
