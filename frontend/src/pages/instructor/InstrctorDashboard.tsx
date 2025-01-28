import { Link } from "react-router-dom";
import { Loading } from "../../components/Loading";
import { useAuth } from "../../hooks/useAuth";
import { useGetInstructorCourses } from "../../hooks/useGetInstructorCourses";
import { useGetInstructorEnrollments } from "../../hooks/useGetInstructorEnrollments";
import { InstructorLayout } from "../../layouts/InstructorLayout";
import { useGetInstructorQuizzes } from "../../hooks/useGetInstructorQuizzes";

export const InstructorDashboard = () => {
  const { user } = useAuth();
  const { courses, loading } = useGetInstructorCourses();
  const { enrollments, enrollmentsLoading } = useGetInstructorEnrollments();
  const { quizzesloading, quizzes } = useGetInstructorQuizzes();
  const splitedCourses = courses?.slice(0, 2).reverse();
  const splitedEnrollments = enrollments?.slice(0, 2).reverse();
  const splitedQuizzes = quizzes?.slice(0, 2).reverse();

  return (
    <InstructorLayout>
      <div className="flex flex-col space-y-6 p-6 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-8 rounded-xl shadow-lg">
          <h1 className="text-4xl font-bold">
            Welcome Back, {user?.full_name}!
          </h1>
          <p className="mt-3 text-lg opacity-90">
            Manage your courses from here
          </p>
        </div>

        {/* Stats Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-gray-500 text-sm font-medium">Total Courses</h3>
            <p className="text-3xl font-bold mt-2">{courses?.length || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-gray-500 text-sm font-medium">
              Total Enrollments
            </h3>
            <p className="text-3xl font-bold mt-2">
              {enrollments?.length || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-gray-500 text-sm font-medium">Total Quizzes</h3>
            <p className="text-3xl font-bold mt-2">{quizzes?.length || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Courses Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
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
              {loading ? (
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
          </div>

          {/* Enrollments Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
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
          </div>

          {/* Quizzes Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
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
                {quizzesloading ? (
                  <Loading />
                ) : (
                  <>
                    {splitedQuizzes.map((quiz) => {
                      return (
                        <div className="space-y-4 mb-4">
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
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Recent Reviews</h2>
              <Link
                to={"/instructor/reviews"}
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
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:shadow-sm transition-shadow">
                <div>
                  <h3 className="text-lg font-semibold">John Doe</h3>
                  <p className="text-sm text-gray-600">
                    Course: Introduction to React
                  </p>
                  <p className="text-sm text-gray-600">Rating: 5/5</p>
                  <p className="text-sm text-gray-600">
                    "Great course! Very informative and well-structured."
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:shadow-sm transition-shadow">
                <div>
                  <h3 className="text-lg font-semibold">Jane Smith</h3>
                  <p className="text-sm text-gray-600">
                    Course: Advanced JavaScript
                  </p>
                  <p className="text-sm text-gray-600">Rating: 4/5</p>
                  <p className="text-sm text-gray-600">
                    "Good content, but some sections could be more detailed."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
};
