import toast from "react-hot-toast";
import { useEffect, useState, useMemo } from "react";
import { AdminLayout } from "../../layouts/AdminLayout";
import { Loading } from "../../components/Loading";
import { UpdateEnrollment } from "../../components/admin/UpdateEnrollment";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import axiosClient from "../../API/axios";

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

interface EnrollmentResponse {
  enrollments: Enrollment[];
  totalPages: number;
  totalCount: number;
  currentPage: number;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  limit: number;
}

export const ShowEnrollments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // State management
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });

  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    searchTerm: "",
  });

  const [selectedEnrollment, setSelectedEnrollment] =
    useState<Enrollment | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, [filters.status, filters.searchTerm]);

  const fetchEnrollments = async ({
    page,
    limit,
  }: {
    page: number;
    limit: number;
  }): Promise<EnrollmentResponse> => {
    const { data } = await axiosClient.get<EnrollmentResponse>(
      `/enrollment/get-enrollments`,
      {
        params: {
          page,
          limit,
        },
      }
    );
    return data;
  };

  const {
    data: enrollmentData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "enrollments",
      pagination.currentPage,
      pagination.limit,
      filters.status,
      filters.searchTerm,
      user?.userId,
    ],
    queryFn: () =>
      fetchEnrollments({
        page: pagination.currentPage,
        limit: pagination.limit,
      }),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
    enabled: !!user?.userId,
  });

  useEffect(() => {
    if (enrollmentData) {
      setPagination((prev) => ({
        ...prev,
        totalPages: enrollmentData.totalPages || 1,
      }));
    }
  }, [enrollmentData]);

  const enrollments = useMemo(() => {
    return enrollmentData?.enrollments || [];
  }, [enrollmentData]);

  const handleManageClick = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowUpdateModal(true);
  };

  const handleModalCancel = () => {
    setSelectedEnrollment(null);
    setShowUpdateModal(false);
  };

  const updateEnrollmentOptimistically = (
    enrollmentId: number,
    newStatus: "active" | "completed" | "dropped",
    newAccessGranted: boolean
  ) => {
    const queryKey = [
      "enrollments",
      pagination.currentPage,
      pagination.limit,
      filters.status,
      filters.searchTerm,
      user?.userId,
    ];

    queryClient.setQueryData(
      queryKey,
      (oldData: EnrollmentResponse | undefined) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          enrollments: oldData.enrollments.map((enrollment) =>
            enrollment.enrollment_id === enrollmentId
              ? {
                  ...enrollment,
                  status: newStatus,
                  access_granted: newAccessGranted,
                }
              : enrollment
          ),
        };
      }
    );
  };

  const handleUpdate = async (
    status: "active" | "completed" | "dropped",
    accessGranted: boolean
  ) => {
    if (!selectedEnrollment) return;

    updateEnrollmentOptimistically(
      selectedEnrollment.enrollment_id,
      status,
      accessGranted
    );

    try {
      const response = await axiosClient.put(
        `/enrollment/update-enrollment`,
        {
          enrollmentId: selectedEnrollment.enrollment_id,
          status: status,
          access_granted: accessGranted,
        },
        { withCredentials: true }
      );

      if (response.data) {
        toast.success(
          response.data.message || "Enrollment updated successfully"
        );
        handleModalCancel();
      }
    } catch (error: any) {
      const queryKey = [
        "enrollments",
        pagination.currentPage,
        pagination.limit,
        filters.status,
        filters.searchTerm,
        user?.userId,
      ];

      queryClient.invalidateQueries({ queryKey });

      console.error("Update error:", error);
      toast.error(
        error?.response?.data?.error || "Failed to update enrollment"
      );
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination((prev) => ({
      ...prev,
      limit: newLimit,
      currentPage: 1,
    }));
  };

  const handleSearchChange = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, searchTerm }));
  };

  const handleStatusFilterChange = (status: FilterOptions["status"]) => {
    setFilters((prev) => ({ ...prev, status }));
  };

  // Export function
  const exportToCSV = () => {
    if (!enrollments.length) {
      toast.error("No data to export");
      return;
    }

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

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `enrollments_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Render pagination component
  const renderPagination = () => {
    const { currentPage, totalPages } = pagination;
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(
                  currentPage * pagination.limit,
                  enrollmentData?.totalCount || 0
                )}
              </span>{" "}
              of{" "}
              <span className="font-medium">
                {enrollmentData?.totalCount || 0}
              </span>{" "}
              results
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              First
            </button>

            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {pages.map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  page === currentPage
                    ? "text-blue-600 bg-blue-50 border border-blue-300"
                    : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>

            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Last
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Error handling
  if (isError) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-5">
          <div className="text-center text-red-600">
            <h2 className="text-xl font-semibold mb-2">
              Error loading enrollments
            </h2>
            <p>{(error as any)?.message || "An unexpected error occurred"}</p>
            <button
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["enrollments"] })
              }
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-5 space-y-6">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Enrollment Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage student enrollments and course access
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search by student name or course title..."
                  value={filters.searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <select
                value={filters.status}
                onChange={(e) =>
                  handleStatusFilterChange(
                    e.target.value as FilterOptions["status"]
                  )
                }
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                disabled={!enrollments.length}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Export CSV
              </button>

              <select
                value={pagination.limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={15}>15 per page</option>
                <option value={25}>25 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8">
              <Loading />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Access
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enrolled
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {enrollments.length > 0 ? (
                      enrollments.map((enrollment) => (
                        <tr
                          key={enrollment.enrollment_id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{enrollment.enrollment_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {enrollment.user.full_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {enrollment.course.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                enrollment.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : enrollment.status === "completed"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {enrollment.status.charAt(0).toUpperCase() +
                                enrollment.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                enrollment.access_granted
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {enrollment.access_granted ? "Granted" : "Denied"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(
                              enrollment.enrollment_date
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleManageClick(enrollment)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          <div className="flex flex-col items-center">
                            <p className="text-lg font-medium mb-1">
                              No enrollments found
                            </p>
                            <p className="text-sm">
                              Try adjusting your search criteria
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {enrollments.length > 0 && renderPagination()}
            </>
          )}
        </div>

        {/* Update Modal */}
        {selectedEnrollment && (
          <UpdateEnrollment
            isOpen={showUpdateModal}
            enrollmentStatus={selectedEnrollment.status}
            enrollmentAccessGranted={selectedEnrollment.access_granted}
            onUpdate={handleUpdate}
            onCancel={handleModalCancel}
          />
        )}
      </div>
    </AdminLayout>
  );
};
