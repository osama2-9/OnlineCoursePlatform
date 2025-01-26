import { FaBook, FaChalkboardTeacher, FaSmile, FaUser } from "react-icons/fa";
import TopCoursesChart from "../../components/admin/TopCoursesChart";
import { AdminLayout } from "../../layouts/AdminLayout";
import toast from "react-hot-toast";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";

interface Cards {
  totalLearners: number;
  totalInstructors: number;
  totalCourses: number;
}
interface Enrollments {
  enrollment_date: Date;
  user: {
    full_name: string;
  };
  course: {
    title: string;
  };
}

interface Payments {
  amount: number;
  created_at: Date;
  user: {
    full_name: string;
  };
}

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [cardsData, setCardsData] = useState<Cards | null>(null);
  const [lastPayments, setLastPayments] = useState<Payments[] | null>([]);
  const [lastEnrollments, setLastEnrollments] = useState<Enrollments[] | null>(
    []
  );

  const dashboardSummary = async () => {
    try {
      const res = await axios.get(`${API}/admin/dashboard-summary`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      const data = res.data;
      if (data) {
        setCardsData(data.cards);
        setLastPayments(data.cards.lastPayments);
        setLastEnrollments(data.cards.lastEnrollments);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "An error occurred");
    }
  };

  useEffect(() => {
    dashboardSummary();
  }, []);

  return (
    <AdminLayout>
      {/* Hero Section with Gradient */}
      <div className="bg-gradient-to-r  from-blue-700 to-blue-500 rounded-xl shadow-xl p-8 text-white mb-8">
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
                {cardsData ? cardsData.totalLearners : "..."}
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
                {cardsData ? cardsData.totalInstructors : "..."}
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
                {cardsData ? cardsData.totalCourses : "..."}
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
                  {lastEnrollments && lastEnrollments.length > 0 ? (
                    lastEnrollments.map((enrollment, index) => (
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
                  {lastPayments && lastPayments.length > 0 ? (
                    lastPayments.map((payment, index) => (
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
