import { useState, useEffect } from "react";
import { useGetCourses } from "../hooks/useGetCourses";
import { Loading } from "./Loading";
import { FaFilter } from "react-icons/fa";
import CourseCard from "./CourseCard";
import { Link } from "react-router-dom";
import { useInView } from "react-intersection-observer";

const ExploreCourses = () => {
  const [filter, setFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const {
    courses,
    isCoursesLoading,
    fetchMoreCourses,
    isLoadingMore,
    isMobile,
    hasMore,
  } = useGetCourses();

  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView && isMobile && !isLoadingMore && hasMore) {
      fetchMoreCourses();
    }
  }, [inView, isMobile, isLoadingMore, hasMore, fetchMoreCourses]);

  const categories = Array.from(
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

    const categoryMatch =
      categoryFilter === "all" || course?.category === categoryFilter;

    return priceFilter && categoryMatch;
  });

  if (isCoursesLoading) return <Loading />;
  if (!filter || !categoryFilter) return null;

  return (
    <div className="py-12">
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

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Courses</option>
              <option value="free">Free Courses</option>
              <option value="paid">Paid Courses</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories?.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            Showing {filteredCourses?.length}{" "}
            {filteredCourses?.length === 1 ? "course" : "courses"}
          </p>
          <div>
            <Link
              to={"/explore"}
              className="bg-orange-600 text-white font-semibold text-sm p-2 rounded-lg"
            >
              Explore All Courses
            </Link>
          </div>
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses?.map((course) => (
                <CourseCard
                  key={course.course_id}
                  {...course}
                  avgRating={Number(course.avgRating)}
                  instructor_name={course.instructor.full_name}
                />
              ))}
            </div>

            {isMobile && hasMore && (
              <div ref={ref} className="mt-10 flex justify-center">
                {isLoadingMore ? (
                  <p className="text-gray-500">Loading more...</p>
                ) : (
                  <span className="text-gray-400">Scroll to load more</span>
                )}
              </div>
            )}

            {isMobile && !hasMore && (
              <div className="mt-10 text-center text-gray-500">
                <p>No more courses to load</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExploreCourses;
