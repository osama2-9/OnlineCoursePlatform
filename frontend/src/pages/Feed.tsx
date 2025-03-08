import React, { useState, useEffect } from "react";
import {
  Search,
  Clock,
  MessageSquare,
  Filter,
  ChevronDown,
  ArrowUp,
  User,
  Bookmark,
  TrendingUp,
  Loader2,
  X,
  Share2,
  Calendar,
  Plus,
  ThumbsUp
} from "lucide-react";
import axios from "axios";
import { API } from "../API/ApiBaseUrl";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useGetCategories } from "../hooks/useGetCategories";
import toast from "react-hot-toast";

interface ContentBlock {
  block_id: number;
  article_id: number;
  order: number;
  block_type: string;
  content: string | null;
  code_language: string | null;
  code_content: string | null;
  image_url: string | null;
  image_caption: string | null;
  video_url: string | null;
}

interface Pagination {
  totalArticles: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface Article {
  article_id: number;
  categories: any[];
  category: string;
  content_blocks: ContentBlock[];
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
  comments_count:number,
  likes_count:number
}

interface ArticleResponse {
  success: boolean;
  data: Article[];
  pagination: Pagination;
}

export const Feed = () => {
  const { user } = useAuth();
  const isAdminOrInstructor =
    user && (user.role === "admin" || user.role === "instructor");

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (showProfileMenu && !event.target.closest(".profile-menu-container")) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  const fetchArticles = async () => {
    try {
      const res = await axios.get(`${API}/articels/get-articles`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        params: {
          page,
          category: selectedCategory !== "All" ? selectedCategory : undefined,
          sort: sortBy,
          search: searchTerm || undefined,
        },
      });
      return res.data as ArticleResponse;
    } catch (error) {
      console.error("Error fetching articles:", error);
      throw error;
    }
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["articles", page, selectedCategory, sortBy, searchTerm],
    queryFn: fetchArticles,
    staleTime: 24 * 1000 * 60,
    refetchInterval: 24 * 1000 * 60,
    retry: 2,
    refetchOnWindowFocus: false,
  });

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

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleSortChange = (sortOption: string) => {
    setSortBy(sortOption);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const resetFilters = () => {
    setSelectedCategory("All");
    setSortBy("latest");
    setSearchTerm("");
    setPage(1);
  };

  const { categoriesOptions } = useGetCategories();

  const copyToClipboard = (articleId: number) => {
    const baseURL = import.meta.env.VITE_BASE_URL_CLIENT
    navigator.clipboard.writeText(`${baseURL}/articels/read/${articleId}`);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
     

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center md:text-left md:flex md:justify-between md:items-center">
            <div className="mb-6 md:mb-0 md:max-w-2xl">
              <h1 className="text-4xl font-extrabold tracking-tight mb-3">
                Discover Tech Knowledge
              </h1>
              <p className="text-xl text-blue-100 max-w-xl mx-auto md:mx-0">
                Explore our curated collection of expert articles on web
                development, AI, data science, and more.
              </p>

              {isAdminOrInstructor && (
                <div className="mt-4 px-4 py-2 bg-blue-500 rounded-lg inline-block animate-pulse">
                  <p className="text-white font-medium">
                    Welcome, {user.full_name}! Ready to share your knowledge?
                  </p>
                </div>
              )}
            </div>

            <div className="w-full md:w-auto">
              <div className="flex items-center gap-4 mb-4">
                <form onSubmit={handleSearch} className="relative flex-1">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search articles..."
                    className="pl-10 pr-4 py-3 rounded-full border-none w-full md:w-64 text-gray-800 shadow-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
                  />
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                  <button
                    type="submit"
                    className="absolute right-3 top-2 bg-blue-500 hover:bg-blue-600 rounded-full p-1.5 text-white transition-colors duration-200"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </form>

                {user && (
                  <Link
                    to="/bookmarks"
                    className="p-3 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg transition-colors duration-200"
                    title="View Bookmarked Articles"
                  >
                    <Bookmark className="h-5 w-5 text-white" />
                  </Link>
                )}
              </div>

              {isAdminOrInstructor && (
                <Link
                  to="/articels/create"
                  className="mt-4 md:mt-3 md:hidden inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-md transition-colors duration-200 font-medium text-sm"
                >
                  <Plus className="h-4 w-4" /> Create New Article
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">
              Browse Articles
            </h2>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {showFilters ? (
                  <X className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="bg-blue-50 p-4 rounded-xl mb-2 border border-blue-100 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {categoriesOptions.map((category) => (
                      <button
                        key={category.category_id}
                        onClick={() => handleCategoryChange(category.name)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                          selectedCategory === category.name
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Sort By</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleSortChange("latest")}
                      className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-all duration-200 ${
                        sortBy === "latest"
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <Clock className="h-3 w-3" /> Latest
                    </button>
                    <button
                      onClick={() => handleSortChange("popular")}
                      className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-all duration-200 ${
                        sortBy === "popular"
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <TrendingUp className="h-3 w-3" /> Popular
                    </button>
                    <button
                      onClick={() => handleSortChange("comments")}
                      className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-all duration-200 ${
                        sortBy === "comments"
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <MessageSquare className="h-3 w-3" /> Most Discussed
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-blue-200 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {selectedCategory !== "All" && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center">
                    {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory("All")}
                      className="ml-1 hover:text-blue-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {sortBy !== "latest" && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center">
                    Sort: {sortBy}
                    <button
                      onClick={() => setSortBy("latest")}
                      className="ml-1 hover:text-blue-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {searchTerm && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center">
                    Search: {searchTerm}
                    <button
                      onClick={() => setSearchTerm("")}
                      className="ml-1 hover:text-blue-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {(selectedCategory !== "All" ||
                  sortBy !== "latest" ||
                  searchTerm) && (
                  <button
                    onClick={resetFilters}
                    className="text-xs px-2 py-1 text-blue-700 hover:text-blue-900 ml-auto"
                  >
                    Reset all
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex flex-col justify-center items-center py-20">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <span className="text-xl text-gray-600">
              Loading the latest articles...
            </span>
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-6 rounded-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-lg font-medium">Error loading articles</p>
                <p className="mt-2">
                  {(error as Error)?.message || "Please try again later."}
                </p>
                <button
                  onClick={() => refetch()}
                  className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !isError && data?.data && (
          <>
            <div className="mb-6 text-gray-600">
              Showing {data.data.length} of{" "}
              {data.pagination?.totalArticles || 0} articles
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
              {searchTerm && ` matching "${searchTerm}"`}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.data.map((article) => (
                <Link
                  to={`/articels/read/${article.article_id}`}
                  key={article.article_id}
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group">
                    <div className="h-52 overflow-hidden relative">
                      <img
                        src={
                          article.featured_image || "/api/placeholder/600/300"
                        }
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      <div className="absolute top-3 right-3 flex space-x-2">
                        <button  className="p-2 bg-white rounded-full hover:bg-blue-50 transition-colors duration-200 shadow-sm">
                          <Bookmark className="h-4 w-4 text-blue-700" />
                        </button>
                        <button onClick={()=>copyToClipboard(article?.article_id)}  className="p-2 bg-white rounded-full hover:bg-blue-50 transition-colors duration-200 shadow-sm">
                          <Share2 className="h-4 w-4 text-blue-700" />
                        </button>
                      </div>

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
                          <span>
                            {calculateReadTime(article.content)} min read
                          </span>
                        </div>
                      </div>

                      <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-blue-700 transition-colors duration-200">
                        {article.title}
                      </h2>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>

                      <div className="mb-5 flex flex-wrap gap-1">
                        {article.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                          >
                            {tag}
                          </span>
                        ))}
                        {article.tags.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                            +{article.tags.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center mr-2 text-blue-700">
                            <User className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium">
                            {article.author.full_name}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors duration-200">
                            <ThumbsUp className="h-4 w-4" />
                            {article.likes_count}
                          </button>
                          <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors duration-200">
                            <MessageSquare className="h-4 w-4" />
                            {article.comments_count}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {!isLoading && data?.data?.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Search className="h-10 w-10 text-blue-300" />
            </div>
            <h3 className="text-2xl font-medium text-gray-700 mb-3">
              No articles found
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              We couldn't find any articles that match your current filters. Try
              adjusting your search criteria or browse our categories.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="inline-flex rounded-lg shadow-sm">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={!data.pagination.hasPrevPage}
                className={`px-5 py-2 rounded-l-lg flex items-center gap-1 ${
                  !data.pagination.hasPrevPage
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                Previous
              </button>

              {Array.from(
                { length: data.pagination.totalPages },
                (_, i) => i + 1
              )
                .filter(
                  (p) =>
                    p === 1 ||
                    p === data.pagination.totalPages ||
                    (p >= page - 1 && p <= page + 1)
                )
                .map((p, index, array) => {
                  if (index > 0 && p > array[index - 1] + 1) {
                    return (
                      <div key={`ellipsis-${p}`} className="flex">
                        <span className="px-4 py-2 border-x border-gray-200 bg-white text-gray-400">
                          ...
                        </span>
                        <button
                          key={p}
                          onClick={() => handlePageChange(p)}
                          className={`px-4 py-2 border-r border-gray-200 ${
                            p === page
                              ? "bg-blue-600 text-white font-medium"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`px-4 py-2 border-x border-gray-200 ${
                        p === page
                          ? "bg-blue-600 text-white font-medium"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={!data.pagination.hasNextPage}
                className={`px-5 py-2 rounded-r-lg flex items-center gap-1 ${
                  !data.pagination.hasNextPage
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {showBackToTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 p-3 bg-blue-700 text-white rounded-full shadow-lg hover:bg-blue-800 transition-all duration-300 animate-fadeIn"
            aria-label="Back to top"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Feed;
