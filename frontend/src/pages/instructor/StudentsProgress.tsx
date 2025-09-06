import {
  Award,
  BarChart3,
  BookOpen,
  Download,
  Loader2,
  TrendingUp,
  Users,
} from "lucide-react";
import { PaginationControls } from "../../components/instrctor/StudentsProgress/PaginationControls";
import {
  exportCSV,
  getProgressColor,
  getScoreColor,
} from "../../utils/StudentsProgress";
import { CourseCard } from "../../components/instrctor/StudentsProgress/CourseCard";
import { StatsCard } from "../../components/instrctor/StudentsProgress/StatsCard";
import { useMemo, useState } from "react";
import { CourseWithStudents, Pagination } from "../../types/StudentsProgress";
import { useAuth } from "../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { InstructorLayout } from "../../layouts/InstructorLayout";
import axiosClient from "../../API/axios";

const StudentProgressDashboard = () => {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("progress");
  const [currentPage, setCurrentPage] = useState(1);

  const handleFetchStudentsProgress = async () => {
    try {
      const response = await axiosClient.get(
        `/instructor/get-students-progress`,
        {
          params: {
            page: currentPage,
            courseTitle: selectedCourse === "All" ? null : selectedCourse,
          },
        }
      );
      const data = await response.data;
      return data;
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch student progress data.");
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["studentsProgress", user?.userId, currentPage, selectedCourse],
    queryFn: handleFetchStudentsProgress,

    staleTime: 5 * 60 * 60 * 1000,
  });

  const courses: CourseWithStudents[] = data?.data || [];
  const pagination: Pagination = data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  };

  // Flatten students
  const allStudents = useMemo(
    () => courses.flatMap((c) => c.students),
    [courses]
  );

  // Derived Stats
  const totalStudents = allStudents.length;
  const avgProgress =
    allStudents.reduce((sum, s) => sum + parseFloat(s.progress), 0) /
    (totalStudents || 1);
  const certificateEligible = allStudents.filter(
    (s) => s.enrollment.is_eligible_for_certificate
  ).length;

  const filteredStudents = allStudents.filter((s) =>
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === "progress")
      return parseFloat(b.progress) - parseFloat(a.progress);
    if (sortBy === "quizScore")
      return parseFloat(b.avg_quiz_score) - parseFloat(a.avg_quiz_score);
    if (sortBy === "name") return a.full_name.localeCompare(b.full_name);
    return 0;
  });

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen flex flex-col items-center justify-center p-2">
          <div className="flex items-center justify-center mb-2">
            <Loader2 className="animate-spin" size={25} />
          </div>
          <h2 className="text-sm font-semibold text-gray-900 mb-2">
            Loading...
          </h2>
        </div>
      </>
    );
  }

  return (
    <>
      <InstructorLayout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Student Progress Analytics
              </h1>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Students"
                value={totalStudents}
                icon={<Users />}
              />
              <StatsCard
                title="Active Courses"
                value={courses.length}
                icon={<BookOpen />}
              />
              <StatsCard
                title="Avg Progress"
                value={`${avgProgress.toFixed(1)}%`}
                icon={<TrendingUp />}
              />
              <StatsCard
                title="Certificate Ready"
                value={certificateEligible}
                icon={<Award />}
              />
            </div>

            {/* Courses */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {courses.map((c) => (
                <CourseCard key={c.course_id} course={c} />
              ))}
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Student Details</h2>
                <button
                  onClick={() => exportCSV(sortedStudents)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="All">All Courses</option>
                  {courses.map((c) => (
                    <option key={c.course_id} value={c.course_title}>
                      {c.course_title}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-2 border rounded-lg flex-grow"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="progress">Sort by Progress</option>
                  <option value="quizScore">Sort by Quiz Score</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>

              {/* Student Cards */}
              <div className="space-y-4">
                {sortedStudents.length === 0 ? (
                  <p className="text-center text-gray-500 py-12">
                    No students found.
                  </p>
                ) : (
                  sortedStudents.map((s) => (
                    <div
                      key={s.user_id}
                      className="p-4 border rounded-lg flex justify-between"
                    >
                      <div>
                        <h3 className="font-semibold">{s.full_name}</h3>
                        <p className="text-sm text-gray-600">{s.email}</p>
                        <p className="text-sm text-gray-600">
                          {s.enrollment.course_title}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <div
                          className={`px-4 py-2 rounded-md text-sm font-semibold shadow-sm border ${getProgressColor(
                            +s.progress
                          )}`}
                        >
                          <div className="">{s.progress}%</div>
                          <div className="text-xs text-black">
                            Course Progress
                          </div>
                        </div>

                        <div
                          className={`px-4 py-2 rounded-md text-sm font-semibold shadow-sm border ${getScoreColor(
                            +s.avg_quiz_score
                          )}`}
                        >
                          <div className="">{s.avg_quiz_score}%</div>
                          <div className="text-xs text-black">Quiz Score</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              <PaginationControls
                pagination={pagination}
                currentPage={currentPage}
                setPage={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </InstructorLayout>
    </>
  );
};

export default StudentProgressDashboard;
