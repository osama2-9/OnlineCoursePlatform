import axios from "axios";
import toast from "react-hot-toast";
import { API } from "../../API/ApiBaseUrl";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { Loading } from "../Loading";

interface EnrolledCourses {
  enrollment_id: number;
  user_id: number;
  enrollment_date: Date;
  status: "active" | "completed" | "dropped";
  access_granted: boolean;
  course: {
    course_id: number;
    title: string;
    course_img: string;
    category: string;
    instructor: {
      full_name: string;
    };
  };
}

export const EnrolledCourses = ({ userId }: any) => {
  const [enrolledCourses, setEnrolledCourses] = useState<
    EnrolledCourses[] | null
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getEnrolledInCourses = async () => {
    try {
      const res = await axios.get(
        `${API}/learner/get-enrolled-courses/${userId}`,
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
    getEnrolledInCourses();
  }, [userId]);

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loading />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Enrolled Courses
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Your active learning journey
                </p>
              </div>
              <Link
                to="/learner/courses/show"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
              >
                View all
                <FaArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="p-6">
            {enrolledCourses && enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((enrollment) => (
                  <div
                    key={enrollment.course.course_id}
                    className="group bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-300"
                  >
                    <div className="relative">
                      <img
                        src={enrollment.course.course_img}
                        alt={enrollment.course.title}
                        className="w-full h-40  rounded-t-lg"
                      />
                      <div className="absolute top-3 right-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            enrollment.status === "active"
                              ? "bg-blue-100 text-blue-800"
                              : enrollment.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {enrollment.status.charAt(0).toUpperCase() +
                            enrollment.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1">
                          {enrollment.course.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {enrollment.course.category}
                        </p>
                      </div>

                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {enrollment.course.instructor.full_name[0]}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {enrollment.course.instructor.full_name}
                          </p>
                          <p className="text-xs text-gray-500">Instructor</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          Enrolled:{" "}
                          {new Date(
                            enrollment.enrollment_date
                          ).toLocaleDateString()}
                        </span>
                        <Link
                          to={`/learner/course/practice/${enrollment.enrollment_id}/course/${enrollment.course.course_id}`}
                          className="inline-flex items-center px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          Continue
                          <FaArrowRight className="ml-2 w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <FaArrowRight className="w-6 h-6 text-gray-400" />
                  </div>
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
    </div>
  );
};
