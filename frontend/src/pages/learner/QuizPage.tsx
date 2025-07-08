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
  FiHelpCircle,
} from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import axios from "axios";
import { Loader2 } from "lucide-react";

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

      navigate("/learner/dashboard");
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
    if (timeLeft < 60) return "text-red-500";
    if (timeLeft < 300) return "text-amber-500";
    return "text-gray-700";
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercentage = Math.round(
    (answeredCount / pagination.totalQuestions) * 100
  );

  if (isQuestionsLoading) {
    return (<>

      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin text-blue-500" size={24} />
          <p className="mt-2 text-gray-600">Loading questions...</p>
        </div>
      </div>



    </>)
  }

  return (
    <>

      <div className="min-h-screen bg-gray-50">
        <div className="w-full mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 bg-white border-b border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800">{quizTitle}</h1>
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <span className="flex items-center">
                    <FiCheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                    {answeredCount} of {pagination.totalQuestions} questions answered
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-blue-50 px-5 py-3 rounded-lg shadow-sm">
                <FiClock className={`h-5 w-5 ${getTimeColor()}`} />
                <span className={`text-xl font-semibold ${getTimeColor()}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>

          {isQuestionsLoading || submitQuizMutation.isPending ? (
            <div className="flex flex-col items-center justify-center p-16">
              <Loader2 size={30} color="#3B82F6" className="animate-spin" />
              <span className="mt-4 text-gray-600 font-medium">
                {submitQuizMutation.isPending
                  ? "Submitting your answers..."
                  : "Loading questions..."}
              </span>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 p-6">
              <div className="lg:w-1/4 order-2 lg:order-1">
                <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm sticky top-6">
                  <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-2 h-5 bg-blue-500 rounded-sm mr-2"></span>
                    Questions Navigator
                  </h2>
                  <div className="grid grid-cols-5 md:grid-cols-4 lg:grid-cols-3 gap-2">
                    {Array.from({ length: pagination.totalQuestions }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuestionNavigation(i)}
                        className={`relative h-10 w-10 rounded-md flex items-center justify-center text-sm font-medium transition-all duration-200
                          ${currentQuestionIndex === i
                            ? "bg-blue-600 text-white shadow-md"
                            : selectedAnswers[i + 1]
                              ? "bg-blue-50 text-blue-600 border border-blue-200"
                              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                          }`}
                      >
                        {i + 1}
                        {selectedAnswers[i + 1] && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                      <span>Quiz Progress</span>
                      <span className="font-medium">{progressPercentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:w-3/4 order-1 lg:order-2 space-y-8">
                {questions.map((question, index) => (
                  <div
                    id={`question-${question.question_id}`}
                    key={question.question_id}
                    className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-base font-semibold text-blue-600">
                            {index + 1}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div className="prose max-w-none text-gray-800">
                            <ReactMarkdown>
                              {question.question_text}
                            </ReactMarkdown>
                          </div>
                          <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1.5 rounded-full font-medium ml-4 whitespace-nowrap">
                            {question.marks} {question.marks === 1 ? "point" : "points"}
                          </span>
                        </div>

                        {question.question_type === "mcq" && (
                          <div className="space-y-3 mt-5">
                            {question.choices.map((choice) => (
                              <label
                                key={choice.choice_id}
                                className={`flex items-center p-4 rounded-lg cursor-pointer transition-all
                                ${selectedAnswers[question.question_id]
                                    ?.answer_id === choice.choice_id
                                    ? "bg-blue-50 border border-blue-200 shadow-sm"
                                    : "hover:bg-gray-50 border border-gray-100 hover:border-gray-200"
                                  }`}
                              >
                                <div className={`w-5 h-5 flex items-center justify-center rounded-full border ${selectedAnswers[question.question_id]?.answer_id === choice.choice_id
                                  ? "border-blue-500"
                                  : "border-gray-300"
                                  }`}>
                                  {selectedAnswers[question.question_id]?.answer_id === choice.choice_id && (
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                                <input
                                  type="radio"
                                  name={`question-${question.question_id}`}
                                  className="sr-only"
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
                          <div className="grid grid-cols-2 gap-4 mt-5">
                            {["True", "False"].map((option, i) => (
                              <label
                                key={i}
                                className={`flex items-center justify-center p-4 rounded-lg cursor-pointer transition-all
                              ${selectedAnswers[question.question_id]
                                    ?.answer_text === option
                                    ? "bg-blue-50 border border-blue-200 shadow-sm"
                                    : "hover:bg-gray-50 border border-gray-100 hover:border-gray-200"
                                  }`}
                              >
                                <div className={`w-5 h-5 flex items-center justify-center rounded-full border ${selectedAnswers[question.question_id]?.answer_text === option
                                  ? "border-blue-500"
                                  : "border-gray-300"
                                  }`}>
                                  {selectedAnswers[question.question_id]?.answer_text === option && (
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                                <input
                                  type="radio"
                                  name={`question-${question.question_id}`}
                                  className="sr-only"
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
                                <span className="ml-3 text-gray-700 font-medium">
                                  {option}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}

                        {question.question_type === "text" && (
                          <div className="relative mt-5">
                            <textarea
                              className="w-full p-4 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none
                            border border-gray-200 placeholder-gray-400 text-gray-700"
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
                                <div className="absolute bottom-3 right-3 bg-green-50 text-green-600 rounded-full p-1">
                                  <FiCheckCircle className="h-5 w-5" />
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 sticky bottom-0 bg-white p-6 border-t border-gray-100 rounded-lg shadow-lg z-10">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={pagination.currentPage === 1}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                    transition-colors text-sm font-medium 
                    ${pagination.currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"}`}
                  >
                    <FiChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  <div className="flex flex-col sm:flex-row gap-4">
                    {pagination.currentPage < pagination.totalPages && (
                      <button
                        onClick={handleNextQuestion}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg
                    hover:bg-gray-50 transition-colors border border-gray-200 hover:border-gray-300 text-sm font-medium"
                      >
                        Next
                        <FiChevronRight className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      onClick={handleSubmitQuiz}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                      transition-colors shadow-md text-sm font-medium flex items-center justify-center gap-2"
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

          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center text-sm text-gray-500">
            <FiHelpCircle className="h-4 w-4 mr-2" />
            <span>Need help? Use the question navigator to move between questions</span>
          </div>
        </div>
      </div>
    </>
  );
};