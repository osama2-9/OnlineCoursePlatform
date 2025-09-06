import { useEffect, useState } from "react";
import { FileText, Video, Filter, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { InstructorLayout } from "../../layouts/InstructorLayout";
import axiosClient from "../../API/axios";

interface Lesson {
  apporval_date: string;
  status: "approved" | "rejected" | "pending";
  lesson_id: number;
  reason: string;
  lessoon_approvel_id: number;
  lesson: {
    title: string;
    description: string;
    lesson_order: number;
    video_url: string;
    attachment: string;
  };
  type?: string;
}

interface Article {
  apporval_date: string;
  status: "approved" | "rejected" | "pending";
  article_approvel_id: number;
  article_id: number;
  reason: string;
  article: {
    title: string;
    excerpt: string;
  };
  type?: string;
}

interface ContentRequest {
  requests: {
    lessons: Lesson[];
    articles: Article[];
  };
}

type ContentItem = (Lesson | Article) & { type: string };

export default function MyContentRequests() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [myContentRequests, setMyContentRequests] = useState<
    ContentRequest | undefined
  >();

  const fetchContentRequests = async () => {
    try {
      const res = await axiosClient.get(`/instructor/get-my-content-requests`, {
        params: {
          instructorId: user?.userId,
        },
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      const data = await res.data;
      if (data) {
        return data;
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
      throw error;
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["contentRequests", user?.userId],
    enabled: !!user?.userId,
    queryFn: fetchContentRequests,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
    retry: 2,
  });

  useEffect(() => {
    if (data) {
      setMyContentRequests(data);
    }
  }, [data]);

  const allContent: ContentItem[] = myContentRequests
    ? [
        ...myContentRequests.requests.lessons.map((item) => ({
          ...item,
          type: "lesson",
        })),
        ...myContentRequests.requests.articles.map((item) => ({
          ...item,
          type: "article",
        })),
      ]
    : [];

  const filteredContent = allContent.filter((item) => {
    const typeMatch = activeTab === "all" || activeTab === item.type;
    const statusMatch = statusFilter === "all" || statusFilter === item.status;
    return typeMatch && statusMatch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your content requests...</p>
        </div>
      </div>
    );
  }

  return (
    <InstructorLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            My Content Requests
          </h1>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab("lesson")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === "lesson"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border"
                }`}
              >
                Lessons
              </button>
              <button
                onClick={() => setActiveTab("article")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === "article"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border"
                }`}
              >
                Articles
              </button>
            </div>

            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border">
              <Filter size={18} className="text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-gray-700"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.length > 0 ? (
              filteredContent.map((item) => (
                <ContentCard
                  key={`${item.type}-${
                    item.type === "lesson"
                      ? (item as Lesson).lesson_id
                      : (item as Article).article_id
                  }`}
                  item={item}
                />
              ))
            ) : (
              <div className="col-span-full text-center p-10 bg-white rounded-lg shadow">
                <p className="text-gray-500">
                  No content matches your filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
}

interface ContentCardProps {
  item: ContentItem;
}

function ContentCard({ item }: ContentCardProps) {
  const isLesson = item.type === "lesson";
  const content = isLesson
    ? (item as Lesson).lesson
    : (item as Article).article;

  const statusColors = {
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
  };

  return (
    <>
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                statusColors[item.status] || "bg-gray-100"
              }`}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Calendar size={14} className="mr-1" />
              {item.apporval_date}
            </div>
          </div>

          <div className="p-4 flex-grow">
            <h3 className="font-bold text-lg text-gray-800 mb-2">
              {content.title}
            </h3>

            <div className="flex items-center text-sm text-gray-500 mb-3">
              <div className="flex items-center mr-3">
                <FileText size={14} className="mr-1" />
                <span>{isLesson ? "Lesson" : "Article"}</span>
              </div>

              {isLesson && (
                <div className="flex items-center">
                  {isLesson && (
                    <span>
                      Order:{" "}
                      {"lesson_order" in content ? content.lesson_order : "N/A"}
                    </span>
                  )}
                </div>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {isLesson
                ? (content as Lesson["lesson"]).description
                : (content as Article["article"]).excerpt}
            </p>

            {item.status === "rejected" && item.reason && (
              <div className="mb-4 p-3 bg-red-50 rounded-md text-sm text-red-700">
                <strong>Rejection reason:</strong> {item.reason}
              </div>
            )}
          </div>

          <div className="p-4 border-t flex justify-between">
            {isLesson && "video_url" in content && content.video_url && (
              <a
                href={content.video_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="text-purple-600 hover:text-purple-800 text-sm flex items-center">
                  <Video size={16} className="mr-1" />
                  Video
                </button>
              </a>
            )}
          </div>
        </div>
    </>
  );
}
