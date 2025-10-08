import { LearnerLayout } from "../../layouts/LearnerLayout";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCertificate, FaClock, FaCheckCircle } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { qureyClinet } from "../../main";
import { Loader2 } from "lucide-react";
import axiosClient from "../../API/axios";
import { Link } from "react-router-dom";

interface Course {
  course_id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  progress: number;
  completed: boolean;
  enrolledAt: string;
  completedAt?: string;
  certificateRequested: boolean;
  certificateUrl?: string;
  certificateStatus: "not_requested" | "pending" | "approved" | "rejected";
}

export const Certifications = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCertificateId, setLoadingCertificateId] = useState<
    string | null
  >(null);
  const [filter, setFilter] = useState<
    "all" | "completed" | "in_progress" | "certified"
  >("all");

  const handleRequestCertificate = async (courseId: string, userId: string) => {
    try {
      setLoadingCertificateId(courseId);
      const response = await axiosClient.post(
        `/certifications/request-certificate`,
        {
          user_id: userId,
          course_id: courseId,
        }
      );
      if (response) {
        toast.success(response.data.message);

        setCourses((prevCourses) =>
          prevCourses.map((course) =>
            course.course_id === courseId
              ? {
                  ...course,
                  certificateStatus: "pending" as const,
                  certificateRequested: true,
                }
              : course
          )
        );

        qureyClinet.invalidateQueries({
          queryKey: ["userenrollmentdata", user?.userId],
        });
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    } finally {
      setLoadingCertificateId(null);
    }
  };

  const getEnrolledInCourses = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get(
        `/certifications/get-course-to-certificate`,
        {
          params: {
            userId: user?.userId,
          },
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return data.data;
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  const { data: enrolledCourses } = useQuery({
    queryKey: ["userenrollmentdata", user?.userId],
    queryFn: getEnrolledInCourses,
    staleTime: 15 * 60 * 1000,
    enabled: !!user?.userId,
    retry: 2,
  });

  useEffect(() => {
    qureyClinet.prefetchQuery({
      queryKey: ["userenrollmentdata", user?.userId],
      queryFn: getEnrolledInCourses,
    });
  }, [user?.userId]);

  useEffect(() => {
    if (enrolledCourses) {
      setCourses(enrolledCourses);
    }
  }, [enrolledCourses]);

  const getStatusBadge = (course: Course) => {
    if (!course.completed) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
          <FaClock className="w-3 h-3" />
          In Progress
        </div>
      );
    }

    switch (course.certificateStatus) {
      case "not_requested":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            <FaCheckCircle className="w-3 h-3" />
            Completed
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
            <FaClock className="w-3 h-3" />
            Certificate Pending
          </div>
        );
      case "approved":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
            <FaCertificate className="w-3 h-3" />
            Certified
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
            <FaCertificate className="w-3 h-3" />
            Request Rejected
          </div>
        );
      default:
        return null;
    }
  };

  const getFilteredCourses = () => {
    switch (filter) {
      case "completed":
        return courses.filter((course) => course.completed);
      case "in_progress":
        return courses.filter((course) => !course.completed);
      case "certified":
        return courses.filter(
          (course) => course.certificateStatus === "approved"
        );
      default:
        return courses;
    }
  };

  const filteredCourses = getFilteredCourses();

  if (loading) {
    return (
      <LearnerLayout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-black">Certifications</h1>
              <p className="text-gray-500">
                Request and download your certificates
              </p>
            </div>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          </div>
        </div>
      </LearnerLayout>
    );
  }

  return (
    <LearnerLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-black">Certifications</h1>
            <p className="text-gray-500">
              Request and download your certificates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {courses.length}
              </div>
              <div className="text-sm text-gray-600">Total Courses</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-green-600">
                {courses.filter((c) => c.completed).length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-black">
                {
                  courses.filter(
                    (c: Course) => c.certificateStatus === "approved"
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">Certified</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-black">
                {
                  courses.filter(
                    (c: Course) => c.certificateStatus === "pending"
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "All Courses" },
                { key: "completed", label: "Completed" },
                { key: "in_progress", label: "In Progress" },
                { key: "certified", label: "Certified" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === key
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course: Course) => (
                <div
                  key={course.course_id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={course.thumbnail || "/api/placeholder/400/200"}
                      alt={course.title}
                      className="w-full h-48"
                    />
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(course)}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {course.description}
                    </p>
                    <p className="text-gray-500 text-sm mb-4">
                      Instructor: {course.instructor}
                    </p>

                    {!course.completed && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <div className="text-xs text-gray-500">
                        Enrolled:{" "}
                        {new Date(course.enrolledAt).toLocaleDateString()}
                        {course.completedAt && (
                          <span className="ml-2">
                            • Completed:{" "}
                            {new Date(course.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-end">
                        {course.completed ? (
                          <>
                            {course.certificateStatus === "not_requested" && (
                              <button
                                className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                onClick={() =>
                                  handleRequestCertificate(
                                    course.course_id,
                                    String(user?.userId)
                                  )
                                }
                                disabled={
                                  loadingCertificateId === course.course_id
                                }
                              >
                                {loadingCertificateId === course.course_id ? (
                                  <Loader2 className="w-3 h-3 animate-spin text-white" />
                                ) : (
                                  "Request Certificate"
                                )}
                              </button>
                            )}
                            {course.certificateStatus === "pending" && (
                              <p className="text-yellow-600 text-sm font-medium">
                                Certificate request pending
                              </p>
                            )}
                            {course.certificateStatus === "approved" && (
                              <Link
                                to={course.certificateUrl || "#"}
                                className="bg-green-600 text-white px-4 py-1 rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Download Certificate
                              </Link>
                            )}
                            {course.certificateStatus === "rejected" && (
                              <button
                                className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                onClick={() =>
                                  handleRequestCertificate(
                                    course.course_id,
                                    String(user?.userId)
                                  )
                                }
                                disabled={
                                  loadingCertificateId === course.course_id
                                }
                              >
                                {loadingCertificateId === course.course_id ? (
                                  <Loader2 className="w-3 h-3 animate-spin text-white" />
                                ) : (
                                  "Request Again"
                                )}
                              </button>
                            )}
                          </>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            Course not completed
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FaCertificate className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No courses found
              </h3>
              <p className="text-gray-600">
                {filter === "all"
                  ? "You haven't enrolled in any courses yet."
                  : `No courses match the "${filter}" filter.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </LearnerLayout>
  );
};
