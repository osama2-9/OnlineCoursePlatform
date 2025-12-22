import { useEffect, useState } from "react";
import { InstructorLayout } from "../../layouts/InstructorLayout";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { Award, BarChart3, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BarChartComponent } from "../../components/instrctor/BarChart";
import axiosClient from "../../API/axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const Analystic = () => {
  const { user } = useAuth();
  const [coursesProgress, setCoursesProgress] = useState<any[]>([]);

  const getCourseProgressAnalystic = async () => {
    try {
      const res = await axiosClient.get(
        `/instructor/get-analystic`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = await res.data;
      if (data) {
        return data.courseAnalytics;
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    }
  };

  const { data } = useQuery({
    queryKey: ["instructorenrollments", user?.userId],
    queryFn: getCourseProgressAnalystic,
    staleTime: 24 * 60 * 1000 * 60,
    refetchInterval: 24 * 60 * 1000 * 60,
    retry: 2,
  });

  useEffect(() => {
    if (data) {
      setCoursesProgress(data);
    }
  }, [data]);

  const courseProgressData = {
    labels: coursesProgress.map((course) => course.title),
    datasets: [
      {
        label: "Average Progress (%)",
        data: coursesProgress.map((course) => parseFloat(course.avgProgress)),
        backgroundColor: "#3B82F6",
        borderColor: "#1D4ED8",
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const quizScoresData = {
    labels: coursesProgress.map((course) => course.title),
    datasets: [
      {
        label: "Average Quiz Score (%)",
        data: coursesProgress.map((course) =>
          parseFloat(course.totalScorePercentage)
        ),
        backgroundColor: "#10B981",
        borderColor: "#059669",
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  return (
    <InstructorLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Course Analytics
              </h1>
            </div>
            <p className="text-gray-600">
              Monitor student progress and course performance metrics
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Course Progress
                    </h2>
                    <p className="text-sm text-gray-600">
                      Average completion by course
                    </p>
                  </div>
                </div>
              </div>
              <BarChartComponent data={courseProgressData} color="#3B82F6" />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Award className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Quiz Performance
                    </h2>
                    <p className="text-sm text-gray-600">
                      Average scores by course
                    </p>
                  </div>
                </div>
              </div>
              <BarChartComponent data={quizScoresData} color="#10B981" />
            </div>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
};
