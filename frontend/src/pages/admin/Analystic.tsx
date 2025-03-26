import { Line, Bar, Doughnut } from "react-chartjs-2";
import { Loader2 } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { AdminLayout } from "../../layouts/AdminLayout";
import toast from "react-hot-toast";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import { useAuth } from "../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { qureyClinet } from "../../main";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Response {
  totalSuccessedPayments: number;
  totalStudents: number;
  totalCourses: number;
  totalCompletionPercentage: number;
  revenueTrend: {
    month: Date;
    amount: number;
  }[];
  enrollmentTrend: {
    month: Date;
    count: number;
  }[];
  coursesByCategory: {
    category: string;
    count: number;
  }[];
  topPerformingCourses: {
    title: string;
    enrollments: number;
    rating: number;
  }[];
}

export const AdminAnalystic = () => {
  const { user } = useAuth();

  const getAnalaytics = async () => {
    try {
      const { data } = await axios.get<Response>(
        `${API}/admin/analystics/${user?.userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return data;
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
      throw error;
    }
  };

  const { data, isError, isLoading } = useQuery({
    queryKey: ["adminanalystics", user?.userId],
    queryFn: getAnalaytics,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });


  useEffect(()=>{
    qureyClinet.prefetchQuery({
      queryKey: ["adminanalystics", user?.userId],
      queryFn: getAnalaytics,
      staleTime: 10 * 60 * 1000,
      retry: 2,
    })
  }, [user?.userId]);

  const cardsData = {
    totalSuccessedPayments: data?.totalSuccessedPayments || 0,
    totalCourses: data?.totalCourses || 0,
    totalCompletionPercentage: data?.totalCompletionPercentage || 0,
    totalStudents: data?.totalStudents || 0,
  };

  const revenueData = {
    labels: data?.revenueTrend.map((revenue) => revenue.month) || [],
    datasets: [
      {
        label: "Revenue ($)",
        data: data?.revenueTrend.map((revenue) => revenue.amount) || [],
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const enrollmentData = {
    labels: data?.enrollmentTrend.map((enrollment) => enrollment.month) || [],
    datasets: [
      {
        label: "New Enrollments",
        data: data?.enrollmentTrend.map((enrollment) => enrollment.count) || [],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };

  const categoryData = {
    labels: data?.coursesByCategory.map((category) => category.category) || [],
    datasets: [
      {
        data: data?.coursesByCategory.map((category) => category.count) || [],
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
        ],
      },
    ],
  };

  if (isError) {
    return (
      <AdminLayout>
        <p className="flex justify-center text-center text-red-500">
          Error fetching data
        </p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin" size={30} color={"#123abc"} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-gray-500">Total Revenue</h3>
                <p className="text-2xl font-bold">
                  ${cardsData.totalSuccessedPayments}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-gray-500">Total Students</h3>
                <p className="text-2xl font-bold">{cardsData.totalStudents}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-gray-500">Total Courses</h3>
                <p className="text-2xl font-bold">{cardsData.totalCourses}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-gray-500">Completion Rate</h3>
                <p className="text-2xl font-bold">
                  {cardsData.totalCompletionPercentage}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
                <Line
                  data={revenueData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "top" },
                    },
                  }}
                />
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">
                  Monthly Enrollments
                </h3>
                <Bar
                  data={enrollmentData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "top" },
                    },
                  }}
                />
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">
                  Course Categories
                </h3>
                <Doughnut
                  data={categoryData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "right" },
                    },
                  }}
                />
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">
                  Top Performing Courses
                </h3>
                <div className="space-y-4">
                  {data?.topPerformingCourses.map((course, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-gray-500">
                          {course.enrollments} students
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1">{course.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};
