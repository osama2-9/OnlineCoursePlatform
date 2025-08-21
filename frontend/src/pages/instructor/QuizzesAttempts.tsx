import { useEffect, useState } from "react";
import { InstructorLayout } from "../../layouts/InstructorLayout";
import toast from "react-hot-toast";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { useQuery } from "@tanstack/react-query";
import { Clock, User, Filter, ChevronLeft, ChevronRight, Eye, FileText, Trophy, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface User {
  full_name: string;
  user_id: number;
}

interface Attempt {
  user: User;
  score: number;
  attempt_id: number;
  start_time: string;
  end_time: string;
}

interface Quiz {
  quiz_id: number;
  course_id: number;
  title: string;
  duration: number;
  Attempt: Attempt[];
  total_marks:number
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface QuizzesResponse {
  data: Quiz[];
  pagination: Pagination;
}

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

const QuizzesAttempts = () => {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<Quiz[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filter, setFilter] = useState<"all" | "reviewed" | "not-reviewed">(
    "all"
  );
  const [quizFilter, setQuizFilter] = useState<number | "all">("all");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const getUsersAttempts = async (page: number = 1, limit: number = 7) => {
    try {
      setLoading(true);
      const res = await axios.get<QuizzesResponse>(
        `${API}/instructor/get-quizzes-attempts/${user?.userId}`,
        {
          params: { page, limit },
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      const data = res.data;
      return data;
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to fetch attempts");
    } finally {
      setLoading(false);
    }
  };

  const { data ,isLoading } = useQuery({
    queryKey: ["quizzes", user?.userId, pagination.page, pagination.limit],
    queryFn: () => getUsersAttempts(pagination.page, pagination.limit),
    staleTime: 15 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
    retry: 2,
    enabled: !!user?.userId,
  });

  useEffect(() => {
    if (data) {
      setQuizzes(data.data);
      setAttempts(data.data);
      setPagination(data.pagination);
    }
  }, [data]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleReview = (
    attemptId: number,
    quizId: number,
    courseId: number
  ) => {
    navigate(`/instructor/review/${attemptId}`, {
      state: { quizId, courseId },
    });
  };

  const filteredAttempts = attempts
    .filter((quiz) => quizFilter === "all" || quiz.quiz_id === quizFilter)
    .map((quiz) =>
      quiz.Attempt.filter((attempt) => {
        if (filter === "reviewed") {
          return attempt.score > 0;
        } else if (filter === "not-reviewed") {
          return attempt.score === 0;
        } else {
          return true;
        }
      }).map((attempt) => ({ ...quiz, Attempt: [attempt] }))
    )
    .flat();

  const getScoreColor = (score: number) => {
    if (score === 0) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 60) return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getScoreIcon = (score: number) => {
    if (score === 0) return <AlertCircle className="w-4 h-4" />;
    if (score >= 80) return <Trophy className="w-4 h-4" />;
    return <CheckCircle2 className="w-4 h-4" />;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const totalAttempts = filteredAttempts.length;
  const reviewedAttempts = filteredAttempts.filter(quiz => quiz.Attempt[0].score > 0).length;
  const pendingAttempts = totalAttempts - reviewedAttempts;
  const avgScore = totalAttempts > 0 ? 
    (filteredAttempts.reduce((sum, quiz) => sum + quiz.Attempt[0].score, 0) / totalAttempts).toFixed(1) : "0";


    if(isLoading){
      return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" size={24} /></div>
    }

  return (
    <InstructorLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Attempts</h1>
          <p className="text-gray-600">Review and manage student quiz submissions</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={<FileText className="w-6 h-6 text-blue-600" />}
            title="Total Attempts"
            value={totalAttempts}
            color="bg-blue-100"
          />
          <StatsCard
            icon={<CheckCircle2 className="w-6 h-6 text-green-600" />}
            title="Reviewed"
            value={reviewedAttempts}
            color="bg-green-100"
          />
          <StatsCard
            icon={<AlertCircle className="w-6 h-6 text-yellow-600" />}
            title="Pending Review"
            value={pendingAttempts}
            color="bg-yellow-100"
          />
          <StatsCard
            icon={<Trophy className="w-6 h-6 text-purple-600" />}
            title="Average Score"
            value={`${avgScore}/full mark`}
            color="bg-purple-100"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Quiz
              </label>
              <select
                value={quizFilter}
                onChange={(e) =>
                  setQuizFilter(
                    e.target.value === "all" ? "all" : parseInt(e.target.value)
                  )
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Quizzes</option>
                {quizzes.map((quiz) => (
                  <option key={quiz.quiz_id} value={quiz.quiz_id}>
                    {quiz.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value as "all" | "reviewed" | "not-reviewed")
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Attempts</option>
                <option value="reviewed">Reviewed</option>
                <option value="not-reviewed">Not Reviewed</option>
              </select>
            </div>
          </div>
        </div>

        {filteredAttempts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No quiz attempts found</h3>
            <p className="text-gray-600">
              Try adjusting your filters or check back later for new submissions
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <ClipLoader size={40} color="#3B82F6" />
              </div>
            ) : (
              <>
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Quiz</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Student</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Duration</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Started</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Completed</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Score</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredAttempts.map((quiz) =>
                        quiz.Attempt.map((attempt) => {
                          const startTime = formatDateTime(attempt.start_time);
                          const endTime = formatDateTime(attempt.end_time);
                          
                          return (
                            <tr key={attempt.attempt_id} className="hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-6">
                                <div className="flex items-center">
                                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{quiz.title}</p>
                                    <p className="text-sm text-gray-600">Quiz ID: {quiz.quiz_id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center">
                               
                                  <span className="font-medium text-gray-900">{attempt.user.full_name}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center text-gray-600">
                                  <Clock className="w-4 h-4 mr-2" />
                                  {quiz.duration} mins
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="text-sm">
                                  <p className="font-medium text-gray-900">{startTime.date}</p>
                                  <p className="text-gray-600">{startTime.time}</p>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="text-sm">
                                  <p className="font-medium text-gray-900">{endTime.date}</p>
                                  <p className="text-gray-600">{endTime.time}</p>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(attempt.score)}`}>
                                  {getScoreIcon(attempt.score)}
                                  {attempt.score === 0 ? 'Pending' : `${attempt.score}/${quiz.total_marks}`}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <button
                                  onClick={() => handleReview(attempt.attempt_id, quiz.quiz_id, quiz.course_id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                  <Eye className="w-4 h-4" />
                                  Review
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="lg:hidden p-4 space-y-4">
                  {filteredAttempts.map((quiz) =>
                    quiz.Attempt.map((attempt) => {
                      const startTime = formatDateTime(attempt.start_time);
                      const endTime = formatDateTime(attempt.end_time);
                      
                      return (
                        <div key={attempt.attempt_id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center">
                              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                <FileText className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{quiz.title}</p>
                                <p className="text-sm text-gray-600">Duration: {quiz.duration} mins</p>
                              </div>
                            </div>
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(attempt.score)}`}>
                              {getScoreIcon(attempt.score)}
                              {attempt.score === 0 ? 'Pending' : `${attempt.score}/${quiz.total_marks}`}
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            
                            <span className="font-medium text-gray-900">{attempt.user.full_name}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Started</p>
                              <p className="font-medium">{startTime.date}</p>
                              <p className="text-gray-600">{startTime.time}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Completed</p>
                              <p className="font-medium">{endTime.date}</p>
                              <p className="text-gray-600">{endTime.time}</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleReview(attempt.attempt_id, quiz.quiz_id, quiz.course_id)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            Review
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-600">
                      Page <span className="font-medium">{pagination.page}</span> of{" "}
                      <span className="font-medium">{pagination.totalPages}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </InstructorLayout>
  );
};

export default QuizzesAttempts;