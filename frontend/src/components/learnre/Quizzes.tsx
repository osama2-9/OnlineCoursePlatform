import { useState } from "react";
import { useGetLearnerQuizzes } from "../../hooks/useGetLearnerQuizzes";
import { Loading } from "../Loading";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { FaClock, FaClipboardList } from "react-icons/fa";

export const Quizzes = () => {
  const { quizzesLoading, quizzs } = useGetLearnerQuizzes();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [enrollmentId, setEnrollmentId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStartingQuiz, setIsStartingQuiz] = useState(false);

  const handleStartQuiz = (
    quizId: number,
    courseId: number,
    enrollmentId: number
  ) => {
    setSelectedQuizId(quizId);
    setSelectedCourseId(courseId);
    setIsModalOpen(true);
    setEnrollmentId(enrollmentId);
  };

  const confirmStartQuiz = async () => {
    if (
      !selectedQuizId ||
      !selectedCourseId ||
      !user?.userId ||
      !enrollmentId
    ) {
      toast.error("Quiz or course information is missing.");
      return;
    }

    setIsStartingQuiz(true);

    try {
      const res = await axios.post(
        `${API}/learner/start-quiz`,
        {
          enrollmentId: enrollmentId,
          courseId: selectedCourseId,
          quizId: selectedQuizId,
          userId: user?.userId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const data = await res.data;
      if (data && data.attempt) {
        navigate(
          `/quiz/${selectedQuizId}/course/${selectedCourseId}/a/${data.attempt?.attempt_id}/e/${enrollmentId}`
        );
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to start the quiz.");
    } finally {
      setIsStartingQuiz(false);
      setIsModalOpen(false);
    }
  };

  const cancelStartQuiz = () => {
    setIsModalOpen(false);
    setSelectedQuizId(null);
    setSelectedCourseId(null);
  };

  return (
    <div className="space-y-6">
      {quizzesLoading ? (
        <Loading />
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Available Quizzes
            </h2>
          </div>

          <div className="space-y-4">
            {quizzs.map((quiz) => (
              <div
                key={quiz.quiz_id}
                className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {quiz.title}
                    </h3>
                    {quiz.Attempt?.length > 0 && quiz.Attempt[0].score > 0 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Score: {quiz.Attempt[0].score}
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      {quiz.description}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      Course: {quiz.course.title}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaClock className="mr-2" />
                      <span>Duration: {quiz.duration} minutes</span>
                    </div>
                    <button
                      onClick={() =>
                        handleStartQuiz(
                          quiz.quiz_id,
                          quiz.course_id,
                          quiz.enrollment_id
                        )
                      }
                      className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Start Quiz
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {quizzs.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="mb-4">
                <FaClipboardList className="mx-auto h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No quizzes available
              </h3>
              <p className="text-gray-500">Check back later for new quizzes</p>
            </div>
          )}

          {/* Confirmation Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Start Quiz
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you ready to begin? Make sure you have enough time to
                  complete the quiz.
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={cancelStartQuiz}
                    className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmStartQuiz}
                    disabled={isStartingQuiz}
                    className="px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] flex items-center justify-center"
                  >
                    {isStartingQuiz ? (
                      <ClipLoader color="#ffffff" size={20} />
                    ) : (
                      "Start Quiz"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
