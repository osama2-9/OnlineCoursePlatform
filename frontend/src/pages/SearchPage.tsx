import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  Star,
  ArrowRight,
  X,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { API } from "../API/ApiBaseUrl";
import { HomePageFooter } from "../components/HomePageFooter";
import { Link } from "react-router-dom";

interface Instructor {
  full_name: string;
}

interface SeachResponse {
  courses: Course[];
}

interface Course {
  course_id: number;
  title: string;
  description: string;
  price: number;
  course_img: string;
  category: string;
  start_date: Date;

  course_type: string;
  created_at: string;
  instructor: Instructor;
  avgRating: string;
}

const categories = [
  "All Categories",
  "web-development",
  "programming",
  "data-science",
  "artificial-intelligence",
  "mobile-development",
  "design",
];

const priceRanges = [
  "All Prices",
  "Free",
  "Under $50",
  "$50 - $100",
  "$100 - $200",
  "$200+",
];

export default function SearchPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedPrice, setSelectedPrice] = useState("All Prices");
  const [courses, setCourses] = useState<Course[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const searchqurey =
    new URLSearchParams(window.location.search).get("q") || "";
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const filters = [];
    if (selectedCategory !== "All Categories") {
      filters.push(selectedCategory);
    }
    if (selectedPrice !== "All Prices") {
      filters.push(selectedPrice);
    }
    setActiveFilters(filters);
  }, [selectedCategory, selectedPrice]);

  const resetFilter = (filter: string) => {
    if (categories.includes(filter)) {
      setSelectedCategory("All Categories");
    } else if (priceRanges.includes(filter)) {
      setSelectedPrice("All Prices");
    }
  };

  const filteredCourses = courses.filter((course: any) => {
    const matchesCategory =
      selectedCategory === "All Categories" ||
      course.category === selectedCategory;

    let matchesPrice = true;
    if (selectedPrice === "Free") {
      matchesPrice = course.price === 0;
    } else if (selectedPrice === "Under $50") {
      matchesPrice = course.price < 50;
    } else if (selectedPrice === "$50 - $100") {
      matchesPrice = course.price >= 50 && course.price <= 100;
    } else if (selectedPrice === "$100 - $200") {
      matchesPrice = course.price > 100 && course.price <= 200;
    } else if (selectedPrice === "$200+") {
      matchesPrice = course.price > 200;
    }

    return matchesCategory && matchesPrice;
  });

  const formatCategory = (category: string) => {
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    const handleSearch = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get<SeachResponse>(`${API}/course/search`, {
          params: {
            q: searchqurey,
          },
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        const data = res.data;
        if (data) {
          setCourses(data.courses);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to fetch courses. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    handleSearch();
  }, [searchqurey]);

  return (
    <div className="min-h-screen ">
      <div className="bg-gradient-to-r from-purple-600 to-blue-700 text-white py-16">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl  font-bold mb-4">
            Discover Your Next Learning Journey
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Expand your skills with expert-led courses across tech, business,
            and creative fields
          </p>
        </div>
      </div>
      {isLoading && (
        <>
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="animate-spin text-gray-500" size={35} />
          </div>
        </>
      )}

      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <button
              className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors mb-4 md:mb-0"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} />
              <span className="font-medium">Filter Options</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>

            <div className="text-sm text-gray-600">
              Found{" "}
              <span className="font-semibold">{filteredCourses.length}</span>{" "}
              courses
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activeFilters.map((filter, index) => (
                <div
                  key={index}
                  className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium flex items-center"
                >
                  <span>
                    {filter.includes("-") ? formatCategory(filter) : filter}
                  </span>
                  <button
                    onClick={() => resetFilter(filter)}
                    className="ml-2 hover:text-indigo-900"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showFilters && (
            <div className="mt-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category === "All Categories"
                        ? category
                        : formatCategory(category)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                >
                  {priceRanges.map((range, index) => (
                    <option key={index} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div
                key={course.course_id}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1 flex flex-col"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={course.course_img || "/api/placeholder/400/240"}
                    alt={course.title}
                    className="w-full h-full "
                  />
                  <div className="absolute top-0 left-0 m-3">
                    <span className="bg-indigo-600 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                      {formatCategory(course.category)}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <div className="flex text-yellow-400">
                        <Star size={16} fill="currentColor" />
                      </div>
                      <span className="ml-1 text-sm font-medium"></span>
                      {course.avgRating && (
                        <span className="text-gray-400 text-sm ml-1">
                          ({course.avgRating})
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center ">
                      starts at
                      <span className="ml-1 text-gray-900 font-medium">
                        {course.start_date
                          ? new Date(course.start_date).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center mb-4 pt-3 border-t border-gray-100">
                    <div className="bg-indigo-100 text-indigo-700 rounded-full h-8 w-8 flex items-center justify-center mr-2">
                      {course.instructor.full_name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {course.instructor.full_name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="font-bold text-lg">
                      {course.price === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        <span className="text-gray-900">${course.price}</span>
                      )}
                    </div>
                    <Link
                      to={`/course-page/${course.course_id}`}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium px-4 py-2 rounded-lg flex items-center transition-colors"
                    >
                      View Course <ArrowRight size={16} className="ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-indigo-50 text-indigo-600 rounded-full p-6 mb-4">
                <Search size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No courses found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Try adjusting your search or filter criteria to find what you're
                looking for.
              </p>
            </div>
          )}
        </div>
      </main>
      <HomePageFooter />
    </div>
  );
}
