import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../API/axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface EnrollmentsData {
  courseName: string;
  count: number;
}

const TopCoursesChart = () => {
  const [enrollmentsData, setEnrollmentsData] = useState<EnrollmentsData[]>([]);

  const getEnrollmentsData = async () => {
    try {
      const { data } = await axiosClient.get(`/admin/top-enrolled-courses`);

      return data;
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "An error occurred");
    }
  };

  const { data, isError } = useQuery({
    queryKey: ["adminTopCourses"],
    queryFn: getEnrollmentsData,
    retry: 2,
    refetchInterval: 10 * 60 * 1000,
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    setEnrollmentsData(data);
  }, [data]);

  if (isError) {
    return (
      <p className="flex justify-center items-center text-center text-red-500">
        Error fetcing data
      </p>
    );
  }

  const chartData = {
    labels: enrollmentsData?.map((course) => course.courseName),
    datasets: [
      {
        label: "Enrollments",
        data: enrollmentsData?.map((course) => course.count),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Top Courses by Enrollment",
        font: {
          size: 20,
        },
      },
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Courses",
        },
      },
      y: {
        title: {
          display: true,
          text: "Enrollments",
        },
        beginAtZero: true,
      },
    },
  };
  return (
    <div className="overflow-x-auto ">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default TopCoursesChart;
