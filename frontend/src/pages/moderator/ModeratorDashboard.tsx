import { useState, useEffect } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  RefreshCw,
  Clock,
  BookOpen,
  FileText,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import {
  Article,
  Content,
  FetchContentResponse,
  Lesson,
} from "../../types/ModerationDashboardTypes";
import ArticleContent from "../../components/moderator/ArticleContent";
import LessonContent from "../../components/moderator/LessonContent";

export default function ContentModeratorDashboard() {
  const { user } = useAuth();
  const [selectedContent, setSelectedContent] = useState<
    Article | Lesson | null
  >(null);
  const [contentList, setContentList] = useState<Content[]>([]);
  const [filteredContent, setFilteredContent] = useState<Content[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isApproveLoading, setIsApproveLoading] = useState(false);
  const [isRejectLoading, setIsRejectLoading] = useState(false);
  const [moderatorNote, setModeratorNote] = useState("");

  const fetchRequests = async () => {
    try {
      const res = await axios.get<FetchContentResponse>(
        `${API}/moderator/get-content`,
        {
          params: {
            userId: user?.userId,
          },
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = res.data;
      if (data) {
        return data.requests;
      }
      return [];
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to fetch content");
      throw error;
    }
  };

  const { data: contentData, isLoading: isContentLoading } = useQuery({
    queryKey: ["moderator_content", user?.userId],
    queryFn: fetchRequests,
    enabled: !!user?.userId,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    if (contentData) {
      setContentList(contentData);
      setFilteredContent(contentData);
    }
  }, [contentData]);

  const fetchContentDetails = async (contentId: number, type: string) => {
    try {
      setIsLoadingDetails(true);
      const res = await axios.get(`${API}/moderator/get-content-details`, {
        params: {
          contentId,
          type,
        },
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      return res.data;
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Failed to fetch content details"
      );
      throw error;
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSelectContent = async (contentId: number, type: string) => {
    try {
      setIsLoadingDetails(true);
      const contentDetailsData = await fetchContentDetails(contentId, type);
      setSelectedContent(contentDetailsData);
    } catch (error) {
      console.error("Error fetching content details:", error);
      setSelectedContent(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };
  useEffect(() => {
    if (contentList.length > 0) {
      let filtered = [...contentList];

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.title.toLowerCase().includes(term) ||
            item.author_name.toLowerCase().includes(term) ||
            (item.description && item.description.toLowerCase().includes(term))
        );
      }

      if (filterStatus !== "all") {
        filtered = filtered.filter((item) => item.status === filterStatus);
      }

      if (filterType !== "all") {
        filtered = filtered.filter((item) => item.type === filterType);
      }

      setFilteredContent(filtered);
    }
  }, [searchTerm, filterStatus, filterType, contentList]);

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterType("all");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleApprove = async (contentId: any) => {
    contentId =
      selectedContent?.type == "article"
        ? selectedContent.article_approvel_id
        : selectedContent?.lesson_approvel_id;
    try {
      setIsApproveLoading(true);
      const res = await axios.post(
        `${API}/moderator/approve`,
        {
          Id: contentId,
          status: "approved",
          approved_by: user?.userId,
          type: selectedContent?.type,
          reason: moderatorNote,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = await res.data;
      if (data) {
        toast.success(data.message);
      }
      setContentList((prevContent) => {
        return prevContent.map((item) => ({
          ...item,
          status:
            item.content_approbvel_Id === contentId ||
            item.content_approbvel_Id === contentId
              ? "approved"
              : item.status,
        }));
      });
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to approve");
    } finally {
      setIsApproveLoading(false);
    }
  };

  const handleReject = async (contentId: any) => {
    contentId =
      selectedContent?.type == "article"
        ? selectedContent.article_approvel_id
        : selectedContent?.lesson_approvel_id;
    try {
      setIsRejectLoading(true);
      const res = await axios.post(
        `${API}/moderator/reject`,
        {
          Id: contentId,
          status: "rejected",
          approved_by: user?.userId,
          type: selectedContent?.type,
          reason: moderatorNote,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = await res.data;
      if (data) {
        toast.success(data.message);
      }
      setContentList((prevContent) => {
        return prevContent.map((item) => ({
          ...item,
          status:
            item.content_approbvel_Id === contentId ||
            item.content_approbvel_Id === contentId
              ? "rejected"
              : item.status,
        }));
      });
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to reject");
    } finally {
      setIsRejectLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">
              Content Moderator Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Moderator Role
              </span>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  M
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {user?.full_name || "Moderator"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex">
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by title, author, or description..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="mt-3 flex justify-between items-center">
              <div className="flex space-x-2">
                <select
                  className="block pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  className="block pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="article">Articles</option>
                  <option value="lesson">Lessons</option>
                </select>
              </div>

              <button
                onClick={resetFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Reset
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isContentLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 text-gray-400 mx-auto animate-spin" />
                  <p className="mt-2 text-sm text-gray-500">
                    Loading content...
                  </p>
                </div>
              </div>
            ) : filteredContent.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="mt-2 text-gray-500">
                    No content found matching your filters
                  </p>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredContent.map((item, idx) => (
                  <li
                    key={idx}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedContent &&
                      ((selectedContent.type === "article" &&
                        item.type === "article" &&
                        (selectedContent as Article).article_id ===
                          item.contentId) ||
                        (selectedContent.type === "lesson" &&
                          item.type === "lesson" &&
                          (selectedContent as Lesson).lesson_id ===
                            item.contentId))
                        ? "bg-gray-100"
                        : ""
                    }`}
                    onClick={() =>
                      handleSelectContent(item.contentId, item.type)
                    }
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {item.type === "article" ? (
                            <FileText className="h-5 w-5 text-gray-400 mr-2" />
                          ) : (
                            <BookOpen className="h-5 w-5 text-gray-400 mr-2" />
                          )}
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.title.length > 40
                              ? item.title.substring(0, 40).concat("...")
                              : item.title}
                          </p>
                        </div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {getStatusIcon(item.status)}
                          <span className="ml-1 capitalize">{item.status}</span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            By {item.author_name}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>{formatDate(item.created_at)}</p>
                        </div>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {item.description
                            ? item.description.length > 100
                              ? item.description.substring(0, 100).concat("...")
                              : item.description
                            : "No description available"}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="w-2/3 flex flex-col bg-white">
          {isLoadingDetails ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">
                  Loading content details...
                </p>
              </div>
            </div>
          ) : selectedContent ? (
            selectedContent.type === "article" ? (
              <ArticleContent
                isRejectLoading={isRejectLoading}
                handleReject={(id) => handleReject(id)}
                article={selectedContent as Article}
                handleApprove={(id) => handleApprove(id)}
                isApproveLoading={isApproveLoading}
                setModerationNote={setModeratorNote}
                moderationNote={moderatorNote}
              />
            ) : (
              <LessonContent
                isRejectLoading={isRejectLoading}
                setModerationNote={setModeratorNote}
                moderationNote={moderatorNote}
                handleReject={(id) => handleReject(id)}
                lesson={selectedContent as Lesson}
                handleApprove={(id) => handleApprove(id)}
                isApproveLoading={isApproveLoading}
              />
            )
          ) : (
            <div className="flex items-center justify-center h-full text-center p-6">
              <div>
                <Filter className="h-12 w-12 text-gray-400 mx-auto" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No content selected
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select content from the list to preview and moderate.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Content Moderation Dashboard • {filteredContent.length} of{" "}
              {contentList.length} items shown
            </div>
            <div className="text-sm text-gray-500">
              <span className="font-medium text-gray-900">
                {contentList.filter((item) => item.status === "pending").length}
              </span>{" "}
              pending •
              <span className="font-medium text-gray-900 ml-1">
                {
                  contentList.filter((item) => item.status === "approved")
                    .length
                }
              </span>{" "}
              approved •
              <span className="font-medium text-gray-900 ml-1">
                {
                  contentList.filter((item) => item.status === "rejected")
                    .length
                }
              </span>{" "}
              rejected
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
