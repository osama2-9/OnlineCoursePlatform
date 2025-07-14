import { useEffect, useRef, useState } from "react";
import { AdminLayout } from "../../layouts/AdminLayout";
import axios from "axios";
import toast from "react-hot-toast";
import { API } from "../../API/ApiBaseUrl";
import { Loading } from "../../components/Loading";
import { useNavigate } from "react-router-dom";
import { CourseActionsDropdown } from "../../components/admin/CourseActionsDropdown";
import { useAuth } from "../../hooks/useAuth";
import { UpdateCourse } from "../../components/admin/UpdateCourse";
import { Course } from "../../types/Course";
import { ConfirmeDelete } from "../../components/admin/ConfirmeDelete";
import { FaSort, FaDownload, FaSearch, FaFilter } from "react-icons/fa";
import { CSVLink } from "react-csv";

interface Pagination {
  totalCourses: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

interface FetchCoursesResponse {
  courses: Course[];
  pagination: Pagination;
}

export const ShowCourses = () => {
  const [courses, setCourses] = useState<Course[] | null>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setIsLoading] = useState<boolean>(false);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [pagination, setPagination] = useState<Pagination>({
    totalCourses: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 8,
  });

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const navigate = useNavigate();

  const { user } = useAuth();

  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [isUpdateCourse, setIsUpdateCourse] = useState<boolean>(false);

