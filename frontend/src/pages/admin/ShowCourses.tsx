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

  const fetchCourses = async (page: number, pageSize: number) => {
    try {
      setIsLoading(true);
      const res = await axios.get<FetchCoursesResponse>(
        `${API}/course/get-courses`,
        {
          params: { page, pageSize, search: searchQuery },
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const data = res.data;
      setCourses(data.courses);
      setPagination(data.pagination);
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to fetch courses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(pagination.currentPage, pagination.pageSize);
  }, [pagination.currentPage, pagination.pageSize, searchQuery]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newPageSize = parseInt(event.target.value, 10);
    setPagination((prev) => ({
      ...prev,
      pageSize: newPageSize,
      currentPage: 1,
    }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
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
      const res = await axios.put(
        `${API}/course/update-course`,
        updatedCourse,
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

  return (
    <AdminLayout>
      {loading ? (
        <Loading />
      ) : (
        <div className="mt-5">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <label
                htmlFor="searchQuery"
                className="font-semibold text-gray-700"
              >
                Search:
              </label>
              <input
                id="searchQuery"
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-80"
                placeholder="Search by title, description, or category"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label htmlFor="pageSize" className="font-semibold text-gray-700">
                Show:
              </label>
              <select
                id="pageSize"
                value={pagination.pageSize}
                onChange={handlePageSizeChange}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={5}>5</option>
                <option value={8}>8</option>
                <option value={10}>10</option>
              </select>
              <span className="text-gray-700">per page</span>
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
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                      #
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
                    courses?.map((course) => (
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
            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-6">
              <button
                className="px-4 py-2 bg-gray-300 text-sm rounded-md hover:bg-gray-400 focus:outline-none"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
              >
                Previous
              </button>
              <span className="text-sm">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                className="px-4 py-2 bg-gray-300 text-sm rounded-md hover:bg-gray-400 focus:outline-none"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
