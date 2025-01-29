import { useState } from "react";
import { useGetCourses } from "../hooks/useGetCourses";
import { FaSearch } from "react-icons/fa";
import { Loading } from "../components/Loading";
import CourseCard from "../components/CourseCard";

export const ExploreCoursesPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [priceFilter, setPriceFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { courses, loading, pagination } = useGetCourses(
    currentPage,
    searchQuery,
    categoryFilter,
    priceFilter
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); 
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1); 
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriceFilter(e.target.value);
    setCurrentPage(1); 
  };

  const handlePagination = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) return <Loading />;

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Professional Development Courses
          </h2>
          <p className="text-lg text-gray-600">
            Advance your career with industry-leading courses from expert
            instructors
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for courses..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>

            <div className="flex gap-4">
              <select
                value={categoryFilter}
                onChange={handleCategoryChange}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white min-w-[160px]"
              >
                <option value="all">All Categories</option>
                <option value="technology">Technology</option>
                <option value="business">Business</option>
                <option value="design">Design</option>
              </select>

              <select
                value={priceFilter}
                onChange={handlePriceChange}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white min-w-[160px]"
              >
                <option value="all">All Prices</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
                <option value="0-50">0 - 50</option>
                <option value="51-100">51 - 100</option>
                <option value="101+">101+</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {courses.length}{" "}
            {courses.length === 1 ? "course" : "courses"}
          </p>
        </div>

        {/* Course Grid */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No courses found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search filters or browse all courses
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard key={course.course_id} {...course} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => handlePagination(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 bg-gray-200 text-black rounded-md mr-2"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePagination(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 bg-gray-200 text-black rounded-md ml-2"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
