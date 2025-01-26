import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import { useEffect, useState } from "react";
import { AdminLayout } from "../../layouts/AdminLayout";
import { Loading } from "../../components/Loading";

interface Quizzes {
  title: string;
  is_published: boolean;
  description: string;
  max_attempts: number;
  created_at: Date;
  quiz_id: number;
  course: {
    title: string;
  };
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalQuizzes: number;
  limit: number;
}

export const ShowQuizzes = () => {
  const { user } = useAuth();
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 0,
    totalQuizzes: 0,
    limit: 10,
  });
  const [quizzes, setQuizzes] = useState<Quizzes[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    is_published: "", 
  });

  const getQuizzes = async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/admin/get-quizzes/${user?.userId}`, {
        params: {
          page,
          limit,
        },
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      const data = await res.data;
      if (data) {
        setQuizzes(data.data);
        setPagination(data.pagination);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to fetch quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getQuizzes(pagination.currentPage, pagination.limit);
  }, [user?.userId]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      getQuizzes(newPage, pagination.limit);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      is_published: "",
    });
  };

  // Filter quizzes based on the `filters` state
  const filteredQuizzes = quizzes.filter((quiz) => {
    if (filters.is_published === "") {
      return true; // No filter applied
    }
    return quiz.is_published === (filters.is_published === "true");
  });

  return (
    <AdminLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Quizzes</h1>

        {/* Filter Section */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Published Status
              </label>
              <select
                name="is_published"
                value={filters.is_published}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="true">Published</option>
                <option value="false">Unpublished</option>
              </select>
            </div>
            <button
              onClick={resetFilters}
              className="mt-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Quizzes Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <Loading />
          ) : (
            <>
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                      Title
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                      Course
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                      Published
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                      Max Attempts
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuizzes.map((quiz) => (
                    <tr key={quiz.quiz_id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-white border-b">
                        {quiz.title}
                      </td>
                      <td className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-white border-b">
                        {quiz.course.title}
                      </td>
                      <td className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-white border-b">
                        {quiz.is_published ? "Yes" : "No"}
                      </td>
                      <td className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-white border-b">
                        {quiz.max_attempts}
                      </td>
                      <td className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-white border-b">
                        {new Date(quiz.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};
