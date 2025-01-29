import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { API } from "../../API/ApiBaseUrl";
import { useAuth } from "../../hooks/useAuth";
import { QuizDetails } from "../../types/QuizDetails";
import { InstructorLayout } from "../../layouts/InstructorLayout";
import { FaEllipsisV } from "react-icons/fa";
import { ConfirmeDelete } from "../../components/admin/ConfirmeDelete";
import ReactMarkdown from "react-markdown";
import { ClipLoader } from "react-spinners";

export const ReviewQuiz = () => {
  const { courseId, quizId } = useParams();
  const [quizDetails, setQuizDetails] = useState<QuizDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(
    null
  );

  const navigator = useNavigate();

  const getQuizDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/instructor/review-quiz/${quizId}/course/${courseId}/instructor/${user?.userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = await res.data;
      if (data) {
        setQuizDetails(data);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.error || "Failed to fetch quiz details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getQuizDetails();
  }, [courseId, quizId, user?.userId]);

  const toggleMenu = (questionId: number) => {
    setOpenMenuId(openMenuId === questionId ? null : questionId);
  };

  const handleOnClickDeleteQuestion = (questionId: number) => {
    setSelectedQuestionId(questionId);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setSelectedQuestionId(null);
    setShowDeleteModal(false);
  };

  const handleOnClickUpdate = (
    questionId: number,
    courseId: number,
    question: any
  ) => {
    navigator(`/instructor/update-question/${questionId}/course/${courseId}`, {
      state: { question },
    });
  };

  const handleDeleteQuestion = async () => {
    if (!selectedQuestionId) return;

    try {
      const res = await axios.delete(
        `${API}/instructor/delete-question/${selectedQuestionId}/instrctor/${user?.userId}/quiz/${quizId}/course/${courseId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const data = await res.data;
      if (data) {
        toast.success(data?.message);
        setShowDeleteModal(false);
        setSelectedQuestionId(null);
        getQuizDetails();
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to delete question");
    } finally {
    }
  };

  if (!quizDetails) return null;

  return (
    <InstructorLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Quiz Review</h1>
            <p className="text-gray-600 mt-1">
              Review and manage quiz questions
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center ">
              <ClipLoader size={20} />
            </div>
          ) : (
            <>
              {/* Quiz Details Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h2 className="text-sm font-medium text-gray-500">Title</h2>
                    <p className="text-lg font-semibold text-gray-900">
                      {quizDetails?.quiz.title}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-sm font-medium text-gray-500">
                      Duration
                    </h2>
                    <p className="text-lg font-semibold text-gray-900">
                      {quizDetails?.quiz.duration} minutes
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-sm font-medium text-gray-500">
                      Max Attempts
                    </h2>
                    <p className="text-lg font-semibold text-gray-900">
                      {quizDetails?.quiz.max_attempts}
                    </p>
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <h2 className="text-sm font-medium text-gray-500">
                      Description
                    </h2>
                    <p className="text-gray-900">
                      {quizDetails?.quiz.description}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-sm font-medium text-gray-500">
                      Status
                    </h2>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        quizDetails?.quiz.is_published
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {quizDetails?.quiz.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Questions Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Questions ({quizDetails?.questions.length || 0})
                  </h2>
                  <button
                    onClick={() =>
                      navigator(
                        `/instructor/add-questions/${quizDetails.quiz.quiz_id}/quiz/${quizDetails.quiz.title}/c/`
                      )
                    }
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Add Question
                  </button>
                </div>

                <div className="space-y-6">
                  {quizDetails?.questions &&
                  quizDetails.questions.length > 0 ? (
                    quizDetails.questions.map((question, index) => (
                      <div
                        key={question.question_id}
                        className="bg-gray-50 rounded-lg p-6 relative group"
                      >
                        {/* Question Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-medium">
                              {index + 1}
                            </span>
                            <div>
                              <span className="text-sm font-medium text-gray-500">
                                Question {index + 1}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                                    question.question_type === "mcq"
                                      ? "bg-blue-100 text-blue-700"
                                      : question.question_type === "truefalse"
                                      ? "bg-purple-100 text-purple-700"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {question.question_type.toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {question.marks}{" "}
                                  {question.marks === 1 ? "mark" : "marks"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions Menu */}
                          <div className="relative">
                            <button
                              onClick={() => toggleMenu(question.question_id)}
                              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                              <FaEllipsisV className="text-gray-600" />
                            </button>
                            {openMenuId === question.question_id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <button
                                  onClick={() =>
                                    handleOnClickUpdate(
                                      question.question_id,
                                      Number(courseId),
                                      question
                                    )
                                  }
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  Update Question
                                </button>
                                <button
                                  onClick={() =>
                                    handleOnClickDeleteQuestion(
                                      question.question_id
                                    )
                                  }
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  Delete Question
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Question Content */}
                        <div className="prose prose-sm max-w-none mb-4">
                          <ReactMarkdown>
                            {question.question_text}
                          </ReactMarkdown>
                        </div>

                        {/* Choices */}
                        {question.choices && question.choices.length > 0 && (
                          <div className="space-y-2">
                            {question.choices.map((choice) => (
                              <div
                                key={choice.choice_id}
                                className={`p-3 rounded-lg flex items-center gap-3 ${
                                  choice.is_correct
                                    ? "bg-green-50 border border-green-200"
                                    : "bg-white border border-gray-200"
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded-full ${
                                    choice.is_correct
                                      ? "bg-green-500"
                                      : "bg-gray-200"
                                  }`}
                                />
                                <span
                                  className={
                                    choice.is_correct
                                      ? "text-green-700"
                                      : "text-gray-700"
                                  }
                                >
                                  {choice.choice_text}
                                </span>
                                {choice.is_correct && (
                                  <span className="text-xs text-green-600 ml-auto">
                                    Correct Answer
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No questions added
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Start by adding questions to your quiz
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Delete Confirmation Modal */}
          {selectedQuestionId && showDeleteModal && (
            <ConfirmeDelete
              title="Delete Question"
              onCancel={handleCancelDelete}
              onConfirm={handleDeleteQuestion}
            />
          )}
        </div>
      </div>
    </InstructorLayout>
  );
};
