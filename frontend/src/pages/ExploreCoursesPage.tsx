import { useState, useEffect } from "react";
import { useGetCourses } from "../hooks/useGetCourses";
import { Loading } from "../components/Loading";
import CourseCard from "../components/CourseCard";

export const ExploreCoursesPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [priceFilter, setPriceFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);

  const { courses, loading, pagination } = useGetCourses(
    currentPage,
    debouncedSearch,
    categoryFilter,
    priceFilter
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  const handleClearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setPriceFilter("");
    setCurrentPage(1);
  };

  const handlePagination = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPaginationControls = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, pagination.currentPage - halfVisible);
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-center mt-12 gap-2">
        <button
          onClick={() => handlePagination(1)}
          disabled={pagination.currentPage === 1}
          className="p-2 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="First page"
        >
          «
        </button>
        <button
          onClick={() => handlePagination(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          className="p-2 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          ‹
        </button>
        
        {pageNumbers.map(page => (
          <button
            key={page}
            onClick={() => handlePagination(page)}
            className={`w-10 h-10 flex items-center justify-center rounded-md ${
              pagination.currentPage === page
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => handlePagination(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          className="p-2 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          ›
        </button>
        <button
          onClick={() => handlePagination(pagination.totalPages)}
          disabled={pagination.currentPage === pagination.totalPages}
          className="p-2 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Last page"
        >
          »
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gradient-to-r from-purple-600 to-blue-700 text-black py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-white mx-auto text-center">
            <h1 className="text-5xl font-extrabold tracking-tight">
              Professional Development Courses
            </h1>
            <p className="mt-4 text-md ">
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
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search for courses by title, instructor, or keyword..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="px-6 py-4 flex items-center justify-between bg-gray-50 rounded-b-lg">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center text-gray-700 font-medium"
            >
              <svg
                className={`mr-2 h-5 w-5 transform transition-transform ${
                  isFilterOpen ? "rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Filters
            </button>

            <div className="flex items-center space-x-2">
              {(categoryFilter || priceFilter || searchQuery) && (
                <button
                  onClick={handleClearFilters}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear filters
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
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    value={categoryFilter}
                    onChange={handleCategoryChange}
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
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Price Range
                  </label>
                  <select
                    id="price"
                    value={priceFilter}
                    onChange={handlePriceChange}
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

        {loading ? (
          <div className="flex justify-center py-12">
            <Loading />
          </div>
        ) : (
          <>
            {courses.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                  <CourseCard key={course.course_id} {...course} avgRating={Number(course.avgRating)} />
                ))}
              </div>
            )}

            {renderPaginationControls()}
          </>
        )}
      </div>
    </div>
  );
};