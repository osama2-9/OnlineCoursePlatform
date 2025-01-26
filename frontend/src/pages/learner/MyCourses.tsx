import { useEffect, useState } from "react";
import { LearnerLayout } from "../../layouts/LearnerLayout";
import toast from "react-hot-toast";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import { useAuth } from "../../hooks/useAuth";
import { Loading } from "../../components/Loading";
import { Link } from "react-router-dom";
import { FaBook } from "react-icons/fa";

interface EnrolledCourses {
  enrollment_id: number;
  user_id: number;
  enrollment_date: Date;
  status: "active" | "completed" | "dropped";
  access_granted: boolean;
  course: {
    course_id: number;
    title: string;
    description: string;
    course_img: string;
    category: string;
    instructor: {
      full_name: string;
    };
  };
}

export const MyCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<
    EnrolledCourses[] | null
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();
  const getCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/learner/get-enrolled-courses/${user?.userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = await res.data;
      if (data) {
        setEnrolledCourses(data);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCourses();
  }, [user?.userId]);
  return (
    <LearnerLayout>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loading />
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
              <p className="text-gray-600 mt-1">Manage your enrolled courses</p>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses?.map((course) => (
                <div
                  key={course.enrollment_id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="relative">
                    <img
                      src={course.course.course_img}
                      alt={course.course.title}
                      className="w-full h-52  rounded-t-xl"
                    />
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          course.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : course.status === "active"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {course.status.charAt(0).toUpperCase() +
                          course.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {course.course.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {course.course.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        Instructor: {course.course.instructor.full_name}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500">
                        Enrolled:{" "}
                        {new Date(course.enrollment_date).toLocaleDateString()}
                      </span>
                      <Link
                        to={`/learner/course/practice/${course.enrollment_id}/course/${course.course.course_id}`}
                        className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Continue Learning
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {enrolledCourses?.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <div className="mb-4">
                  <FaBook className="mx-auto h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No courses enrolled
                </h3>
                <p className="text-gray-500 mb-6">
                  Start your learning journey by enrolling in a course
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
        </div>
      )}
    </LearnerLayout>
  );
};
