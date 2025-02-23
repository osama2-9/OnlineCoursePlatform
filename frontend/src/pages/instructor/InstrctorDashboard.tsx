import { useState } from "react";
import { Link } from "react-router-dom";
import { Loading } from "../../components/Loading";
import { useAuth } from "../../hooks/useAuth";
import { useGetInstructorCourses } from "../../hooks/useGetInstructorCourses";
import { useGetInstructorEnrollments } from "../../hooks/useGetInstructorEnrollments";
import { InstructorLayout } from "../../layouts/InstructorLayout";
import { useGetInstructorQuizzes } from "../../hooks/useGetInstructorQuizzes";

export const InstructorDashboard = () => {
  const { user } = useAuth();
  const { courses, isLoading } = useGetInstructorCourses();
  const { enrollments, enrollmentsLoading } = useGetInstructorEnrollments();
  const { quizzesLoading, quizzes } = useGetInstructorQuizzes();

  const [activeTab, setActiveTab] = useState<
    "courses" | "enrollments" | "quizzes"
  >("courses");

  const splitedCourses = courses?.slice(0, 3).reverse();
  const splitedEnrollments = enrollments?.slice(0, 3).reverse();
  const splitedQuizzes = quizzes?.slice(0, 3).reverse();

  return (
    <InstructorLayout>
      <div className="flex flex-col space-y-8 p-6 max-w-7xl mx-auto">
        {/* Welcome Banner - Enhanced */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-8 rounded-xl shadow-lg transform transition-all duration-300 ">
          <h1 className="text-4xl font-bold">
            Welcome Back, {user?.full_name}!
          </h1>
          <p className="mt-3 text-lg opacity-90">
            Manage your courses, enrollments, and quizzes from here
          </p>
        </div>

        {/* Statistics Cards - New Addition */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm">Total Courses</h3>
              <span className="text-blue-500 bg-blue-100 p-2 rounded-full">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </span>
            </div>
            <p className="text-2xl font-semibold mt-2">
              {courses?.length || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm">Total Enrollments</h3>
              <span className="text-blue-500 bg-blue-100 p-2 rounded-full">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </span>
            </div>
            <p className="text-2xl font-semibold mt-2">
              {enrollments?.length || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm">Total Quizzes</h3>
              <span className="text-blue-500 bg-blue-100 p-2 rounded-full">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>
            <p className="text-2xl font-semibold mt-2">
              {quizzes?.length || 0}
            </p>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="flex space-x-1 border-b border-gray-200 bg-gray-50 rounded-t-lg p-1">
          {["courses", "enrollments", "quizzes"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === tab
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Enhanced Tab Content */}
        <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300">
          {activeTab === "courses" && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Your Courses</h2>
                <Link
                  to={"/instructor/courses"}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  View All
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
              <div className="space-y-4 mb-4">
                {isLoading ? (
                  <Loading />
                ) : (
                  <>
                    {splitedCourses?.map((course) => (
                      <div
                        key={course.course_id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div>
                          <h3 className="text-lg font-semibold">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Enrollments: {course.total_enrollments}
                          </p>
                          <p className="text-sm text-gray-600">
                            Average Rating:{" "}
                            {course.average_rating
                              ? course.average_rating
                              : "No rating"}
                            /5
                          </p>
                        </div>
                        <Link
                          to={`/instructor/courses/${course.course_id}/lessons`}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          View Course
                        </Link>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </>
          )}

          {activeTab === "enrollments" && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Recent Enrollments</h2>
                <Link
                  to={"/instructor/learners"}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  View All
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
              {splitedEnrollments && splitedEnrollments.length !== 0 ? (
                <>
                  {enrollmentsLoading ? (
                    <div className="flex items-center justify-center mx-auto">
                      <Loading />
                    </div>
                  ) : (
                    <>
                      {splitedEnrollments.map((enrollment) => {
                        return (
                          <div
                            key={enrollment.course.course_id}
                            className="space-y-4 mb-4"
                          >
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:shadow-sm transition-shadow">
                              <div>
                                <h3 className="text-lg font-semibold">
                                  {enrollment.user.full_name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Course: {enrollment.course.title}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Enrollment Date:{" "}
                                  {new Date(
                                    enrollment.enrollment_date
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              {enrollment.status ? (
                                <span className="bg-green-100 text-green-800 px-3 py-1 text-sm rounded-full">
                                  {enrollment.status}
                                </span>
                              ) : (
                                <span className="bg-red-100 text-red-800 px-3 py-1 text-sm rounded-full">
                                  {enrollment.status}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </>
              ) : (
                <p>No recent enrollments available.</p>
              )}
            </>
          )}

          {activeTab === "quizzes" && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Quizzes</h2>
                <Link
                  to={"/instructor/quizess"}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  View All
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
              {splitedQuizzes && splitedQuizzes.length != 0 && (
                <>
                  {quizzesLoading ? (
                    <Loading />
                  ) : (
                    <>
                      {splitedQuizzes.map((quiz) => {
                        return (
                          <div key={quiz.quiz_id} className="space-y-4 mb-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:shadow-sm transition-shadow">
                              <div>
                                <h3 className="text-lg font-semibold">
                                  {quiz.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Course: {quiz.course.title}
                                </p>
                              </div>
                              <Link
                                to={`/instructor/review-quiz/${quiz.quiz_id}/course/${quiz.course.course_id}`}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                Review
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </InstructorLayout>
  );
};
