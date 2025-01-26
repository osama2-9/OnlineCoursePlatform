import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InstructorLayout } from "../../layouts/InstructorLayout";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import { Loading } from "../../components/Loading";
import Switch from "react-switch";
import { FaEye } from "react-icons/fa";

interface Quiz {
  quiz_id: number;
  title: string;
  description: string;
  duration: number;
  max_attempts: number;
  is_published: boolean;
  created_at: string;
  course: {
    title: string;
    course_id: number;
  };
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalQuizzes: number;
}

export const Quizzes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalQuizzes: 0,
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const quizzesPerPage = 8;

  const getQuizzes = async (page: number = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/instructor/get-quizzes/${user?.userId}`,
        {
          params: { page, pageSize: quizzesPerPage },
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = res.data;
      if (data) {
        setQuizzes(data.quizzes);
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          totalQuizzes: data.totalQuizzes,
        });
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to fetch quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getQuizzes(pagination.currentPage);
  }, [user?.userId, pagination.currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: page }));
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && quiz.is_published) ||
      (statusFilter === "unpublished" && !quiz.is_published);
    const matchesSearch = quiz.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateQuiz = () => {
    navigate("/instructor/create-quiz");
  };

  const handleManageClick = (quizId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(
      `/instructor/add-questions/${quizId}/quiz/${
        quizzes.find((q) => q.quiz_id === quizId)?.title
      }/c/${quizzes.find((q) => q.quiz_id === quizId)?.course.title}`
    );
  };

  const handleReviewClick = (quizId: number, courseId: number) => {
    navigate(`/instructor/review-quiz/${quizId}/course/${courseId}`);
  };

  const handleTogglePublish = async (quizId: number, isPublished: boolean) => {
    try {
      const res = await axios.put(
        `${API}/instructor/toggle-publish-quiz`,
        {
          quizId: quizId,
          is_published: !isPublished,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data) {
        toast.success(
          `Quiz ${!isPublished ? "published" : "unpublished"} successfully!`
        );
        getQuizzes(pagination.currentPage);
      }
    } catch (error: any) {
      console.log(error);
      // Revert the local state if the API call fails
      setQuizzes((prevQuizzes) =>
        prevQuizzes.map((quiz) =>
          quiz.quiz_id === quizId
            ? { ...quiz, is_published: isPublished }
            : quiz
        )
      );
      toast.error(
        error?.response?.data?.error || "Failed to update quiz status"
      );
    }
  };

  return (
    <InstructorLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Quizzes</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border border-gray-300 rounded-md flex-grow"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </select>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y  divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                      Duration (mins)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                      Max Attempts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                      Actions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                      Review
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQuizzes.map((quiz) => (
                    <tr key={quiz.quiz_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {quiz.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {quiz.description.slice(0, 20).concat("...")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {quiz.course.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {quiz.duration}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {quiz.max_attempts}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Switch
                          checked={quiz.is_published}
                          onChange={() =>
                            handleTogglePublish(quiz.quiz_id, quiz.is_published)
                          }
                          onClick={(e) => e.stopPropagation()}
                          onColor="#10B981"
                          offColor="#FBBF24"
                          checkedIcon={false}
                          uncheckedIcon={false}
                          height={20}
                          width={40}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(quiz.created_at).toLocaleDateString()}
                      </td>
                      <td
                        className="px-6 cursor-pointer py-4 whitespace-nowrap text-sm font-semibold text-blue-500"
                        onClick={(event) =>
                          handleManageClick(quiz.quiz_id, event)
                        }
                      >
                        Manage
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-500"
                        onClick={() =>
                          handleReviewClick(quiz.quiz_id, quiz.course.course_id)
                        }
                      >
                        <FaEye
                          size={25}
                          className="cursor-pointer hover:text-gray-700"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Previous
              </button>
              <span>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Next
              </button>
            </div>

            <div className="fixed bottom-6 right-6 group">
              <button
                onClick={handleCreateQuiz}
                className="p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all relative"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </InstructorLayout>
  );
};
