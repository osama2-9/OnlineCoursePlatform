import { useEffect, useState } from "react";
import { InstructorLayout } from "../../layouts/InstructorLayout";
import toast from "react-hot-toast";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import { useAuth } from "../../hooks/useAuth";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";

interface User {
  full_name: string;
  user_id: number;
}

interface Attempt {
  user: User;
  score: number;
  attempt_id: number;
  start_time: string;
  end_time: string;
}

interface Quiz {
  quiz_id: number;
  course_id: number;
  title: string;
  duration: number;
  Attempt: Attempt[];
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const QuizzesAttempts = () => {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<Quiz[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filter, setFilter] = useState<"all" | "reviewed" | "not-reviewed">(
    "all"
  );
  const [quizFilter, setQuizFilter] = useState<number | "all">("all");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const getUsersAttempts = async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/instructor/get-quizzes-attempts/${user?.userId}`,
        {
          params: { page, limit },
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      const data = res.data;
      if (data) {
        setAttempts(data.data);
        setQuizzes(data.data);
        setPagination(data.pagination);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to fetch attempts");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    getUsersAttempts(newPage, pagination.limit);
  };

  const handleReview = (
    attemptId: number,
    quizId: number,
    courseId: number
  ) => {
    navigate(`/instructor/review/${attemptId}`, {
      state: { quizId, courseId },
    });
  };

  const filteredAttempts = attempts
    .filter((quiz) => quizFilter === "all" || quiz.quiz_id === quizFilter)
    .map((quiz) =>
      quiz.Attempt.filter((attempt) => {
        if (filter === "reviewed") {
          return attempt.score > 0;
        } else if (filter === "not-reviewed") {
          return attempt.score === 0;
        } else {
          return true;
        }
      }).map((attempt) => ({ ...quiz, Attempt: [attempt] }))
    )
    .flat();

  useEffect(() => {
    if (user?.userId) {
      getUsersAttempts(pagination.page, pagination.limit);
    }
  }, [user?.userId]);

  return (
    <InstructorLayout>
      <div className="p-5 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Quiz Attempts</h1>

        <div className="mb-6 flex flex-wrap gap-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <label className="mr-3 font-medium text-gray-700">
              Filter by Quiz:
            </label>
            <select
              value={quizFilter}
              onChange={(e) =>
                setQuizFilter(
                  e.target.value === "all" ? "all" : parseInt(e.target.value)
                )
              }
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="all">All Quizzes</option>
              {quizzes.map((quiz) => (
                <option key={quiz.quiz_id} value={quiz.quiz_id}>
                  {quiz.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <label className="mr-3 font-medium text-gray-700">
              Filter by Status:
            </label>
            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value as "all" | "reviewed" | "not-reviewed")
              }
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="all">All Attempts</option>
              <option value="reviewed">Reviewed</option>
              <option value="not-reviewed">Not Reviewed</option>
            </select>
          </div>
        </div>

        {filteredAttempts.length === 0 ? (
          <div className="text-center text-gray-500 py-16 bg-white rounded-lg shadow-sm">
            <p className="text-xl">No quiz attempts available</p>
            <p className="text-sm mt-2">
              Try adjusting your filters or check back later
            </p>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="flex items-center justify-center">
                <ClipLoader size={25} />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg shadow">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Quiz Title
                        </th>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Duration
                        </th>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Learner Name
                        </th>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Start Time
                        </th>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          End Time
                        </th>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Score
                        </th>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredAttempts.map((quiz) =>
                        quiz.Attempt.map((attempt) => (
                          <tr
                            key={attempt.attempt_id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-4 px-4 whitespace-nowrap">
                              {quiz.title}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              {quiz.duration} mins
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              {attempt.user.full_name}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              {new Date(attempt.start_time).toLocaleString()}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              {new Date(attempt.end_time).toLocaleString()}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded-full text-sm ${
                                  attempt.score > 0
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {attempt.score}
                              </span>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
                                onClick={() =>
                                  handleReview(
                                    attempt.attempt_id,
                                    quiz.quiz_id,
                                    quiz.course_id
                                  )
                                }
                              >
                                <FaEye /> Review
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div className="mt-6 flex justify-end items-center gap-4">
              <button
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </InstructorLayout>
  );
};

export default QuizzesAttempts;
