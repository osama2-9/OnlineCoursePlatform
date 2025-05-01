import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Film,
  FileText,
  Calendar,
  User,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import { useAuth } from "../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

interface Requests {
  type: string;
  status: string;
  lesson?: {
    title: string;
    lesson_id: number;
    video_url?: string;
  };
  article?: {
    title: string;
    article_id: number;
  };
  apporval_date?: string;
  approved_by?: string;
  reason?: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminRequestsDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [requests, setRequests] = useState<Requests[]>([]);
  const itemsPerPage = 10;

  const fetchContentData = async () => {
    try {
      const res = await axios.get(`${API}/admin/content-publish-requests`, {
        params: {
          userId: user?.userId,
          page: currentPage,
          limit: itemsPerPage,
        },
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      const data = await res.data;
      return data.requests;
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong!");
      return [];
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["contentRequests"],
    queryFn: fetchContentData,
    refetchOnWindowFocus: false,
    retry: 2,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (data) {
      setRequests(data);
    }
  }, [data]);

  const filteredRequests = requests.filter((request) => {
    if (activeTab === "lessons" && request.type !== "lesson") return false;
    if (activeTab === "articles" && request.type !== "article") return false;

    const title = request.lesson?.title || request.article?.title || "";
    if (searchQuery && !title.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;

    if (statusFilter !== "all" && request.status !== statusFilter) return false;

    return true;
  });

  const totalItems = filteredRequests.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Content Publish Requests
          </h1>
          <p className="text-gray-600 mt-2">Review content approval requests</p>
        </div>

        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Requests
              </button>
              <button
                onClick={() => setActiveTab("lessons")}
                className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                  activeTab === "lessons"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Film size={16} />
                Lessons
              </button>
              <button
                onClick={() => setActiveTab("articles")}
                className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                  activeTab === "articles"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FileText size={16} />
                Articles
              </button>
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title..."
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search
                  size={16}
                  className="absolute left-3 top-3 text-gray-400"
                />
              </div>

              <div className="relative">
                <select
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="pending">Pending</option>
                </select>
                <Filter
                  size={16}
                  className="absolute left-3 top-3 text-gray-400"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">
              Content Requests
            </h2>
            <p className="text-sm text-gray-500">{totalItems} requests found</p>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
                <div className="flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-blue-600" size={24} />
              <p className="text-gray-500 mt-3">Loading requests...</p>

                </div>

            </div>
          ) : totalItems === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No matching requests found</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {currentItems
                .filter((ele) => ele.approved_by != null)
                .map((request, index) => {
                  const isLesson = request.type === "lesson" || request.lesson;
                  const title = isLesson
                    ? request.lesson?.title
                    : request.article?.title;
                  const id = isLesson
                    ? request.lesson?.lesson_id
                    : request.article?.article_id;

                  return (
                    <li key={index} className="p-4 hover:bg-gray-50">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-md ${
                              isLesson ? "bg-purple-100" : "bg-green-100"
                            }`}
                          >
                            {isLesson ? (
                              <Film size={20} className="text-purple-600" />
                            ) : (
                              <FileText size={20} className="text-green-600" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-gray-900">
                                {title}
                              </h3>
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  request.status === "approved"
                                    ? "bg-green-100 text-green-800"
                                    : request.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {request.status === "approved" ? (
                                  <div className="flex items-center gap-1">
                                    <CheckCircle size={12} />
                                    <span>Approved</span>
                                  </div>
                                ) : request.status === "rejected" ? (
                                  <div className="flex items-center gap-1">
                                    <XCircle size={12} />
                                    <span>Rejected</span>
                                  </div>
                                ) : (
                                  "Pending"
                                )}
                              </span>
                            </div>

                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>
                                  {request.apporval_date
                                    ? formatDate(request.apporval_date)
                                    : "Pending Review"}
                                </span>
                              </div>

                              {request.approved_by && (
                                <div className="flex items-center gap-1">
                                  <User size={14} />
                                  <span>{request.approved_by}</span>
                                </div>
                              )}

                              <div>
                                <span className="text-gray-400">
                                  ID:{" "}
                                  {isLesson
                                    ? `Lesson #${id}`
                                    : `Article #${id}`}
                                </span>
                              </div>
                            </div>

                            {request.reason && (
                              <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                                <strong>Rejection reason:</strong>{" "}
                                {request.reason}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {isLesson && request.lesson?.video_url && (
                            <a
                              href={request.lesson.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                            >
                              View Video
                            </a>
                          )}

                          <button className="text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                            View Details
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
            </ul>
          )}

          {totalItems > 0 && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {totalItems > 0 ? indexOfFirstItem + 1 : 0} to{" "}
                  {Math.min(indexOfLastItem, totalItems)} of {totalItems}{" "}
                  results
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-md ${
                        currentPage === 1
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(totalPages, 5) }).map(
                        (_, idx) => {
                          let pageNumber;

                          if (totalPages <= 5) {
                            pageNumber = idx + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = idx + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + idx;
                          } else {
                            pageNumber = currentPage - 2 + idx;
                          }

                          if (pageNumber <= totalPages) {
                            return (
                              <button
                                key={pageNumber}
                                onClick={() => paginate(pageNumber)}
                                className={`w-8 h-8 flex items-center justify-center rounded-md ${
                                  currentPage === pageNumber
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          }
                          return null;
                        }
                      )}
                    </div>

                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-md ${
                        currentPage === totalPages
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      aria-label="Next page"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
