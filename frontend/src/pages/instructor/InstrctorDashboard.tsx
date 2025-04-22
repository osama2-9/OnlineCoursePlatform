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

  const recentCourses = courses?.slice(0, 3).reverse();
  const recentEnrollments = enrollments?.slice(0, 3).reverse();
  const recentQuizzes = quizzes?.slice(0, 3).reverse();

  return (
    <InstructorLayout>
      <div className="flex flex-col space-y-4 p-4 max-w-7xl mx-auto bg-gray-50 min-h-screen">
        <div className="bg-white border-l-2 border-gray-800 rounded shadow-sm p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-normal text-gray-900">
                Instructor Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome back, <span className="font-medium">{user?.full_name}</span>
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-gray-100 p-2 rounded">
                <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-200">
            <div className="p-3 bg-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-900 text-sm font-medium">Total Courses</h3>
                <span className="bg-white p-1 rounded">
                  <svg
                    className="w-3 h-3 text-gray-700"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                </span>
              </div>
            </div>
            <div className="p-3">
              <p className="text-2xl font-normal text-gray-900">{courses?.length || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Active courses</p>
            </div>
          </div>

          <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-200">
            <div className="p-3 bg-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-900 text-sm font-medium">Total Enrollments</h3>
                <span className="bg-white p-1 rounded">
                  <svg
                    className="w-3 h-3 text-gray-700"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </span>
              </div>
            </div>
            <div className="p-3">
              <p className="text-2xl font-normal text-gray-900">{enrollments?.length || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Total students</p>
            </div>
          </div>

          <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-200">
            <div className="p-3 bg-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-900 text-sm font-medium">Total Quizzes</h3>
                <span className="bg-white p-1 rounded">
                  <svg
                    className="w-3 h-3 text-gray-700"
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
            </div>
            <div className="p-3">
              <p className="text-2xl font-normal text-gray-900">{quizzes?.length || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Assessment items</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded shadow-sm p-4">
          <h2 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link to="/instructor/create-quiz" className="flex items-center p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
              <div className="bg-gray-100 p-1 rounded mr-2">
                <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-800">Create New Quiz</span>
            </Link>
            <Link to="/instructor/analytics" className="flex items-center p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
              <div className="bg-gray-100 p-1 rounded mr-2">
                <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-800">View Reports</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-200">
            {["courses", "enrollments", "quizzes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 px-3 py-3 text-xs font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? "text-gray-900 border-b-2 border-gray-800 bg-gray-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-4">
            {activeTab === "courses" && (
              <>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-base font-medium text-gray-900">Recent Courses</h2>
                  <Link
                    to="/instructor/courses"
                    className="inline-flex items-center px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors text-xs font-medium"
                  >
                    View All
                    <svg
                      className="w-3 h-3 ml-1"
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
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <Loading />
                    </div>
                  ) : recentCourses && recentCourses.length > 0 ? (
                    recentCourses.map((course) => (
                      <div
                        key={course.course_id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded hover:shadow-sm transition-shadow"
                      >
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {course.title}
                          </h3>
                          <div className="mt-1 grid grid-cols-2 gap-2">
                            <div className="flex items-center text-xs text-gray-600">
                              <svg className="w-3 h-3 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                              </svg>
                              <span>{course.total_enrollments} Students</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <svg className="w-3 h-3 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span>
                                {course.average_rating
                                  ? `${course.average_rating}/5`
                                  : "Not rated"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 md:mt-0 flex space-x-2">
                          <Link
                            to={`/instructor/courses/${course.course_id}/lessons`}
                            className="px-2 py-1 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors text-xs font-medium"
                          >
                            Lessons
                          </Link>
                         
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      <p>No courses available. Create your first course now!</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "enrollments" && (
              <>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-base font-medium text-gray-900">Recent Enrollments</h2>
                  <Link
                    to="/instructor/learners"
                    className="inline-flex items-center px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors text-xs font-medium"
                  >
                    View All
                    <svg
                      className="w-3 h-3 ml-1"
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
                <div className="space-y-2">
                  {enrollmentsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loading />
                    </div>
                  ) : recentEnrollments && recentEnrollments.length > 0 ? (
                    recentEnrollments.map((enrollment) => (
                      <div
                        key={`${enrollment.course.course_id}-${enrollment.user.email}`}
                        className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded hover:shadow-sm transition-shadow"
                      >
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className="bg-gray-100 p-1 rounded mr-2">
                              <svg className="w-3 h-3 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                              </svg>
                            </div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {enrollment.user.full_name}
                            </h3>
                          </div>
                          <div className="mt-1 ml-6 grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="flex items-center text-xs text-gray-600">
                              <svg className="w-3 h-3 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10.496 2.132a1 1 0 00-.992 0l-7 4A1 1 0 003 8v7a1 1 0 100 2h14a1 1 0 100-2V8a1 1 0 00.496-1.868l-7-4zM6 9a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1zm3 1a1 1 0 012 0v3a1 1 0 11-2 0v-3zm5-1a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <span>{enrollment.course.title}</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <svg className="w-3 h-3 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              <span>{new Date(enrollment.enrollment_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 md:mt-0">
                          {enrollment.status ? (
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                              {enrollment.status}
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      <p>No enrollments available yet.</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "quizzes" && (
              <>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-base font-medium text-gray-900">Recent Quizzes</h2>
                  <Link
                    to="/instructor/quizzes"
                    className="inline-flex items-center px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors text-xs font-medium"
                  >
                    View All
                    <svg
                      className="w-3 h-3 ml-1"
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
                <div className="space-y-2">
                  {quizzesLoading ? (
                    <div className="flex justify-center py-4">
                      <Loading />
                    </div>
                  ) : recentQuizzes && recentQuizzes.length > 0 ? (
                    recentQuizzes.map((quiz) => (
                      <div
                        key={quiz.quiz_id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded hover:shadow-sm transition-shadow"
                      >
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className="bg-gray-100 p-1 rounded mr-2">
                              <svg className="w-3 h-3 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {quiz.title}
                            </h3>
                          </div>
                          <div className="mt-1 ml-6">
                            <div className="flex items-center text-xs text-gray-600">
                              <svg className="w-3 h-3 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                                <path d="M3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zm9.3 7.176A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z" />
                              </svg>
                              <span>Course: {quiz.course.title}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 md:mt-0 flex space-x-2">
                          <Link
                            to={`/instructor/review-quiz/${quiz.quiz_id}/course/${quiz.course.course_id}`}
                            className="px-2 py-1 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors text-xs font-medium"
                          >
                            Review
                          </Link>
                          
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      <p>No quizzes available yet. Create your first quiz now!</p>
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