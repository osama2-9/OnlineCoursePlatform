import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../../API/ApiBaseUrl";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
} from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import axios from "axios";

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

export const QuizPage = () => {
  const { attemptId, quizId, courseId, enrollmentId } = useParams();
  const [questions, setQuestions] = useState<
    QuizPageInterface["quiz"]["questions"]
  >([]);
  const questionsRef = useRef(questions);
  const [quizTitle, setQuizTitle] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalQuestions: 0,
    questionsPerPage: 5,
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizDuration, setQuizDuration] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, { answer_id?: number; answer_text?: string }>
  >({});
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    document.body.style.userSelect = "none";
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.body.style.userSelect = "auto";
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  const fetchQuestions = async (page = 1) => {
    if (!quizId || !courseId || !user?.userId || !attemptId || !enrollmentId) {
      throw new Error("Missing required parameters");
    }

    const res = await axios.get(
      `${API}/learner/quiz/${quizId}/c/${courseId}/u/${user.userId}/attempt/${attemptId}/e/${enrollmentId}`,
      {
        params: { page },
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    return res.data;
  };

  const getQueryKey = (page: number) => [
    "quiz",
    quizId,
    courseId,
    user?.userId,
    attemptId,
    page,
  ];

  const { data, isLoading: isQuestionsLoading } = useQuery({
    queryKey: getQueryKey(pagination.currentPage),
    queryFn: () => fetchQuestions(pagination.currentPage),
    enabled: !!quizId && !!courseId && !!user?.userId && !!attemptId,
    staleTime: 12 * 60 * 1000,
  });

  useEffect(() => {
    if (
      !quizId ||
      !courseId ||
      !user?.userId ||
      !attemptId ||
      !pagination.totalPages
    )
      return;

    if (pagination.currentPage < pagination.totalPages) {
      const nextPage = pagination.currentPage + 1;
      queryClient.prefetchQuery({
        queryKey: getQueryKey(nextPage),
        queryFn: () => fetchQuestions(nextPage),
        staleTime: 5 * 60 * 1000,
      });
    }

    if (pagination.currentPage > 1) {
      const prevPage = pagination.currentPage - 1;
      queryClient.prefetchQuery({
        queryKey: getQueryKey(prevPage),
        queryFn: () => fetchQuestions(prevPage),
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [
    pagination.currentPage,
    pagination.totalPages,
    queryClient,
    quizId,
    courseId,
    user?.userId,
    attemptId,
  ]);

  useEffect(() => {
    if (data?.quiz) {
      setQuestions(data.quiz.questions);
      setPagination(data.quiz.pagination);
      setQuizDuration(data.quiz.duration);
      setQuizTitle(data.quiz.title);

      if (data.quiz.pagination.totalPages > data.quiz.pagination.currentPage) {
        const nextPage = data.quiz.pagination.currentPage + 1;
        queryClient.prefetchQuery({
          queryKey: getQueryKey(nextPage),
          queryFn: () => fetchQuestions(nextPage),
          staleTime: 5 * 60 * 1000,
        });

        if (data.quiz.pagination.totalPages > nextPage) {
          queryClient.prefetchQuery({
            queryKey: getQueryKey(nextPage + 1),
            queryFn: () => fetchQuestions(nextPage + 1),
            staleTime: 5 * 60 * 1000,
          });
        }
      }
    }
  }, [data, queryClient]);

  const submitQuizMutation = useMutation({
    mutationFn: async () => {
      const userAnswers = Object.entries(selectedAnswers).map(
        ([questionId, answerData]) => {
          const question = questions.find(
            (q) => q.question_id === parseInt(questionId)
          );

          if (question?.question_type === "mcq") {
            return {
              question_id: parseInt(questionId),
              answer_id: answerData.answer_id,
              answer_text: answerData?.answer_text,
            };
          } else if (question?.question_type === "truefalse") {
            const choice = question.choices.find(
              (c) =>
                c.choice_text.toLowerCase() ===
                answerData.answer_text?.toLowerCase()
            );
            return {
              question_id: parseInt(questionId),
              answer_id: choice?.choice_id,
              answer_text: answerData.answer_text,
            };
          } else {
            return {
              question_id: parseInt(questionId),
              answer_id: null,
              answer_text: answerData.answer_text,
            };
          }
        }
      );

      return axios.post(
        `${API}/learner/submit-quiz`,
        {
          attemptId: attemptId,
          userAnswers: userAnswers,
          end_time: new Date().toISOString(),
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          timeout: 500000,
        }
      );
    },
    onSuccess: () => {
      toast.success("Quiz submitted successfully!");
      localStorage.setItem(`quizSubmitted_${attemptId}`, "true");
      localStorage.removeItem(`quizTimeLeft_${attemptId}`);

      queryClient.removeQueries({ queryKey: ["quiz", quizId] });

      navigate("/quiz-completed");
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error?.response?.data?.error || "Failed to submit quiz.");
    },
  });

  useEffect(() => {
    if (isQuestionsLoading) return;
    const storedTimeLeft = localStorage.getItem(`quizTimeLeft_${attemptId}`);
    const initialTime = storedTimeLeft
      ? parseInt(storedTimeLeft, 10)
      : quizDuration * 60;
    setTimeLeft(initialTime);
  }, [attemptId, quizDuration, isQuestionsLoading]);

  useEffect(() => {
    if (isQuestionsLoading || timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(timer);
          submitQuizMutation.mutate();
          return 0;
        }
        localStorage.setItem(`quizTimeLeft_${attemptId}`, newTime.toString());
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isQuestionsLoading, attemptId]);

  const handleQuestionNavigation = async (index: number) => {
    const page = Math.floor(index / pagination.questionsPerPage) + 1;

    if (page !== pagination.currentPage) {
      setPagination((prev) => ({ ...prev, currentPage: page }));

      await queryClient.ensureQueryData({
        queryKey: getQueryKey(page),
        queryFn: () => fetchQuestions(page),
      });
    }

    setCurrentQuestionIndex(index);

    const localIndex = index % pagination.questionsPerPage;
    const question = questionsRef.current[localIndex];
    if (question) {
      setTimeout(() => {
        const element = document.getElementById(
          `question-${question.question_id}`
        );
        element?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  };

  const handleAnswerSelect = (
    questionId: number,
    choiceId?: number,
    answerText?: string
  ) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: {
        answer_id: choiceId,
        answer_text: answerText,
      },
    }));
  };

  const handleNextQuestion = async () => {
    if (pagination.currentPage < pagination.totalPages) {
      const nextPage = pagination.currentPage + 1;
      setPagination((prev) => ({ ...prev, currentPage: nextPage }));
      setCurrentQuestionIndex((prev) => prev + pagination.questionsPerPage);

      await queryClient.ensureQueryData({
        queryKey: getQueryKey(nextPage),
        queryFn: () => fetchQuestions(nextPage),
      });

      if (nextPage < pagination.totalPages) {
        queryClient.prefetchQuery({
          queryKey: getQueryKey(nextPage + 1),
          queryFn: () => fetchQuestions(nextPage + 1),
          staleTime: 5 * 60 * 1000,
        });
      }
    }
  };

  const handlePreviousQuestion = async () => {
    if (pagination.currentPage > 1) {
      const prevPage = pagination.currentPage - 1;
      setPagination((prev) => ({ ...prev, currentPage: prevPage }));
      setCurrentQuestionIndex((prev) => prev - pagination.questionsPerPage);

      await queryClient.ensureQueryData({
        queryKey: getQueryKey(prevPage),
        queryFn: () => fetchQuestions(prevPage),
      });

      if (prevPage > 1) {
        queryClient.prefetchQuery({
          queryKey: getQueryKey(prevPage - 1),
          queryFn: () => fetchQuestions(prevPage - 1),
          staleTime: 5 * 60 * 1000,
        });
      }
    }
  };

  const handleSubmitQuiz = () => {
    submitQuizMutation.mutate();
  };

  useEffect(() => {
    const quizSubmitted = localStorage.getItem(`quizSubmitted_${attemptId}`);
    if (quizSubmitted === "true") {
      toast.error("You've already submitted this quiz.");
      navigate("/quiz-completed");
    }
  }, [attemptId, navigate]);

  if (!attemptId || !quizId || !courseId || timeLeft === null) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    if (timeLeft < 60) return "text-red-600";
    if (timeLeft < 300) return "text-amber-600";
    return "text-gray-700";
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercentage = Math.round(
    (answeredCount / pagination.totalQuestions) * 100
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="p-4 md:p-6 bg-gray-100 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                {quizTitle}
              </h1>
              <div className="mt-2 text-sm text-gray-600">
                <span>
                  {answeredCount} of {pagination.totalQuestions} questions
                  answered
                </span>
                <div className="w-full h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-200 px-4 py-2 rounded-md">
              <FiClock className={`h-5 w-5 ${getTimeColor()}`} />
              <span className={`text-lg font-medium ${getTimeColor()}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {isQuestionsLoading || submitQuizMutation.isPending ? (
          <div className="flex items-center justify-center p-12">
            <ClipLoader size={40} color="#4B5563" />
            <span className="ml-3 text-gray-600">
              {submitQuizMutation.isPending
                ? "Submitting your answers..."
                : "Loading questions..."}
            </span>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row p-4 md:p-6 gap-6">
            <div className="lg:w-1/4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 sticky top-6">
                <h2 className="text-sm font-medium text-gray-700 mb-3">
                  Questions ({pagination.totalQuestions})
                </h2>
                <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                  {Array.from({ length: pagination.totalQuestions }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuestionNavigation(i)}
                      className={`relative h-8 rounded-md flex items-center justify-center text-sm transition-colors
                          ${
                            currentQuestionIndex === i
                              ? "bg-blue-600 text-white"
                              : selectedAnswers[i + 1]
                              ? "bg-blue-100 text-blue-700 border border-blue-300"
                              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-300"
                          }`}
                    >
                      {i + 1}
                      {selectedAnswers[i + 1] && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:w-3/4 space-y-6">
              {questions.map((question, index) => (
                <div
                  id={`question-${question.question_id}`}
                  key={question.question_id}
                  className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-800">
                          {currentQuestionIndex + index + 1}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div className="prose max-w-none text-gray-800">
                          <ReactMarkdown>
                            {question.question_text}
                          </ReactMarkdown>
                        </div>
                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md font-medium">
                          {question.marks}{" "}
                          {question.marks === 1 ? "point" : "points"}
                        </span>
                      </div>

                      {question.question_type === "mcq" && (
                        <div className="space-y-2 mt-4">
                          {question.choices.map((choice) => (
                            <label
                              key={choice.choice_id}
                              className={`flex items-center p-3 rounded-md cursor-pointer transition-all
                              ${
                                selectedAnswers[question.question_id]
                                  ?.answer_id === choice.choice_id
                                  ? "bg-blue-50 border border-blue-300 shadow-sm"
                                  : "hover:bg-gray-50 border border-gray-200"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${question.question_id}`}
                                className="form-radio h-4 w-4 text-blue-600 border-gray-400 focus:ring-blue-500"
                                checked={
                                  selectedAnswers[question.question_id]
                                    ?.answer_id === choice.choice_id
                                }
                                onChange={() =>
                                  handleAnswerSelect(
                                    question.question_id,
                                    choice.choice_id,
                                    choice.choice_text
                                  )
                                }
                              />
                              <span className="ml-3 text-gray-700">
                                {choice.choice_text}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {question.question_type === "truefalse" && (
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          {["True", "False"].map((option, i) => (
                            <label
                              key={i}
                              className={`flex items-center justify-center p-3 rounded-md cursor-pointer transition-all
                              ${
                                selectedAnswers[question.question_id]
                                  ?.answer_text === option
                                  ? "bg-blue-50 border border-blue-300 shadow-sm"
                                  : "hover:bg-gray-50 border border-gray-200"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${question.question_id}`}
                                className="form-radio h-4 w-4 text-blue-600 border-gray-400 focus:ring-blue-500"
                                checked={
                                  selectedAnswers[question.question_id]
                                    ?.answer_text === option
                                }
                                onChange={() =>
                                  handleAnswerSelect(
                                    question.question_id,
                                    i,
                                    option
                                  )
                                }
                              />
                              <span className="ml-2 text-gray-700 font-medium">
                                {option}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {question.question_type === "text" && (
                        <div className="relative mt-4">
                          <textarea
                            className="w-full p-3 bg-gray-50 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none
                              border border-gray-300 placeholder-gray-400 text-gray-700"
                            rows={4}
                            placeholder="Type your answer here..."
                            value={
                              selectedAnswers[question.question_id]
                                ?.answer_text || ""
                            }
                            onChange={(e) =>
                              handleAnswerSelect(
                                question.question_id,
                                undefined,
                                e.target.value
                              )
                            }
                          />
                          {selectedAnswers[question.question_id]
                            ?.answer_text && (
                            <FiCheckCircle className="absolute bottom-3 right-3 h-5 w-5 text-green-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6 sticky bottom-0 bg-white p-4 border-t border-gray-200 rounded-b-lg shadow-md">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={pagination.currentPage === 1}
                  className="flex items-center gap-2 px-5 py-2 bg-white text-gray-700 rounded-md
                    disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors
                    border border-gray-300 text-sm font-medium"
                >
                  <FiChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <div className="flex flex-col sm:flex-row gap-3">
                  {pagination.currentPage < pagination.totalPages && (
                    <button
                      onClick={handleNextQuestion}
                      className="flex items-center gap-2 px-5 py-2 bg-white text-gray-700 rounded-md
                        hover:bg-gray-50 transition-colors border border-gray-300 text-sm font-medium"
                    >
                      Next
                      <FiChevronRight className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    onClick={handleSubmitQuiz}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                      transition-colors shadow-sm text-sm font-medium flex items-center justify-center gap-2"
                    disabled={submitQuizMutation.isPending}
                  >
                    {submitQuizMutation.isPending ? (
                      <>
                        <ClipLoader size={18} color="#FFFFFF" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="h-4 w-4" />
                        Submit Quiz
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
