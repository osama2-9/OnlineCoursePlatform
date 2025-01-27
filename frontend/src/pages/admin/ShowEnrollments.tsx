import axios from "axios";
import toast from "react-hot-toast";
import { API } from "../../API/ApiBaseUrl";
import { useEffect, useState } from "react";
import { AdminLayout } from "../../layouts/AdminLayout";
import { Loading } from "../../components/Loading";
import { UpdateEnrollment } from "../../components/admin/UpdateEnrollment";

interface Enrollment {
  enrollment_id: number;
  user_id: number;
  course_id: number;
  enrollment_date: Date;
  user: {
    full_name: string;
  };
  course: {
    title: string;
  };
  status: "active" | "completed" | "dropped";
  access_granted: boolean;
}

interface FilterOptions {
  status: "all" | "active" | "completed" | "dropped";
  searchTerm: string;
}

export const ShowEnrollments = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [loading, setIsLoading] = useState<boolean>(false);

  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    searchTerm: "",
  });

  const getFilteredEnrollments = () => {
    return enrollments.filter((enrollment) => {
      const matchesStatus =
        filters.status === "all" || enrollment.status === filters.status;
      const matchesSearch =
        enrollment.user.full_name
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ||
        enrollment.course.title
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  };

  const getEnrollments = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API}/enrollment/get-enrollments`, {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          page: currentPage,
          limit: rowsPerPage,
          status: filters.status !== "all" ? filters.status : undefined,
          search: filters.searchTerm || undefined,
        },
        withCredentials: true,
      });
      const data = await res.data;
      if (data) {
        setEnrollments(data.enrollments);
        setTotalPages(data.totalPages);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const [selectdEnrollment, setSelectedEnrollment] =
    useState<Enrollment | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);

  const onClickManage = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowUpdateModal(true);
  };

  const onClickCancel = () => {
    setSelectedEnrollment(null);
    setShowUpdateModal(false);
  };
  const handleUpdate = async (
    status: "active" | "completed" | "dropped",
    accessGranted: boolean
  ) => {
    if (!selectdEnrollment) return;

    try {
      const res = await axios.put(
        `${API}/enrollment/update-enrollment`,
        {
          enrollmentId: selectdEnrollment.enrollment_id,
          status: status,
          access_granted: accessGranted,
        },
        { withCredentials: true }
      );
      if (res.data) {
        toast.success(res.data?.message);
        getEnrollments(); // Refresh the list
        onClickCancel(); // Close the modal
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "An error occurred");
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    getEnrollments();
  }, [currentPage, rowsPerPage, filters]);

  const exportToCSV = () => {
    const csvContent = [
      [
        "Enrollment ID",
        "Student Name",
        "Course",
        "Status",
        "Access Granted",
        "Enrollment Date",
      ],
      ...enrollments.map((enrollment) => [
        enrollment.enrollment_id,
        enrollment.user.full_name,
        enrollment.course.title,
        enrollment.status,
        enrollment.access_granted ? "Yes" : "No",
        new Date(enrollment.enrollment_date).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "enrollments.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      {loading ? (
        <Loading />
      ) : (
        <div className="container mx-auto p-5">
          <div className="mb-5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by student or course..."
                value={filters.searchTerm}
                onChange={(e) =>
                  setFilters({ ...filters, searchTerm: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    status: e.target.value as FilterOptions["status"],
                  })
                }
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>
            <div className="flex gap-4">
              <button
                onClick={exportToCSV}
              >
                Export CSV
              </button>
              <div className="relative inline-block w-full sm:w-auto">
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="appearance-none block w-full p-3 pr-10 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out"
                >
                  <option value={5}>5 Rows</option>
                  <option value={10}>10 Rows</option>
                  <option value={15}>15 Rows</option>
                </select>
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Enrollments
              </h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollment ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Access Granted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredEnrollments().length > 0 ? (
                  getFilteredEnrollments().map((enrollment) => (
                    <tr
                      key={enrollment.enrollment_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {enrollment.enrollment_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {enrollment.user.full_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {enrollment.course.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            enrollment.status === "active"
                              ? "bg-green-100 text-green-800"
                              : enrollment.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            enrollment.access_granted
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {enrollment.access_granted ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(
                          enrollment.enrollment_date
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        <button
                          onClick={() => onClickManage(enrollment)}
                          className="p-2 shadow-md bg-blue-500 hover:bg-blue-600 transition-all rounded-md"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No enrollments available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {selectdEnrollment && (
            <UpdateEnrollment
              isOpen={showUpdateModal}
              enrollmentStatus={selectdEnrollment.status}
              enrollmentAccessGranted={selectdEnrollment.access_granted}
              onUpdate={handleUpdate}
              onCancel={onClickCancel}
            />
          )}
          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
