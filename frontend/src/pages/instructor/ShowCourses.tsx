import { useState } from "react";
import { UpdateCourseDetails } from "../../components/instrctor/UpdateCourseDetails";
import { Loading } from "../../components/Loading";
import { useGetInstructorCourses } from "../../hooks/useGetInstructorCourses";
import { InstructorLayout } from "../../layouts/InstructorLayout";
import { CourseDetails } from "../../hooks/useGetInstructorCourses";
import { useNavigate } from "react-router-dom";
import {
  Book,
  PenTool,
  Users,
  Star,
  Search,
  FileText,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sliders,
} from "lucide-react";

export const ShowInstractourCourses = () => {
  const { courses, isLoading, pagination } = useGetInstructorCourses();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseDetails | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();

  const openModal = (course: CourseDetails) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const viewLessons = (courseId: number) => {
    navigate(`/instructor/courses/${courseId}/lessons`);
  };

  const viewAssignments = (courseId: number) => {
    navigate(`/instructor/courses/${courseId}/assignments`);
  };

  const filteredCourses = courses?.filter((course) => {
    const matchesQuery =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && course.is_published) ||
      (statusFilter === "draft" && !course.is_published);

    return matchesQuery && matchesStatus;
  });

  return (
    <InstructorLayout>
      <div className="p-1 bg-gray-50 ">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search courses by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex space-x-3 w-full md:w-auto">
            <div className="relative inline-block text-left w-full md:w-auto">
              <button
                type="button"
                className="inline-flex justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => {
                  if (statusFilter === "all") setStatusFilter("published");
                  else if (statusFilter === "published")
                    setStatusFilter("draft");
                  else setStatusFilter("all");
                }}
              >
                <div className="flex items-center">
                  <Sliders size={16} className="mr-2" />
                  <span>
                    {statusFilter === "all"
                      ? "All Courses"
                      : statusFilter === "published"
                      ? "Published Only"
                      : "Drafts Only"}
                  </span>
                </div>
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-10">
            <Loading />
          </div>
        ) : filteredCourses?.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <div className="text-gray-500 text-lg mb-2">No courses found</div>
            <p className="text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCourses?.map((course) => (
                    <tr
                      key={course.course_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={
                                course.course_img || "/api/placeholder/64/64"
                              }
                              alt={course.title}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {course.title}
                            </div>
                            <div className="text-xs text-gray-500 max-w-xs truncate">
                              {course.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {course.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Users size={16} className="text-gray-400 mr-2" />
                          {course.total_enrollments}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star size={16} className="text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-700">
                            {course.average_rating.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            course.is_published
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {course.is_published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => viewLessons(course.course_id)}
                            className="p-1.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                            title="View Lessons"
                          >
                            <Book size={16} />
                          </button>
                          <button
                            onClick={() => viewAssignments(course.course_id)}
                            className="p-1.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                            title="View Assignments"
                          >
                            <FileText size={16} />
                          </button>
                          <button
                            onClick={() => openModal(course)}
                            className="p-1.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                            title="Edit Course"
                          >
                            <PenTool size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {pagination && filteredCourses && filteredCourses.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center space-x-2">
              <button
                className="p-2 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={pagination.currentPage === 1}
                onClick={() =>
                  navigate(
                    `/instructor/courses?page=${pagination.currentPage - 1}`
                  )
                }
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from(
                { length: Math.min(pagination.totalPages, 5) },
                (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (
                    pagination.currentPage >=
                    pagination.totalPages - 2
                  ) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={i}
                      className={`w-10 h-10 ${
                        pagination.currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      } rounded-md border border-gray-300 font-medium`}
                      onClick={() =>
                        navigate(`/instructor/courses?page=${pageNum}`)
                      }
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}
              <button
                className="p-2 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() =>
                  navigate(
                    `/instructor/courses?page=${pagination.currentPage + 1}`
                  )
                }
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Update Course
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <UpdateCourseDetails course={selectedCourse} onClose={closeModal} />
          </div>
        </div>
      )}
    </InstructorLayout>
  );
};
