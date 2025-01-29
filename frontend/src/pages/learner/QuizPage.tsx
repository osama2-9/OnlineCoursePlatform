import axios from "axios";
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
  const [loading, setLoading] = useState(false);
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
  const [isQuizLoad, setIsQuizLoad] = useState<boolean>(false);

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

  useEffect(() => {
    getQuestions(pagination.currentPage);
  }, [quizId, courseId, user?.userId, attemptId]);

  const getQuestions = async (page = 1) => {
    try {
      setIsQuizLoad(true);
      const res = await axios.get(
        `${API}/learner/quiz/${quizId}/c/${courseId}/u/${user?.userId}/attempt/${attemptId}/e/${enrollmentId}`,
        {
          params: { page },
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      const data = await res.data;
      if (data?.quiz) {
        setQuestions(data.quiz.questions);
        setPagination(data.quiz.pagination);
        setQuizDuration(data.quiz.duration);
        setQuizTitle(data.quiz.title);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error || "Failed to fetch questions.");
    } finally {
      setIsQuizLoad(false);
    }
  };

  useEffect(() => {
    if (isQuizLoad) return;
    const storedTimeLeft = localStorage.getItem(`quizTimeLeft_${attemptId}`);
    const initialTime = storedTimeLeft
      ? parseInt(storedTimeLeft, 10)
      : quizDuration * 60;
    setTimeLeft(initialTime);
  }, [attemptId, quizDuration, isQuizLoad]);

  useEffect(() => {
    if (isQuizLoad || timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        localStorage.setItem(`quizTimeLeft_${attemptId}`, newTime.toString());
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isQuizLoad, attemptId]);

  const handleQuestionNavigation = async (index: number) => {
    const page = Math.floor(index / pagination.questionsPerPage) + 1;
    await getQuestions(page);
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
      await getQuestions(pagination.currentPage + 1);
      setCurrentQuestionIndex((prev) => prev + pagination.questionsPerPage);
    }
  };

  const handlePreviousQuestion = async () => {
    if (pagination.currentPage > 1) {
      await getQuestions(pagination.currentPage - 1);
      setCurrentQuestionIndex((prev) => prev - pagination.questionsPerPage);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      setLoading(true);

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
            // For text questions
            return {
              question_id: parseInt(questionId),
              answer_id: null,
              answer_text: answerData.answer_text,
            };
          }
        }
      );

      const res = await axios.post(
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

      if (res.data) {
        toast.success("Quiz submitted successfully!");
        localStorage.setItem(`quizSubmitted_${attemptId}`, "true");
        localStorage.removeItem(`quizTimeLeft_${attemptId}`);
        navigate("/quiz-completed");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error || "Failed to submit quiz.");
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="p-6 bg-gray-100 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                {quizTitle}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Attempt ID: {attemptId}
              </p>
            </div>
            <div className="flex items-center gap-3 bg-gray-200 px-4 py-2 rounded-md">
              <FiClock className="h-5 w-5 text-gray-600" />
              <span className="text-lg font-medium text-gray-700">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row p-6 gap-6">
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
                          ? "bg-gray-800 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-300"
                      }
                      ${
                        selectedAnswers[i + 1]
                          ? 'after:content-[" "] after:absolute after:top-0 after:right-0 after:w-2 after:h-2 after:bg-green-500 after:rounded-full'
                          : ""
                      }`}
                  >
                    {i + 1}
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
                className="bg-white p-6 rounded-lg border border-gray-200"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-7 h-7 bg-gray-100 rounded-md flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {currentQuestionIndex + index + 1}
                        <span className="text-xs text-gray-500 ml-1">
                          ({question.marks})
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="prose max-w-none text-gray-800">
                    <ReactMarkdown>{question.question_text}</ReactMarkdown>
                  </div>
                </div>

                {question.question_type === "mcq" && (
                  <div className="space-y-2">
                    {question.choices.map((choice) => (
                      <label
                        key={choice.choice_id}
                        className={`flex items-center p-3 rounded-md cursor-pointer transition-colors
                          ${
                            selectedAnswers[question.question_id]?.answer_id ===
                            choice.choice_id
                              ? "bg-gray-100 border border-gray-300"
                              : "hover:bg-gray-50 border border-gray-200"
                          }`}
                      >
                        <input
                          type="radio"
                          name={`question-${question.question_id}`}
                          className="form-radio h-4 w-4 text-gray-800 border-gray-400"
                          checked={
                            selectedAnswers[question.question_id]?.answer_id ===
                            choice.choice_id
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
                  <div className="grid grid-cols-2 gap-2">
                    {["True", "False"].map((option, i) => (
                      <label
                        key={i}
                        className={`flex items-center justify-center p-3 rounded-md cursor-pointer transition-colors
                          ${
                            selectedAnswers[question.question_id]
                              ?.answer_text === option
                              ? "bg-gray-100 border border-gray-300"
                              : "hover:bg-gray-50 border border-gray-200"
                          }`}
                      >
                        <input
                          type="radio"
                          name={`question-${question.question_id}`}
                          className="form-radio h-4 w-4 text-gray-800 border-gray-400"
                          checked={
                            selectedAnswers[question.question_id]
                              ?.answer_text === option
                          }
                          onChange={() =>
                            handleAnswerSelect(question.question_id, i, option)
                          }
                        />
                        <span className="ml-2 text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.question_type === "text" && (
                  <div className="relative">
                    <textarea
                      className="w-full p-3 bg-gray-50 rounded-md focus:ring-1 focus:ring-gray-400
                        border border-gray-300 placeholder-gray-400 text-gray-700"
                      rows={4}
                      placeholder="Type your answer here..."
                      value={
                        selectedAnswers[question.question_id]?.answer_text || ""
                      }
                      onChange={(e) =>
                        handleAnswerSelect(
                          question.question_id,
                          undefined,
                          e.target.value
                        )
                      }
                    />
                    <FiCheckCircle className="absolute bottom-3 right-3 h-5 w-5 text-gray-400" />
                  </div>
                )}
              </div>
            ))}

            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
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
                  className="px-5 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 
                    transition-colors border border-gray-800 text-sm font-medium"
                >
                  {loading ? (
                    <ClipLoader size={18} color="#FFFFFF" />
                  ) : (
                    "Submit "
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
