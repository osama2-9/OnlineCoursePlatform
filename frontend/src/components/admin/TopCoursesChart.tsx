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
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";

// Register Chart.js components
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
      const res = await axios.get(`${API}/admin/top-enrolled-courses`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      const data = await res.data;
      if (data) {
        setEnrollmentsData(data);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "An error occurred");
    }
  };

  useEffect(() => {
    getEnrollmentsData();
  }, []);
  console.log(enrollmentsData);

  const chartData = {
    labels: enrollmentsData.map((course) => course.courseName),
    datasets: [
      {
        label: "Enrollments",
        data: enrollmentsData.map((course) => course.count),
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
