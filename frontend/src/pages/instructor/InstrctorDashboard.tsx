import { useState } from "react";
import { Link } from "react-router-dom";
import { Loading } from "../../components/Loading";
import { useAuth } from "../../hooks/useAuth";
import { useGetInstructorCourses } from "../../hooks/useGetInstructorCourses";
import { useGetInstructorEnrollments } from "../../hooks/useGetInstructorEnrollments";
import { InstructorLayout } from "../../layouts/InstructorLayout";
import { useGetInstructorQuizzes } from "../../hooks/useGetInstructorQuizzes";
import {
  FaBook,
  FaUsers,
  FaFileAlt,
  FaUserGraduate,
  FaChartLine,
  FaStar,
  FaCalendarAlt,
  FaChevronRight,
  FaUser,
  FaPlusCircle,
  FaSchool,
} from "react-icons/fa";

export const InstructorDashboard = () => {
  const { user } = useAuth();
  const { courses, isLoading } = useGetInstructorCourses();
  const { enrollments, enrollmentsLoading } = useGetInstructorEnrollments();
  const { quizzesLoading, quizzes } = useGetInstructorQuizzes();

  const [activeTab, setActiveTab] = useState<
    "courses" | "enrollments" | "quizzes"
  >("courses");

  const recentCourses = courses?.slice(0, 3).reverse();
  const recentEnrollments = enrollments?.slice(0, 3).reverse();
  const recentQuizzes = quizzes?.slice(0, 3).reverse();

  return (
    <InstructorLayout>
      <div className="flex flex-col space-y-4 p-4 max-w-7xl mx-auto bg-gray-50 min-h-screen">
        <div className="bg-white border-l-4 border-blue-600 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold ">
                Instructor Dashboard
              </h1>
              <p className="text-md text-gray-400 mt-1">
                Welcome back, {user?.full_name}!
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-blue-100 p-3 rounded-full">
                <FaUserGraduate className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden border-t-4 border-blue-500">
            <div className="p-4 ">
              <div className="flex items-center justify-between">
                <h3 className="text-blue-800 text-sm font-medium">
                  Total Courses
                </h3>
                <span className="bg-white p-2 rounded-full shadow-sm">
                  <FaBook className="w-3 h-3 text-blue-600" />
                </span>
              </div>
            </div>
            <div className="p-4">
              <p className="text-3xl font-bold text-blue-900">
                {courses?.length || 0}
              </p>
              <p className="text-xs text-blue-500 mt-1">Active courses</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden border-t-4 border-blue-500">
            <div className="p-4 bg">
              <div className="flex items-center justify-between">
                <h3 className="text-blue-800 text-sm font-medium">
                  Total Enrollments
                </h3>
                <span className="bg-white p-2 rounded-full shadow-sm">
                  <FaUsers className="w-3 h-3 text-blue-600" />
                </span>
              </div>
            </div>
            <div className="p-4">
              <p className="text-3xl font-bold text-blue-900">
                {enrollments?.length || 0}
              </p>
              <p className="text-xs text-blue-500 mt-1">Total students</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden border-t-4 border-blue-500">
            <div className="p-4 ">
              <div className="flex items-center justify-between">
                <h3 className="text-blue-800 text-sm font-medium">
                  Total Quizzes
                </h3>
                <span className="bg-white p-2 rounded-full shadow-sm">
                  <FaFileAlt className="w-3 h-3 text-blue-600" />
                </span>
              </div>
            </div>
            <div className="p-4">
              <p className="text-3xl font-bold text-blue-900">
                {quizzes?.length || 0}
              </p>
              <p className="text-xs text-blue-500 mt-1">Assessment items</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-md font-semibold text-blue-800 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/instructor/create-quiz"
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-white transition-colors border "
            >
              <div className="bg-blue-500 p-2 rounded-full mr-3 text-white">
                <FaPlusCircle className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-blue-800">
                Create New Quiz
              </span>
            </Link>
            <Link
              to="/instructor/analytics"
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-white transition-colors border "
            >
              <div className="bg-blue-500 p-2 rounded-full mr-3 text-white">
                <FaChartLine className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-blue-800">
                View Reports
              </span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b border-blue-100">
            {["courses", "enrollments", "quizzes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? "text-blue-800 border-b-2 border-blue-600 bg-white"
                    : "text-blue-500 hover:text-blue-700 hover:bg-gray-50"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "courses" && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-blue-800">
                    Recent Courses
                  </h2>
                  <Link
                    to="/instructor/courses"
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
                  >
                    View All
                    <FaChevronRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <Loading />
                    </div>
                  ) : recentCourses && recentCourses.length > 0 ? (
                    recentCourses.map((course) => (
                      <div
                        key={course.course_id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white border  rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-blue-800">
                            {course.title}
                          </h3>
                          <div className="mt-2 grid grid-cols-2 gap-3">
                            <div className="flex items-center text-xs text-blue-600">
                              <FaUsers className="w-3 h-3 mr-2 text-blue-500" />
                              <span>{course.total_enrollments} Students</span>
                            </div>
                            <div className="flex items-center text-xs text-blue-600">
                              <FaStar className="w-3 h-3 mr-2 text-blue-500" />
                              <span>
                                {course.average_rating
                                  ? `${course.average_rating}/5`
                                  : "Not rated"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 md:mt-0 flex space-x-2">
                          <Link
                            to={`/instructor/courses/${course.course_id}/lessons`}
                            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
                          >
                            Lessons
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-blue-500 text-sm bg-blue-50 rounded-lg border ">
                      <FaBook className="w-10 h-10 mx-auto mb-2 text-blue-400" />
                      <p>No courses available. Create your first course now!</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "enrollments" && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-blue-800">
                    Recent Enrollments
                  </h2>
                  <Link
                    to="/instructor/learners"
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
                  >
                    View All
                    <FaChevronRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {enrollmentsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loading />
                    </div>
                  ) : recentEnrollments && recentEnrollments.length > 0 ? (
                    recentEnrollments.map((enrollment) => (
                      <div
                        key={`${enrollment.course.course_id}-${enrollment.user.email}`}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white border  rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                              <FaUser className="w-3 h-3 text-blue-600" />
                            </div>
                            <h3 className="text-sm font-medium text-blue-800">
                              {enrollment.user.full_name}
                            </h3>
                          </div>
                          <div className="mt-2 ml-8 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center text-xs text-blue-600">
                              <FaSchool className="w-3 h-3 mr-2 text-blue-500" />
                              <span>{enrollment.course.title}</span>
                            </div>
                            <div className="flex items-center text-xs text-blue-600">
                              <FaCalendarAlt className="w-3 h-3 mr-2 text-blue-500" />
                              <span>
                                {new Date(
                                  enrollment.enrollment_date
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 md:mt-0">
                          {enrollment.status ? (
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                              {enrollment.status}
                            </span>
                          ) : (
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-blue-500 text-sm bg-blue-50 rounded-lg border border-blue-200">
                      <FaUsers className="w-10 h-10 mx-auto mb-2 text-blue-400" />
                      <p>No enrollments available yet.</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "quizzes" && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-blue-800">
                    Recent Quizzes
                  </h2>
                  <Link
                    to="/instructor/quizzes"
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
                  >
                    View All
                    <FaChevronRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {quizzesLoading ? (
                    <div className="flex justify-center py-4">
                      <Loading />
                    </div>
                  ) : recentQuizzes && recentQuizzes.length > 0 ? (
                    recentQuizzes.map((quiz) => (
                      <div
                        key={quiz.quiz_id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4  border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                              <FaFileAlt className="w-3 h-3 text-blue-600" />
                            </div>
                            <h3 className="text-sm font-medium text-blue-800">
                              {quiz.title}
                            </h3>
                          </div>
                          <div className="mt-2 ml-8">
                            <div className="flex items-center text-xs text-blue-600">
                              <FaBook className="w-3 h-3 mr-2 text-blue-500" />
                              <span>Course: {quiz.course.title}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 md:mt-0 flex space-x-2">
                          <Link
                            to={`/instructor/review-quiz/${quiz.quiz_id}/course/${quiz.course.course_id}`}
                            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
                          >
                            Review
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-blue-500 text-sm bg-blue-50 rounded-lg border border-blue-200">
                      <FaFileAlt className="w-10 h-10 mx-auto mb-2 text-blue-400" />
                      <p>
                        No quizzes available yet. Create your first quiz now!
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
};
