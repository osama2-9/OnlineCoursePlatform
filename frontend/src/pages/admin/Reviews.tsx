import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API } from "../../API/ApiBaseUrl";
import { useAuth } from "../../hooks/useAuth";
import { Star, StarHalf } from "lucide-react";
import { AdminLayout } from "../../layouts/AdminLayout";
import { Loading } from "../../components/Loading";

interface Reviews {
  review_id: number;
  user: {
    full_name: string;
  };
  course: {
    title: string;
    course_img: string;
  };
  rating: number;
  review_text: string;
  created_at: string;
}

interface Pagination {
  totalReviews: number;
  totalPages: number;
  currentPage: number;
}

export const Reviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Reviews[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Reviews[]>([]);
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [dateFilter, setDateFilter] = useState<string>("all"); // all, week, month, year
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    totalReviews: 0,
    totalPages: 0,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(true);

  const getReviews = async (page: number = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/admin/reviews/${user?.userId}`, {
        params: { page },
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      const data = await res.data;
      if (data) {
        setReviews(data.reviews);
        setPagination({
          totalReviews: data.totalReviews,
          totalPages: data.totalPages,
          currentPage: data.currentPage,
        });
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reviews];

    // Apply rating filter
    if (ratingFilter !== "all") {
      filtered = filtered.filter(
        (review) => Math.floor(review.rating) === ratingFilter
      );
    }

    // Apply date filter
    const now = new Date();
    if (dateFilter !== "all") {
      filtered = filtered.filter((review) => {
        const reviewDate = new Date(review.created_at);
        switch (dateFilter) {
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return reviewDate >= weekAgo;
          case "month":
            const monthAgo = new Date(
              now.getFullYear(),
              now.getMonth() - 1,
              now.getDate()
            );
            return reviewDate >= monthAgo;
          case "year":
            const yearAgo = new Date(
              now.getFullYear() - 1,
              now.getMonth(),
              now.getDate()
            );
            return reviewDate >= yearAgo;
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (review) =>
          review.course.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          review.review_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReviews(filtered);
  };

  useEffect(() => {
    if (user?.userId) {
      getReviews();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [reviews, ratingFilter, dateFilter, searchTerm]);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`star-${i}`}
          className="w-5 h-5 fill-yellow-400 text-yellow-400"
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half-star"
          className="w-5 h-5 fill-yellow-400 text-yellow-400"
        />
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Course Reviews
            </h1>
            <p className="text-gray-600">
              Manage and monitor all course reviews from your students
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-gray-500 text-sm font-medium mb-2">
                Total Reviews
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {pagination.totalReviews}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-gray-500 text-sm font-medium mb-2">
                Average Rating
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {reviews.length > 0
                  ? (
                      reviews.reduce((acc, rev) => acc + rev.rating, 0) /
                      reviews.length
                    ).toFixed(1)
                  : "0.0"}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-gray-500 text-sm font-medium mb-2">
                Recent Reviews
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {
                  reviews.filter(
                    (r) =>
                      new Date(r.created_at) >=
                      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length
                }
              </p>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Search Input */}
              <div className="col-span-1 md:col-span-2">
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Search Reviews
                </label>
                <div className="relative">
                  <input
                    id="search"
                    type="text"
                    placeholder="Search by course, review, or reviewer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label
                  htmlFor="rating"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Rating
                </label>
                <select
                  id="rating"
                  value={ratingFilter}
                  onChange={(e) =>
                    setRatingFilter(
                      e.target.value === "all" ? "all" : Number(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="all">All Ratings</option>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} Stars
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Time Period
                </label>
                <select
                  id="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="all">All Time</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid gap-6">
            {filteredReviews.map((review) => (
              <div
                key={review.review_id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Course Image */}
                  <div className="hidden sm:block flex-shrink-0">
                    <img
                      src={review.course.course_img}
                      alt={review.course.title}
                      className="w-48 h-32 object-cover rounded-lg shadow-sm"
                    />
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <div>
                        <h3 className="font-semibold text-xl text-gray-900 mb-2 line-clamp-1">
                          {review.course.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-gray-700 font-medium">
                            {review.user.full_name}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500">
                            {new Date(review.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-lg">
                        {renderStars(review.rating)}
                        <span className="ml-1 text-sm font-medium text-gray-700">
                          {review.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed">
                      {review.review_text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredReviews.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No reviews found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters or search terms
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => getReviews(i + 1)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    pagination.currentPage === i + 1
                      ? "bg-blue-500 text-white shadow-sm"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
