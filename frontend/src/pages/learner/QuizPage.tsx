import { FiHelpCircle } from "react-icons/fi";
import { QuizControls } from "../../components/learnre/Quiz/QuizControls";
import { useEffect, useRef, useState } from "react";
import { QuizPageInterface } from "../../types/Quiz";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { QuizHeader } from "../../components/learnre/Quiz/QuizHeader";
import { QuestionNavigator } from "../../components/learnre/Quiz/QuestionNavigator";
import { QuestionCard } from "../../components/learnre/Quiz/QuestionCard";
import axiosClient from "../../API/axios";

export const QuizPage: React.FC = () => {
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
  const [isTimerInitialized, setIsTimerInitialized] = useState(false);
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
    if (!attemptId) return;

    const quizSubmitted = localStorage.getItem(`quizSubmitted_${attemptId}`);
    if (quizSubmitted === "true") {
      toast.error("You've already submitted this quiz.");
      navigate("/quiz-completed");
      return;
    }

    const storedTime = localStorage.getItem(`quizTimeLeft_${attemptId}`);
    if (storedTime) {
      const parsedTime = parseInt(storedTime);
      if (parsedTime < 0 || isNaN(parsedTime)) {
        localStorage.removeItem(`quizTimeLeft_${attemptId}`);
      }
    }
  }, [attemptId, navigate]);

  const fetchQuestions = async (page = 1) => {
    if (!quizId || !courseId || !user?.userId || !attemptId || !enrollmentId) {
      throw new Error("Missing required parameters");
    }

    const res = await axiosClient.get(
      `/learner/quiz/${quizId}/c/${courseId}/u/${user.userId}/attempt/${attemptId}/e/${enrollmentId}`,
      {
        params: { page },
      
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

  const {
    data,
    isLoading: isQuestionsLoading,
    error,
  } = useQuery({
    queryKey: getQueryKey(pagination.currentPage),
    queryFn: () => fetchQuestions(pagination.currentPage),
    enabled: !!quizId && !!courseId && !!user?.userId && !!attemptId,
    staleTime: 12 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.data?.isCompleted) {
        toast.error("This quiz has already been submitted.");
        navigate("/quiz-completed");
        return false;
      }
      return failureCount < 3;
    },
  });

  useEffect(() => {
    if (error?.response?.data?.isCompleted) {
      localStorage.setItem(`quizSubmitted_${attemptId}`, "true");
      navigate("/quiz-completed");
    }
  }, [error, attemptId, navigate]);

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
      setQuestions(data.quiz.questions || []);
      setPagination({
        currentPage: data.quiz.pagination?.currentPage || 1,
        totalPages: data.quiz.pagination?.totalPages || 1,
        totalQuestions: data.quiz.pagination?.totalQuestions || 0,
        questionsPerPage: data.quiz.pagination?.questionsPerPage || 5,
      });
      setQuizDuration(data.quiz.duration || 0);
      setQuizTitle(data.quiz.title || "Untitled Quiz");

      if (!isTimerInitialized) {
        const storedTimeLeft = localStorage.getItem(
          `quizTimeLeft_${attemptId}`
        );
        let initialTime = 0;

        if (quizDuration > 0) {
          const backendRemainingTime = data.quiz.remainingTime;
          if (backendRemainingTime !== undefined && backendRemainingTime >= 0) {
            initialTime = backendRemainingTime;
          } else if (storedTimeLeft) {
            const parsedStoredTime = parseInt(storedTimeLeft, 10);
            const maxTime = quizDuration * 60;
            initialTime = Math.min(Math.max(0, parsedStoredTime), maxTime);
          } else {
            initialTime = quizDuration * 60;
          }
        }

        setTimeLeft(initialTime);
        localStorage.setItem(
          `quizTimeLeft_${attemptId}`,
          initialTime.toString()
        );
        setIsTimerInitialized(true);
      }
    }
  }, [data, queryClient, attemptId, isTimerInitialized]);

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
              answer_id: choice?.choice_id || null,
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

      return axiosClient.post(
        `/learner/submit-quiz`,
        {
          attemptId: attemptId,
          userAnswers: userAnswers,
          end_time: new Date().toISOString(),
        },
        {
        
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
      console.error("Submit quiz error:", error);
      toast.error(error?.response?.data?.error || "Failed to submit quiz.");
    },
  });

  useEffect(() => {
    if (isQuestionsLoading || timeLeft === null || questions.length === 0) {
      return;
    }

    if (timeLeft === 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          return prev;
        }

        const newTime = prev - 1;

        if (newTime <= 0) {
          clearInterval(timer);
          if (!submitQuizMutation.isPending) {
            submitQuizMutation.mutate();
          }
          return 0;
        }

        localStorage.setItem(`quizTimeLeft_${attemptId}`, newTime.toString());
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    timeLeft,
    isQuestionsLoading,
    attemptId,
    questions.length,
    submitQuizMutation,
  ]);

  const handleQuestionNavigation = async (index: number) => {
    const page = Math.floor(index / pagination.questionsPerPage) + 1;

    if (page !== pagination.currentPage) {
      setPagination((prev) => ({ ...prev, currentPage: page }));

      const newData = await queryClient.ensureQueryData({
        queryKey: getQueryKey(page),
        queryFn: () => fetchQuestions(page),
      });

      setQuestions(newData.quiz.questions || []);
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

  const handleNextQuestion = async () => {
    if (pagination.currentPage < pagination.totalPages) {
      const nextPage = pagination.currentPage + 1;
      setPagination((prev) => ({ ...prev, currentPage: nextPage }));
      setCurrentQuestionIndex((prev) => {
        const newIndex = prev + pagination.questionsPerPage;
        return Math.min(newIndex, pagination.totalQuestions - 1);
      });

      const newData = await queryClient.ensureQueryData({
        queryKey: getQueryKey(nextPage),
        queryFn: () => fetchQuestions(nextPage),
      });

      console.log(
        "Fetched new questions for page",
        nextPage,
        newData.quiz.questions
      );
      setQuestions(newData.quiz.questions || []);

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
      setCurrentQuestionIndex((prev) => {
        const newIndex = prev - pagination.questionsPerPage;
        return Math.max(0, newIndex);
      });

      const newData = await queryClient.ensureQueryData({
        queryKey: getQueryKey(prevPage),
        queryFn: () => fetchQuestions(prevPage),
      });

      console.log(
        "Fetched new questions for page",
        prevPage,
        newData.quiz.questions
      );
      setQuestions(newData.quiz.questions || []);

      if (prevPage > 1) {
        queryClient.prefetchQuery({
          queryKey: getQueryKey(prevPage - 1),
          queryFn: () => fetchQuestions(prevPage - 1),
          staleTime: 5 * 60 * 1000,
        });
      }
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

  const handleSubmitQuiz = () => {
    if (submitQuizMutation.isPending) return;
    submitQuizMutation.mutate();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Early returns
  if (!attemptId || !quizId || !courseId || !enrollmentId) {
    console.log("Invalid parameters:", {
      attemptId,
      quizId,
      courseId,
      enrollmentId,
    });
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <p className="text-red-600 text-lg font-semibold">
            Invalid quiz parameters
          </p>
          <button
            onClick={() => navigate("/learner/dashboard")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!data?.quiz && !isQuestionsLoading) {
    console.log("No quiz data available:", { data, isQuestionsLoading });
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm">
          <p className="text-red-600 text-lg font-semibold">
            Failed to load quiz data
          </p>
          <button
            onClick={() => navigate("/learner/dashboard")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isQuestionsLoading || (!isTimerInitialized && data?.quiz?.duration > 0)) {
    console.log("Loading state triggered:", {
      isQuestionsLoading,
      isTimerInitialized,
      quizDuration: data?.quiz?.duration,
    });
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-sm">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="mt-4 text-gray-700 text-lg">Initializing quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full  bg-white shadow-xl overflow-hidden">
        <QuizHeader
          quizTitle={quizTitle}
          answeredCount={Object.keys(selectedAnswers).length}
          totalQuestions={pagination.totalQuestions}
          timeLeft={timeLeft}
          formatTime={formatTime}
        />
        {submitQuizMutation.isPending ? (
          <div className="flex flex-col items-center justify-center p-16 bg-gray-50">
            <Loader2 size={40} color="#2563EB" className="animate-spin" />
            <span className="mt-4 text-gray-700 text-lg font-medium">
              Submitting your answers...
            </span>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 p-8">
            <QuestionNavigator
              totalQuestions={pagination.totalQuestions}
              currentQuestionIndex={currentQuestionIndex}
              selectedAnswers={selectedAnswers}
              handleQuestionNavigation={handleQuestionNavigation}
            />
            <div className="lg:w-3/4 order-1 lg:order-2 space-y-8">
              {questions.length === 0 ? (
                <div className="text-center text-gray-600 text-lg">
                  No questions available for this quiz.
                </div>
              ) : (
                questions.map((question, index) => (
                  <QuestionCard
                    key={question.question_id}
                    question={question}
                    index={index}
                    currentPage={pagination.currentPage}
                    questionsPerPage={pagination.questionsPerPage}
                    selectedAnswers={selectedAnswers}
                    handleAnswerSelect={handleAnswerSelect}
                  />
                ))
              )}
              {questions.length < 5 &&
                pagination.currentPage === pagination.totalPages && (
                  <div className="text-center text-gray-600 text-lg">
                    Only {questions.length} question
                    {questions.length === 1 ? "" : "s"} available on this page.
                  </div>
                )}
              <QuizControls
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                handlePreviousQuestion={handlePreviousQuestion}
                handleNextQuestion={handleNextQuestion}
                handleSubmitQuiz={handleSubmitQuiz}
                isSubmitting={submitQuizMutation.isPending}
              />
            </div>
          </div>
        )}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-center text-sm text-gray-600">
          <FiHelpCircle className="h-5 w-5 mr-2" />
          <span>
            Need help? Use the question navigator to move between questions
          </span>
        </div>
      </div>
    </div>
  );
};
