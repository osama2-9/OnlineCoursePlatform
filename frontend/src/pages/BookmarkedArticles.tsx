import  { useEffect, useState } from "react";
import {
  Search,
  Clock,
  User,
  Bookmark,
  
  Calendar,
  Loader2,
  X,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";
import { API } from "../API/ApiBaseUrl";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface Article {
  article_id: number;
  categories: any[];
  category: string;
  excerpt: string;
  featured_image: string;
  content_type: string;
  content: string;
  author: {
    full_name: string;
  };
  tags: string[];
  title: string;
  author_id: number;
  created_at: string;
  comments_count: number;
  likes_count: number;
}

interface ArticleResponse {
  success: boolean;
  data: Article[];
}

export const BookmarkedArticles = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [bookmarkArticles, setBookmarkArticles] = useState<Article[]>([])

  const fetchBookmarkedArticles = async () => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      const res = await axios.get<ArticleResponse>(`${API}/articels/get-bookmarks/user/${user?.userId}`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching bookmarked articles:", error);
      throw error;
    }
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["bookmarkedArticles"],
    queryFn: fetchBookmarkedArticles,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, 
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      setBookmarkArticles(data.data);
    }
  }, [data]);

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredArticles = bookmarkArticles?.filter((article: Article) =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bookmark className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Sign in to view bookmarks
          </h2>
          <p className="text-gray-600 mb-6">
            Create an account or sign in to see your bookmarked articles.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <div className="relative w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search bookmarks..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Your Bookmarked Articles
          </h1>
          <p className="text-gray-600">
            {bookmarkArticles?.length || 0} saved articles
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {(error as Error)?.message || "Error loading bookmarked articles"}
                </p>
                <button
                  onClick={() => refetch()}
                  className="mt-2 text-sm text-red-700 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !isError && filteredArticles?.length === 0 && (
          <div className="text-center py-16">
            <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No bookmarked articles yet
            </h2>
            <p className="text-gray-500 mb-6">
              Start bookmarking articles you'd like to read later
            </p>
            <Link
              to="/articels"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Browse Articles
            </Link>
          </div>
        )}

        {!isLoading && !isError && filteredArticles?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article: Article) => (
              <Link
                to={`/articels/read/${article.article_id}`}
                key={article.article_id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={article.featured_image || "/api/placeholder/600/300"}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-600 text-white shadow-sm">
                      {article.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span>{formatDate(article.created_at)}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>{calculateReadTime(article.content)} min read</span>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-blue-700 transition-colors duration-200">
                    {article.title}
                  </h2>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                        <User className="h-4 w-4 text-blue-700" />
                      </div>
                      <span className="text-sm font-medium">
                        {article.author.full_name}
                      </span>
                    </div>

                   
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">
                        {article.likes_count} likes
                      </span>
                      <span className="text-gray-400">
                        {article.comments_count} comments
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkedArticles;
