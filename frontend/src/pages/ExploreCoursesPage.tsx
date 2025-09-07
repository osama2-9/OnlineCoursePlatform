import { useState, useEffect } from "react";
import { useGetCourses } from "../hooks/useGetCourses";
import { Loading } from "../components/Loading";
import CourseCard from "../components/CourseCard";
import { useInView } from "react-intersection-observer";
import { FaSearch, FaChevronDown, FaTimes } from "react-icons/fa";

export const ExploreCoursesPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [priceFilter, setPriceFilter] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);

  const {
    courses,
    isCoursesLoading,
    fetchMoreCourses,
    isLoadingMore,
    pagination,
    isMobile,
    hasMore,
  } = useGetCourses();

  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView && isMobile && hasMore && !isLoadingMore) {
      fetchMoreCourses();
    }
  }, [inView, isMobile, hasMore, isLoadingMore, fetchMoreCourses]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setPriceFilter("");
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gradient-to-r from-purple-600 to-blue-700 text-black py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-white mx-auto text-center">
            <h1 className="text-5xl font-extrabold tracking-tight">
              Professional Development Courses
            </h1>
            <p className="mt-4 text-md">
              Elevate your career with industry-leading courses from expert
              instructors
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for courses by title, instructor, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="px-6 py-4 flex items-center justify-between bg-gray-50 rounded-b-lg">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center text-gray-700 font-medium"
            >
              <FaChevronDown
                className={`mr-2 transform transition-transform ${
                  isFilterOpen ? "rotate-180" : ""
                }`}
              />
              Filters
            </button>

            <div className="flex items-center space-x-2">
              {(categoryFilter || priceFilter || searchQuery) && (
                <button
                  onClick={handleClearFilters}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  <FaTimes className="mr-1" /> Clear filters
                </button>
              )}
              <div className="text-sm text-gray-600">
                {courses.length} {courses.length === 1 ? "course" : "courses"}{" "}
                found
              </div>
            </div>
          </div>

          {isFilterOpen && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    <option value="technology">Technology</option>
                    <option value="business">Business</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="personal-development">
                      Personal Development
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Range
                  </label>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Prices</option>
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                    <option value="0-50">$0 - $50</option>
                    <option value="51-100">$51 - $100</option>
                    <option value="101-200">$101 - $200</option>
                    <option value="201+">$201+</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {isCoursesLoading ? (
          <div className="flex justify-center py-12">
            <Loading />
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h3 className="mt-4 text-xl font-semibold text-gray-800">
              No courses found
            </h3>
            <p className="mt-2 text-gray-600">
              Try adjusting your search filters or browse all courses
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <CourseCard
                  key={course.course_id}
                  {...course}
                  avgRating={Number(course.avgRating)}
                />
              ))}
            </div>

            {isMobile && hasMore && (
              <div ref={ref} className="flex justify-center py-10">
                {isLoadingMore && <Loading />}
              </div>
            )}

            {!isMobile && pagination.totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <p className="text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
