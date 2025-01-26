import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
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
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import { useAuth } from "../../hooks/useAuth";

interface StudentProgress {
  user_id: number;
  full_name: string;
  progress: string;
  quiz_score: string;
}

interface CourseWiseData {
  course_id: number;
  course_title: string;
  students: StudentProgress[];
}

interface ApiResponse {
  data: CourseWiseData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: any;
  title: any;
}

const BarChart = ({ data, title }: BarChartProps) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export const Analystic = () => {
  const { user } = useAuth();
  const [coursesProgress, setCoursesProgress] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("progress");
  const [currentPage, setCurrentPage] = useState(1);
  const [courseWiseData, setCourseWiseData] = useState<CourseWiseData[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 5,
  });

  const studentsPerPage = 5;

  const getCourseProgressAnalystic = async () => {
    try {
      const res = await axios.get(
        `${API}/instructor/get-analystic/${user?.userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = await res.data;
      if (data) {
        setCoursesProgress(data.courseAnalytics);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    }
  };

  const handleGetLearnersOverview = async () => {
    try {
      const res = await axios.get(
        `${API}/instructor/get-users-progress/${user?.userId}`,
        {
          params: {
            page: currentPage,
            courseTitle: selectedCourse === "All" ? undefined : selectedCourse,
          },
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data: ApiResponse = await res.data;
      if (data) {
        setCourseWiseData(data.data);
        setPagination(data.pagination);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    }
  };

  useEffect(() => {
    getCourseProgressAnalystic();
    handleGetLearnersOverview();
  }, [user?.userId, currentPage, selectedCourse]);

  const courseProgressData = {
    labels: coursesProgress.map((course) => course.title),
    datasets: [
      {
        label: "Average Progress (%)",
        data: coursesProgress.map((course) => parseFloat(course.avgProgress)),
        backgroundColor: "rgba(79, 70, 229, 0.6)",
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
        backgroundColor: "rgba(16, 185, 129, 0.6)",
      },
    ],
  };

  const filteredStudents = courseWiseData.flatMap((course) =>
    course.students.filter((student: any) =>
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const sortedStudents = filteredStudents.sort((a, b) => {
    if (sortBy === "progress") {
      return parseFloat(b.progress) - parseFloat(a.progress);
    } else if (sortBy === "quizScore") {
      return parseFloat(b.quiz_score) - parseFloat(a.quiz_score);
    }
    return 0;
  });

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = sortedStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );

  // Download report as CSV
  const handleDownloadReport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Name,Course,Progress (%),Quiz Score (%)\n" +
      sortedStudents
        .map(
          (student) =>
            `${student.full_name},${selectedCourse},${student.progress},${student.quiz_score}`
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `student_progress_report_${user?.full_name}.csv`
    );
    document.body.appendChild(link);
    link.click();
  };

  return (
    <InstructorLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Course Analytics</h1>

        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Course Progress</h2>
            <BarChart data={courseProgressData} title="Course Progress (%)" />
          </div>

          <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Quiz Scores</h2>
            <BarChart data={quizScoresData} title="Quiz Scores (%)" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Student Progress</h2>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="All">All Courses</option>
              {coursesProgress.map((course) => (
                <option key={course.course_id} value={course.title}>
                  {course.title}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border border-gray-300 rounded-md flex-grow"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="progress">Sort by Progress</option>
              <option value="quizScore">Sort by Quiz Score</option>
            </select>
            <button
              onClick={handleDownloadReport}
              className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Download Report
            </button>
          </div>

          <div className="space-y-4">
            {currentStudents.map((student) => (
              <div
                key={student.user_id}
                className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200"
              >
                <h3 className="text-lg font-medium text-gray-900">
                  {student.full_name}
                </h3>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Course: {selectedCourse}</p>
                  <p>Progress: {student.progress}%</p>
                  <p>Quiz Score: {student.quiz_score}%</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
};
