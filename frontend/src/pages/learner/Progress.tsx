import toast from "react-hot-toast";
import { LearnerLayout } from "../../layouts/LearnerLayout";
import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import { Loading } from "../../components/Loading";
import { FaBook } from "react-icons/fa";

interface CourseProgress {
  course_id: number;
  course_title: string;
  course_thumbnail: string;
  progress: number;
  current_lesson: string;
  last_accessed: Date;
  is_completed: boolean;
  enrollmentId: number;
}

const Progress = () => {
  const { user } = useAuth();
  const [courseProgress, setCourseProgress] = useState<CourseProgress[] | null>(
    null
  );
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState<boolean>(false);

  const getEnrolledCoursesProgress = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/learner/course-progress/${user?.userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = await res.data;
      if (data) {
        setCourseProgress(data);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProgress = courseProgress?.filter((progress) => {
    if (filter === "completed") return progress.is_completed;
    if (filter === "in-progress") return !progress.is_completed;
    return true;
  });

  useEffect(() => {
    getEnrolledCoursesProgress();
  }, [user?.userId]);

  const isInvalidDate = (date: Date) => {
    return new Date(date).getFullYear() === 1970;
  };

  return (
    <LearnerLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Learning Progress
            </h2>
            <p className="text-gray-600 mt-1">
              Track your course completion and achievements
            </p>
          </div>

          {/* Progress Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Total Courses</span>
                <span className="text-2xl font-bold text-gray-900">
                  {courseProgress?.length || 0}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-gray-900 h-1.5 rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Completed</span>
                <span className="text-2xl font-bold text-gray-900">
                  {courseProgress?.filter((course) => course.is_completed)
                    .length || 0}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-green-500 h-1.5 rounded-full"
                  style={{
                    width: `${
                      courseProgress
                        ? (courseProgress.filter(
                            (course) => course.is_completed
                          ).length /
                            courseProgress.length) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">In Progress</span>
                <span className="text-2xl font-bold text-gray-900">
                  {courseProgress?.filter((course) => !course.is_completed)
                    .length || 0}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full"
                  style={{
                    width: `${
                      courseProgress
                        ? (courseProgress.filter(
                            (course) => !course.is_completed
                          ).length /
                            courseProgress.length) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex space-x-4">
              {["all", "completed", "in-progress"].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === filterOption
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filterOption === "all"
                    ? "All Courses"
                    : filterOption === "completed"
                    ? "Completed"
                    : "In Progress"}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loading />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProgress?.map((progress) => (
                <div
                  key={progress.course_id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-6">
                      <img
                        src={progress.course_thumbnail}
                        alt={progress.course_title}
                        className="w-32 h-32 rounded-lg object-cover"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold text-gray-900 truncate">
                            {progress.course_title}
                          </h3>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              progress.is_completed
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {progress.is_completed
                              ? "Completed"
                              : "In Progress"}
                          </span>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                              <span>Progress</span>
                              <span className="font-medium">
                                {progress.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  progress.is_completed
                                    ? "bg-green-500"
                                    : "bg-blue-500"
                                }`}
                                style={{ width: `${progress.progress}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">
                                Last Accessed:
                              </span>
                              <p className="font-medium text-gray-900">
                                {isInvalidDate(progress.last_accessed)
                                  ? "Not accessed yet"
                                  : new Date(
                                      progress.last_accessed
                                    ).toLocaleDateString()}
                              </p>
                            </div>
                            {progress.current_lesson && (
                              <div>
                                <span className="text-gray-600">
                                  Current Lesson:
                                </span>
                                <p className="font-medium text-gray-900 truncate">
                                  {progress.current_lesson}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="pt-4 border-t border-gray-100">
                            <Link
                              to={`/learner/course/practice/${progress.enrollmentId}/course/${progress.course_id}`}
                              className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                            >
                              Continue Learning
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {(!filteredProgress || filteredProgress.length === 0) && (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <div className="mb-4">
                    <FaBook className="mx-auto h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No courses found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {filter === "completed"
                      ? "You haven't completed any courses yet"
                      : filter === "in-progress"
                      ? "You don't have any courses in progress"
                      : "Start your learning journey by enrolling in a course"}
                  </p>
                  <Link
                    to="/explore-courses"
                    className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Browse Courses
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </LearnerLayout>
  );
};

export default Progress;
