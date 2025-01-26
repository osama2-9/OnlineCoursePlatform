import { useState } from "react";
import { UpdateCourseDetails } from "../../components/instrctor/UpdateCourseDetails";
import { Loading } from "../../components/Loading";
import { useGetInstructorCourses } from "../../hooks/useGetInstructorCourses";
import { InstructorLayout } from "../../layouts/InstructorLayout";
import { CourseDetails } from "../../hooks/useGetInstructorCourses";
import { useNavigate } from "react-router-dom";

export const ShowInstractourCourses = () => {
  const { courses, loading, pagination } = useGetInstructorCourses();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseDetails | null>(
    null
  );
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

  return (
    <InstructorLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Your Courses</h1>

        {loading ? (
          <Loading />
        ) : courses?.length === 0 ? (
          <div className="text-center text-gray-600">No courses found.</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Enrollments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {courses?.map((course) => (
                  <tr key={course.course_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={course.course_img}
                            alt={course.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {course.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {course.description.slice(0, 30).concat("...")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.total_enrollments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.average_rating.toFixed(1)}/5
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          course.is_published
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {course.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-4">
                        <button
                          onClick={() => openModal(course)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => viewLessons(course.course_id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          View Lessons
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-700">
              Showing page {pagination?.currentPage} of {pagination?.totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                disabled={pagination?.currentPage === 1}
              >
                Previous
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                disabled={pagination?.currentPage === pagination?.totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Modal for UpdateCourseDetails */}
        {isModalOpen && selectedCourse && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <UpdateCourseDetails course={selectedCourse} onClose={closeModal} />
          </div>
        )}
      </div>
    </InstructorLayout>
  );
};
