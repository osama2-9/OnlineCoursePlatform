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
import { qureyClinet } from "../../main";
import { Search, Download, Users, TrendingUp, Award, BookOpen, Filter, ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";

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
  color: string;
}

const BarChart = ({ data, color }: BarChartProps) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 500
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: color,
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11
          },
          maxRotation: 45
        }
      }
    }
  };

  return (
    <div className="h-80">
      <Bar data={data} options={options} />
    </div>
  );
};

const StatsCard = ({ icon, title, value, color }: any) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
    <div className="flex items-center justify-between">
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

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

  useEffect(()=>{
    qureyClinet.prefetchQuery({
      queryKey: ["instructorAnalystic", user?.userId],
      queryFn: getCourseProgressAnalystic,
      staleTime: 10 * 60 * 1000,
      retry: 2,
    })

    qureyClinet.prefetchQuery({
      queryKey: ["instructorAnalystic", user?.userId],
      queryFn: handleGetLearnersOverview,
      staleTime: 10 * 60 * 1000,
      retry: 2,
    })
  }, [user?.userId])

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
        backgroundColor: "rgba(99, 102, 241, 0.8)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 2,
        borderRadius: 6,
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
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
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

  const getProgressColor = (progress: string) => {
    const prog = parseFloat(progress);
    if (prog >= 80) return "bg-green-500";
    if (prog >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreColor = (score: string) => {
    const sc = parseFloat(score);
    if (sc >= 80) return "bg-blue-500";
    if (sc >= 60) return "bg-purple-500";
    return "bg-pink-500";
  };

  const totalStudents = filteredStudents.length;
  const avgProgress = filteredStudents.length > 0 
    ? (filteredStudents.reduce((sum, student) => sum + parseFloat(student.progress), 0) / filteredStudents.length).toFixed(1)
    : "0";
  const avgQuizScore = filteredStudents.length > 0 
    ? (filteredStudents.reduce((sum, student) => sum + parseFloat(student.quiz_score), 0) / filteredStudents.length).toFixed(1)
    : "0";

  return (
    <InstructorLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Analytics</h1>
          <p className="text-gray-600">Track your students' progress and performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={<Users className="w-6 h-6 text-blue-600" />}
            title="Total Students"
            value={totalStudents}
            color="bg-blue-100"
          />
          <StatsCard
            icon={<BookOpen className="w-6 h-6 text-green-600" />}
            title="Active Courses"
            value={coursesProgress.length}
            color="bg-green-100"
          />
          <StatsCard
            icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
            title="Avg Progress"
            value={`${avgProgress}%`}
            color="bg-purple-100"
          />
          <StatsCard
            icon={<Award className="w-6 h-6 text-orange-600" />}
            title="Avg Quiz Score"
            value={`${avgQuizScore}%`}
            color="bg-orange-100"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Course Progress</h2>
            </div>
            <BarChart data={courseProgressData} color="rgba(99, 102, 241, 1)" />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Quiz Scores</h2>
            </div>
            <BarChart data={quizScoresData} color="rgba(16, 185, 129, 1)" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Student Progress</h2>
              </div>
              <button
                onClick={handleDownloadReport}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="All">All Courses</option>
                  {coursesProgress.map((course) => (
                    <option key={course.course_id} value={course.title}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex-grow">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="progress">Sort by Progress</option>
                <option value="quizScore">Sort by Quiz Score</option>
              </select>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {currentStudents.map((student) => (
                <div
                  key={student.user_id}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {student.full_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {student.full_name}
                        </h3>
                        <p className="text-sm text-gray-600">Course: {selectedCourse}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getProgressColor(student.progress)}`}></div>
                          <span className="text-sm font-medium text-gray-600">Progress</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{student.progress}%</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getScoreColor(student.quiz_score)}`}></div>
                          <span className="text-sm font-medium text-gray-600">Quiz Score</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{student.quiz_score}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm text-gray-600">
                Page <span className="font-medium">{currentPage}</span> of{" "}
                <span className="font-medium">{pagination.totalPages}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
};