  const [searchTimeout, setSearchTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const cache = useRef<{ [key: number]: Course[] }>({});

  const fetchCourses = async (page: number, pageSize: number) => {
    try {
      setIsLoading(true);
      const res = await axios.get<FetchCoursesResponse>(
        `${API}/admin/courses`,
        {
          params: {
            page,
            pageSize,
            search: searchQuery,
            category: selectedCategory,
            priceRange: selectedPriceRange,
            sortField,
            sortDirection,
          },
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const data = res.data;
      if (data) {
        setCourses(data.courses);
        setPagination(data.pagination);
        cache.current[page] = data.courses;
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to fetch courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setSearchQuery(searchValue);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
      fetchCourses(1, pagination.pageSize);
    }, 500);

    setSearchTimeout(timeout);
  };

  useEffect(() => {
    fetchCourses(pagination.currentPage, pagination.pageSize);
  }, [
    pagination.currentPage,
    pagination.pageSize,
    selectedCategory,
    selectedPriceRange,
    sortField,
    sortDirection,
  ]);

  useEffect(() => {
    if (courses) {
      const uniqueCategories = [
        ...new Set(courses.map((course) => course.category)),
      ];
      setCategories(uniqueCategories);
    }
  }, [courses]);


  const handleAddLesson = (courseId: number, instructorId: number) => {
    navigate(
      `/admin/courses/${courseId}/instractor/${instructorId}/add-lessons`
    );
  };

  const handleShowLessons = (
    courseId: number,
    instructorId: number,
    courseName: string
  ) => {
    navigate(
      `/admin/courses/${courseId}/instructor/${instructorId}/show-lessons/${courseName}`
    );
  };

  const onClickUpdate = (course: Course) => {
    setShowUpdateModal(true);
    setSelectedCourse(course);
  };

  const onClickCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedCourse(null);
  };
  const onClickDelete = (course: Course) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  const handleTogglePublish = async (courseId: number) => {
    try {
      const res = await axios.put(
        `${API}/course/update-publish-status`,
        {
          course_id: courseId,
          instructor_id: user?.userId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = await res.data;
      if (data) {
        toast.success(data.message);
        fetchCourses(pagination.currentPage, pagination.pageSize);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    }
  };

  const handleUpdateCourse = async (updatedCourse: Course) => {
    try {
      const courseToUpdate = {
        ...updatedCourse,
        courseType: updatedCourse.course_type,
        instructor: {
          user_id: updatedCourse.instructor.user_id,
          full_name: updatedCourse.instructor.full_name,
        },
        is_published: updatedCourse.is_published ?? false,
        learning_outcomes: updatedCourse.learning_outcomes ?? [],
      };

      setIsUpdateCourse(true);
      const res = await axios.put(
        `${API}/course/update-course`,
        courseToUpdate,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = await res.data;
      if (data) {
        toast.success(data.message);
        setShowUpdateModal(false);
        fetchCourses(pagination.currentPage, pagination.pageSize);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    } finally {
      setIsUpdateCourse(false);
    }
  };

  const handleDeleteCourse = async () => {
    try {
      const res = await axios.delete(
        `${API}/course/delete-course/${selectedCourse?.course_id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = await res.data;
      if (data) {
        toast.success(data.message);
        setSelectedCourse(null);
        setShowDeleteModal(false);
        fetchCourses(pagination.currentPage, pagination.pageSize);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    }
  };

  const handleSort = (field: string) => {
    setSortField(field);
    setSortDirection((current) => (current === "asc" ? "desc" : "asc"));

    const sortedCourses = [...(courses || [])].sort((a, b) => {
      let compareA = field.split(".").reduce((obj: any, key) => obj[key], a) as
        | string
        | number;
      let compareB = field.split(".").reduce((obj: any, key) => obj[key], b) as
        | string
        | number;

      if (typeof compareA === "string" && typeof compareB === "string") {
        compareA = compareA.toLowerCase();
        compareB = compareB.toLowerCase();
      }

      if (sortDirection === "asc") {
        return compareA > compareB ? 1 : -1;
      }
      return compareA < compareB ? 1 : -1;
    });

    setCourses(sortedCourses);
  };

  const exportData = courses?.map((course) => ({
    ID: course.course_id,
    Title: course.title,
    Instructor: course.instructor.full_name,
    Price: course.price,
    Category: course.category,
    Type: course.course_type,
    Status: course.is_published ? "Published" : "Unpublished",
  }));

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePriceRangeFilter = (range: string) => {
    setSelectedPriceRange(range);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  return (
    <AdminLayout>
      {loading ? (
        <Loading />
      ) : (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Course Management
              </h1>
              <p className="text-gray-600">
                Manage and monitor all courses in your platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Total Courses
                    </p>
                    <p className="text-3xl font-bold text-black">
                      {pagination.totalCourses}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Published
                    </p>
                    <p className="text-3xl font-bold text-black">
                      {courses?.filter((c) => c.is_published).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Unpublished
                    </p>
                    <p className="text-3xl font-bold text-black">
                      {courses?.filter((c) => !c.is_published).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Categories
                    </p>
                    <p className="text-3xl font-bold text-black">
                      {categories.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Search courses..."
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FaFilter className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Filter by:</span>
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm min-w-[140px]"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedPriceRange}
                    onChange={(e) => handlePriceRangeFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm min-w-[120px]"
                  >
                    <option value="">All Prices</option>
                    <option value="free">Free</option>
                    <option value="0-50">$0 - $50</option>
                    <option value="51-100">$51 - $100</option>
                    <option value="101+">$101+</option>
                  </select>

                  {courses && courses.length > 0 && (
                    <CSVLink
                      data={exportData || []}
                      filename="courses-export.csv"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
                    >
                      <FaDownload className="h-4 w-4" />
                      Export CSV
                    </CSVLink>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  All Courses
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        onClick={() => handleSort("course_id")}
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                      >
                        <div className="flex items-center gap-2">
                          ID
                          <FaSort className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Instructor
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courses?.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <div className="w-6 h-6 bg-gray-300 rounded"></div>
                            </div>
                            <p className="text-gray-500 text-sm">
                              No courses found
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      courses?.map((course) => (
                        <tr
                          key={course.course_id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{course.course_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <img
                                  src={course.course_img}
                                  alt={course.title}
                                  className="h-12 w-12 rounded-lg object-cover"
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                  {course.title}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {course.instructor.full_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="font-medium">${course.price}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {course.course_type ?? "free"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                course.is_published
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {course.is_published
                                ? "Published"
                                : "Unpublished"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {course.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <CourseActionsDropdown
                              courseId={course.course_id}
                              instructorId={course.instructor.user_id}
                              isPublished={course.is_published}
                              courseName={course.title}
                              onAddLesson={handleAddLesson}
                              onShowLessons={handleShowLessons}
                              onTogglePublish={handleTogglePublish}
                              updateCourse={() => onClickUpdate(course)}
                              deleteCourse={() => onClickDelete(course)}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between sm:hidden"></div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">
                          {(pagination.currentPage - 1) * pagination.pageSize +
                            1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(
                            pagination.currentPage * pagination.pageSize,
                            pagination.totalCourses
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {pagination.totalCourses}
                        </span>{" "}
                        results
                      </p>
                    </div>
                    <div></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modals */}
          <UpdateCourse
            courseData={selectedCourse}
            isOpen={showUpdateModal}
            onClose={() => setShowUpdateModal(false)}
            onUpdateCourse={handleUpdateCourse}
            isUpdating={isUpdateCourse}
          />

          {showDeleteModal && (
            <ConfirmeDelete
              title={selectedCourse?.title}
              onCancel={onClickCancelDelete}
              onConfirm={handleDeleteCourse}
            />
          )}
        </div>
      )}
    </AdminLayout>
  );
};
