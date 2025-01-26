import { useState } from "react";
import { Link } from "react-router-dom";
import { useGetCourses } from "../hooks/useGetCourses";
import { Loading } from "./Loading";
import { FaStar, FaUsers } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { FaFilter } from "react-icons/fa";

interface Course {
  course_id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  course_img: string;
  rating?: number;
  students_count?: number;
  instructor_name?: string;
}

const CourseCard = ({
  course_id,
  course_img,
  title,
  description,
  category,
  price,
  rating = 4.5,
  students_count = 0,
  instructor_name = "Instructor",
}: Course) => {
  return (
    <Link to={`/course-page/${course_id}`}>
      <div className="bg-white border border-gray-100 rounded-lg hover:border-gray-200 hover:shadow-md transition-all duration-300 group">
        {/* Image Container */}
        <div className="relative">
          <img
            src={course_img}
            alt={title}
            className="w-full h-52  rounded-t-lg"
          />
          {/* Price Tag */}
          <div className="absolute top-4 right-4">
            <span className="inline-block px-4 py-2 rounded-md font-medium text-sm bg-white/95 text-gray-700 shadow-sm">
              {price === 0 ? "Free Course" : `$${price.toFixed(2)}`}
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* Category & Rating */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
              {category}
            </span>
            <div className="flex items-center">
              <FaStar className="text-yellow-300 mr-1" />
              <span className="text-sm font-medium text-yellow-500">
                {rating}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-gray-600 transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">
            {description}
          </p>

          {/* Instructor Info */}
          <div className="flex items-center justify-between py-4 border-t border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-3">
                <span className="text-gray-600 font-semibold">
                  {instructor_name[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {instructor_name}
                </p>
                <p className="text-xs text-gray-500">Instructor</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <FaUsers className="mr-1" />
              <span>{students_count.toLocaleString()} enrolled</span>
            </div>
          </div>

          {/* Call to Action */}
          <button className="w-full mt-4 px-4 py-2 bg-gray-200 text-black font-medium rounded-md hover:bg-gray-300 transition-colors duration-300">
            View Course Details
          </button>
        </div>
      </div>
    </Link>
  );
};

const ExploreCourses = () => {
  const [filter, setFilter] = useState<string>("all");
  const { courses, loading } = useGetCourses();

  const filteredCourses = courses.filter((course) => {
    const price = Number(course.price);
    if (filter === "all") return true;
    if (filter === "free") return price === 0;
    if (filter === "paid") return price > 0;
    return true;
  });

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
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>

            <div className="flex gap-4">
              <select className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white min-w-[160px]">
                <option value="all">All Categories</option>
                {/* Add category options here */}
              </select>

              <div className="flex gap-2">
                {["all", "free", "paid"].map((filterOption) => (
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

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredCourses.length}{" "}
            {filteredCourses.length === 1 ? "course" : "courses"}
          </p>
        </div>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
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
            {filteredCourses.map((course) => (
              <CourseCard key={course.course_id} {...course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreCourses;
