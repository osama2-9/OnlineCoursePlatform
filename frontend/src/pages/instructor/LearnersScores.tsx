import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  User,
  BookOpen,
  Award,
  Clock,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import { useQuery } from "@tanstack/react-query";
import { InstructorLayout } from "../../layouts/InstructorLayout";

interface User {
  user_id: string;
  full_name: string;
  email: string;
}

interface ScoreData {
  id: string;
  type: string;
  title: string;
  score: number;
  max_score: number;
  submitted_at: string;
  user: User;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface APIResponse {
  data: ScoreData[];
  pagination: PaginationData;
}

interface APIResponseCoursesStats {
  courses: CourseStats[];
}
interface CourseStats {
  assignmentsMarks: number;
  course_id: number;
  quizzesMarks: number;
  required_marks: number;
  title: string;
  totalMarks: number;
}

const LearnersScores = () => {
  const [courseStats, setCourseStats] = useState<CourseStats[]>([]);
  const [selectedType, setSelectedType] = useState<string>("quiz");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const limit = 10;

  const handleFetchScores = async () => {
    try {
      const response = await axios.get<APIResponse>(
        `${API}/instructor/students-marks`,
        {
          params: {
            type: selectedType,
            page: currentPage,
            limit: limit,
          },
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to fetch scores");
      throw error;
    }
  };

  const handleFetchCoursesStats = async () => {
    try {
      const response = await axios.get<APIResponseCoursesStats>(
        `${API}/instructor/courses-stats`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data;
      if (data && Array.isArray(data.courses)) {
        return data.courses;
      }
      return [];
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.error || "Failed to fetch course stats"
      );
      return [];
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["learnerScores", selectedType, currentPage],
    queryFn: handleFetchScores,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });

  const { data: coursesStats, isLoading: isCoursesStatsLoading } = useQuery({
    queryKey: ["courseStats"],
    queryFn: handleFetchCoursesStats,

    staleTime: 5 * 60 * 60 * 1000,
    refetchInterval: 10 * 60 * 60 * 1000,
  });
  useEffect(() => {
    if (coursesStats) {
      setCourseStats(coursesStats);
    }
  }, [coursesStats]);

  const filteredScores =
    data?.data?.filter(
      (score: ScoreData) =>
        score.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        score.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        score.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score: number, maxScore: number): string => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-blue-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setCurrentPage(1);
    setSearchTerm("");
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (isCoursesStatsLoading || isLoading) {
    return (
      <>
        <div className="flex items-center flex-col justify-center min-h-screen">
          <div className="mb-2">
            <Loader2 size={25} className="animate-spin" />
          </div>
          <p className="text-sm">Loading ...</p>
        </div>
      </>
    );
  }

  return (
    <InstructorLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Learner Scores Dashboard
            </h1>
            <p className="text-gray-600">
              Monitor student performance across all your courses
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Course Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courseStats.map((course, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow border border-gray-200 p-6"
                >
                  <div className="flex items-center mb-4">
                    <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {course.title}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Quizzes</span>
                      <span className="text-sm font-medium text-gray-900">
                        {course.quizzesMarks} pts
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Assignments</span>
                      <span className="text-sm font-medium text-gray-900">
                        {course.assignmentsMarks} pts
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">
                          Total Points
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          {course.required_marks}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        {course.totalMarks < course.required_marks && (
                          <>
                            <span className="text-sm text-gray-600">
                              Left to Total Points
                            </span>
                            <span className="text-sm text-gray-900">
                              {" "}
                              {course.required_marks - course.totalMarks}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Filter className="h-5 w-5 text-gray-600" />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleTypeChange("quiz")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedType === "quiz"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Quiz Scores
                  </button>
                  <button
                    onClick={() => handleTypeChange("assignment")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedType === "assignment"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Assignment Scores
                  </button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                {selectedType} Scores ({data?.pagination?.total || 0} total)
              </h3>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500">
                  Failed to load scores. Please try again.
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {selectedType === "quiz" ? "Quiz" : "Assignment"}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredScores.map((score) => (
                      <tr key={score.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {score.user.full_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {score.user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {score.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Award className="h-4 w-4 text-gray-400 mr-2" />
                            <span
                              className={`text-sm font-medium ${getScoreColor(
                                score.score,
                                score.max_score
                              )}`}
                            >
                              {score.score}/{score.max_score}
                            </span>
                            <span className="ml-2 text-sm text-gray-500">
                              (
                              {Math.round(
                                (score.score / score.max_score) * 100
                              )}
                              %)
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDate(score.submitted_at)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredScores.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <div className="text-gray-500">
                      No {selectedType} scores found
                    </div>
                  </div>
                )}
              </div>
            )}

            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {data.pagination.page} of{" "}
                  {data.pagination.totalPages} ({data.pagination.total} total
                  results)
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      handlePageChange(Math.max(currentPage - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      handlePageChange(
                        Math.min(currentPage + 1, data.pagination.totalPages)
                      )
                    }
                    disabled={currentPage === data.pagination.totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
};

export default LearnersScores;
