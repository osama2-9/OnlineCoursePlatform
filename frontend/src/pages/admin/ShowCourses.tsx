import { useEffect, useState } from "react";
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
import { FaSort, FaDownload } from "react-icons/fa";
import { CSVLink } from "react-csv";
import { useQuery } from "@tanstack/react-query";

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

  const [searchTimeout, setSearchTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const fetchCourses = async (page: number, pageSize: number) => {
    try {
      setIsLoading(true);
      const res = await axios.get<FetchCoursesResponse>(
        `${API}/course/get-courses`,
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

      if (res.data) {
        return res.data;
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to fetch courses");
    } finally {
      setIsLoading(false);
    }
  };

  const { data } = useQuery({
    queryKey: ["courses", pagination.currentPage, pagination.pageSize],
    queryFn: () => fetchCourses(pagination.currentPage, pagination.pageSize),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 2,
  });

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

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

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
        fetchCourses(pagination.currentPage, pagination.pageSize); // Refresh the list
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    }
  };

  const handleUpdateCourse = async (updatedCourse: Course) => {
    try {
      // Ensure all required fields are present in the request
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

    const sortedCourses = [...(data?.courses || [])].sort((a, b) => {
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

  const exportData = data?.courses?.map((course) => ({
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
        <div className="mt-5 px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 transition-all hover:shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Total Courses
              </h3>
              <p className="text-3xl font-bold text-indigo-600">
                {data?.pagination.totalCourses}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 transition-all hover:shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Published
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {data?.courses?.filter((c) => c.is_published).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 transition-all hover:shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Unpublished
              </h3>
              <p className="text-3xl font-bold text-yellow-600">
                {data?.courses?.filter((c) => !c.is_published).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 transition-all hover:shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Categories
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {categories.length}
              </p>
            </div>
          </div>

          <div className="bg-white shadow-md border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="w-full md:w-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full md:w-80 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Search courses..."
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryFilter(e.target.value)}
                  className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
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
                  className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="">All Prices</option>
                  <option value="free">Free</option>
                  <option value="0-50">$0 - $50</option>
                  <option value="51-100">$51 - $100</option>
                  <option value="101+">$101+</option>
                </select>

                {data?.courses && data?.courses.length > 0 && (
                  <CSVLink
                    data={exportData || []}
                    filename="courses-export.csv"
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaDownload /> Export
                  </CSVLink>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Courses
            </h2>

            <div className="overflow-x-auto w-full">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr>
                    <th
                      onClick={() => handleSort("course_id")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        # <FaSort />
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                      Title
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                      Instructor
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                      Price
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                      Course Type
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                      Is Published
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                      Category
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                      Image
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {courses?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="py-4 px-4 text-center text-gray-500"
                      >
                        No courses found
                      </td>
                    </tr>
                  ) : (
                    data?.courses?.map((course) => (
                      <tr
                        key={course.course_id}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="py-3 px-4 text-sm text-gray-700 border-b">
                          {course.course_id}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 border-b">
                          {course.title}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 border-b">
                          {course.instructor.full_name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 border-b">
                          ${course.price}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 border-b">
                          {course.course_type ?? "free"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 border-b">
                          {course.is_published ? "Published" : "Unpublished"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 border-b">
                          {course.category}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 border-b">
                          <img
                            src={course.course_img}
                            alt={course.title}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 border-b">
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

            <UpdateCourse
              courseData={selectedCourse}
              isOpen={showUpdateModal}
              onClose={() => setShowUpdateModal(false)}
              onUpdateCourse={handleUpdateCourse}
            />
            {showDeleteModal && (
              <>
                <ConfirmeDelete
                  title={selectedCourse?.title}
                  onCancel={onClickCancelDelete}
                  onConfirm={handleDeleteCourse}
                />
              </>
            )}
            <div className="mt-6 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 bg-gray-200 rounded-md"
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.currentPage === 1}
                >
                  First
                </button>
                <button
                  className="px-3 py-1 bg-gray-200 rounded-md"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  Previous
                </button>
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-1 rounded-md ${
                      pagination.currentPage === i + 1
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="px-3 py-1 bg-gray-200 rounded-md"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                </button>
                <button
                  className="px-3 py-1 bg-gray-200 rounded-md"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
