import { useState } from "react";
import { useGetCourses } from "../hooks/useGetCourses";
import { Loading } from "./Loading";
import { FaSearch } from "react-icons/fa";
import { FaFilter } from "react-icons/fa";
import CourseCard from "./CourseCard";

const ExploreCourses = () => {
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { courses, loading } = useGetCourses();

  const categories = Array?.from(
    new Set(courses?.map((course) => course.category))
  );

  const filteredCourses = courses?.filter((course) => {
    const price = Number(course.price);
    const priceFilter =
      filter === "all"
        ? true
        : filter === "free"
        ? price === 0
        : filter === "paid"
        ? price > 0
        : true;

    const searchFilter = searchQuery
      ? course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const categoryMatch =
      categoryFilter === "all" || course?.category === categoryFilter;

    return priceFilter && searchFilter && categoryMatch;
  });

  if (loading) return <Loading />;

  if (!filter || !categoryFilter) return null;

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Professional Development Courses
          </h2>
          <p className="text-lg text-gray-600">
            Advance your career with industry-leading courses from expert
            instructors
          </p>
        </div>

        <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>

            <div className="flex gap-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white min-w-[160px]"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                {["all", "free", "paid"]?.map((filterOption) => (
                  <button
                    key={filterOption}
                    className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                      filter === filterOption
                        ? "bg-gray-800 text-white"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                    onClick={() => setFilter(filterOption)}
                  >
                    {filterOption.charAt(0).toUpperCase() +
                      filterOption.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredCourses?.length}{" "}
            {filteredCourses?.length === 1 ? "course" : "courses"}
          </p>
        </div>

        {filteredCourses?.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <FaFilter className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No courses found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search filters or browse all courses
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses?.map((course) => (
              <CourseCard
                key={course.course_id}
                {...course}
                instructor_name={course.instructor.full_name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreCourses;
