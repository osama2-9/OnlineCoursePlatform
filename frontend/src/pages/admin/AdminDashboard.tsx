import { FaBook, FaChalkboardTeacher, FaSmile, FaUser } from "react-icons/fa";
import TopCoursesChart from "../../components/admin/TopCoursesChart";
import { AdminLayout } from "../../layouts/AdminLayout";
import { useAuth } from "../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import toast from "react-hot-toast";

interface Cards {
  totalLearners: number;
  totalInstructors: number;
  totalCourses: number;
  lastPayments: Payment[];
  lastEnrollments: Enrollment[];
}

interface Enrollment {
  enrollment_date: Date;
  user: {
    full_name: string;
  };
  course: {
    title: string;
  };
}

interface Payment {
  amount: number;
  created_at: Date;
  user: {
    full_name: string;
  };
}

interface DashboardResponse {
  cards: Cards;
}

export const AdminDashboard = () => {
  const { user } = useAuth();

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get<DashboardResponse>(
        `${API}/admin/dashboard-summary`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return data;
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "An error occurred");
      throw error;
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: fetchDashboardData,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
  });

  if (isError) {
    return (
      <AdminLayout>
        <div className="text-center text-red-600 p-8">
          Failed to load dashboard data. Please try again later.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-xl shadow-xl p-8 text-white mb-8">
        <div className="flex items-center space-x-6">
          <div className="p-4 bg-white/20 backdrop-blur-lg rounded-xl">
            <FaSmile className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome Back, {user?.full_name}
            </h1>
            <p className="text-lg mt-2 text-blue-100">
              Here's what's happening with Uplearn today
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Learners
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {isLoading ? "..." : data?.cards.totalLearners}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FaUser className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Instructors
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {isLoading ? "..." : data?.cards.totalInstructors}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FaChalkboardTeacher className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Courses</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {isLoading ? "..." : data?.cards.totalCourses}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FaBook className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Enrollments & Payments Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Recent Activity
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enrollments Table */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Latest Enrollments
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Student
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Course
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-4 text-center text-gray-500"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : data?.cards.lastEnrollments &&
                    data.cards.lastEnrollments.length > 0 ? (
                    data.cards.lastEnrollments.map((enrollment, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {enrollment.user.full_name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {enrollment.course.title}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(
                            enrollment.enrollment_date
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-4 text-center text-gray-500"
                      >
                        No enrollments available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Latest Payments
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Student
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-4 text-center text-gray-500"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : data?.cards.lastPayments &&
                    data.cards.lastPayments.length > 0 ? (
                    data.cards.lastPayments.map((payment, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {payment.user.full_name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          ${payment.amount}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-4 text-center text-gray-500"
                      >
                        No payments available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <TopCoursesChart />
        </div>
      </div>
    </AdminLayout>
  );
};
