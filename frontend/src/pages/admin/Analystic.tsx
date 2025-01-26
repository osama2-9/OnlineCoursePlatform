import { useEffect, useState } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
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
import { ClipLoader } from "react-spinners";

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
}

export const AdminAnalystic = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cardsData, setCardsData] = useState({
    totalSuccessedPayments: 0,
    totalCourses: 0,
    totalCompletionPercentage: 0,
    totalStudents: 0,
  });

  const [enrollmentTrend, setEnrollmentTrend] = useState<
    Response["enrollmentTrend"]
  >([
    {
      month: new Date(),
      count: 0,
    },
  ]);

  const enrollmentMonthes = enrollmentTrend.map((enrollment) => {
    return enrollment.month;
  });

  const enrollmentCount = enrollmentTrend.map((enrollment) => {
    return enrollment.count;
  });

  const [revenueTrend, setRevenueTrend] = useState<Response["revenueTrend"]>([
    {
      month: new Date(),
      amount: 0,
    },
  ]);

  const revenueMonthes = revenueTrend.map((revenue: any) => {
    return revenue.month;
  });

  const revenueAmount = revenueTrend.map((revenue: any) => {
    return revenue.amount;
  });

  const [coursesByCategory, setCoursesByCategory] = useState<
    Response["coursesByCategory"]
  >([
    {
      category: "",
      count: 0,
    },
  ]);

  const categorys = coursesByCategory.map((category) => {
    return category.category;
  });

  const categoryCoursesCount = coursesByCategory.map((category) => {
    return category.count;
  });

  const getAnalaytics = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Response>(
        `${API}/admin/analystics/${user?.userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = res.data;
      if (data) {
        setCardsData({
          totalCompletionPercentage: data.totalCompletionPercentage,
          totalCourses: data.totalCourses,
          totalStudents: data.totalStudents,
          totalSuccessedPayments: data.totalSuccessedPayments,
        });
        setRevenueTrend(data.revenueTrend);
        setEnrollmentTrend(data.enrollmentTrend);
        setCoursesByCategory(data.coursesByCategory);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAnalaytics();
  }, [user?.userId]);
  const revenueData = {
    labels: revenueMonthes,
    datasets: [
      {
        label: "Revenue ($)",
        data: revenueAmount,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const enrollmentData = {
    labels: enrollmentMonthes,
    datasets: [
      {
        label: "New Enrollments",
        data: enrollmentCount,
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };

  const categoryData = {
    labels: categorys,
    datasets: [
      {
        data: categoryCoursesCount,
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

  return (
    <AdminLayout>
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <ClipLoader size={50} color={"#123abc"} loading={loading} />
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

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Revenue Trend */}
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

              {/* Course Enrollments */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Monthly Enrollments</h3>
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

              {/* Course Categories */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Course Categories</h3>
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

              {/* Top Performing Courses */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">
                  Top Performing Courses
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      title: "Web Development Bootcamp",
                      enrollments: 450,
                      rating: 4.8,
                    },
                    {
                      title: "UI/UX Design Fundamentals",
                      enrollments: 380,
                      rating: 4.7,
                    },
                    {
                      title: "Digital Marketing 101",
                      enrollments: 320,
                      rating: 4.6,
                    },
                  ].map((course, index) => (
                    <div key={index} className="flex justify-between items-center">
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
