import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import { VideoPlayer } from "../components/VideoPlayer";
import { Loading } from "../components/Loading";
import toast from "react-hot-toast";
import { API } from "../API/ApiBaseUrl";
import { useAuth } from "../hooks/useAuth";
import { loadStripe } from "@stripe/stripe-js";

const PBK = import.meta.env.VITE_PUBLISH_KEY;
const stripePromise = loadStripe(PBK);

interface CourseDetails {
  course_id: string;
  title: string;
  description: string;
  price: number;
  course_type: string;
  course_img: string;
  category: string;
  instructor: {
    user_id: number;
    full_name: string;
  };
  learning_outcomes: string[];
  lessons: {
    lesson_id: number;
    title: string;
    description: string;
    video_url: string;
    is_free: boolean;
    attachment: string[];
  }[];
}

interface CourseResponse {
  course: CourseDetails;
}
export const CoursePage = () => {
  const { user } = useAuth();
  const [selectedLecture, setSelectedLecture] = useState<number | null>(null);
  const [course, setCourse] = useState<CourseDetails | undefined>();
  const [isCourseLoading, setIsCourseLoading] = useState<boolean>(false);

  const { course_id } = useParams();

  const getCourseDetails = async () => {
    try {
      setIsCourseLoading(true);
      const res = await axios.get<CourseResponse>(
        `${API}/course/course-details/${course_id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const data = res.data;
      if (data) {
        setCourse(data.course);
        console.log(data);
      }
    } catch (error: any) {
      console.log(error);
    } finally {
      setIsCourseLoading(false);
    }
  };

  useEffect(() => {
    getCourseDetails();
  }, [course_id]);

  const handleLectureClick = (index: number) => {
    setSelectedLecture(selectedLecture === index ? null : index);
  };

  const renderLockIcon = () => (
    <div className="flex items-center justify-center p-10 bg-gray-200 rounded-lg">
      <FaLock className="text-gray-500" size={24} />
      <span className="ml-2 text-gray-500">Locked</span>
    </div>
  );

  const lessonsLength = course?.lessons?.length;
  const handlePayment = async () => {
    try {
      const res = await axios.post(
        `${API}/payment/create-checkout-session`,
        {
          userId: user?.userId,
          courseId: course?.course_id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const data = res.data;

      if (data && data.sessionId) {
        const stripe = await stripePromise;

        const result = await stripe?.redirectToCheckout({
          sessionId: data.sessionId,
        });

        if (result?.error) {
          console.error("Error during checkout redirection:", result.error);
        }
      }
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.error ||
          "Payment failed. Please try again later."
      );
    }
  };

  return (
    <>
      {isCourseLoading ? (
        <Loading />
      ) : (
        <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen p-6 flex justify-center">
          <div className="bg-white shadow-lg rounded-xl w-full max-w-7xl p-8">
            {/* Header Section */}
            <div className="border-b pb-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
                  {course?.title}
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {course?.description}
                </p>
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm text-gray-500">Instructor</p>
                    <p className="text-gray-800 font-medium">
                      {course?.instructor?.full_name}
                    </p>
                  </div>
                  <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                    <span className="text-yellow-500 text-xl">★</span>
                    <span className="text-gray-700 ml-1 font-medium">4.6</span>
                    <span className="text-gray-500 ml-2">(2037)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Content */}
              <div className="col-span-2 space-y-8">
                {/* Learning Outcomes */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    What you'll learn
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course?.learning_outcomes?.map((lo, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <svg
                          className="w-5 h-5 text-green-500 mt-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-gray-600">{lo}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Course Content */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Course content
                    </h2>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {lessonsLength} lessons
                    </span>
                  </div>
                  <div className="border rounded-xl divide-y overflow-hidden">
                    {course?.lessons?.map((lecture, index) => (
                      <div
                        key={lecture.lesson_id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <div className="p-4">
                          <div
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() => handleLectureClick(index)}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-sm font-medium">
                                {index + 1}
                              </span>
                              <span className="text-gray-800 font-medium">
                                {lecture?.title}
                              </span>
                            </div>
                            <span
                              className={`${
                                lecture.is_free
                                  ? "text-green-500"
                                  : "text-orange-500"
                              }`}
                            >
                              {lecture.is_free ? (
                                "Preview"
                              ) : (
                                <FaLock size={16} />
                              )}
                            </span>
                          </div>
                          {selectedLecture === index && (
                            <div className="mt-2 text-gray-600 mb-3 text-sm">
                              <p className="mb-4">{lecture.description}</p>
                              {lecture.is_free ? (
                                <VideoPlayer
                                  videoUrl={`${lecture.video_url}`}
                                />
                              ) : (
                                renderLockIcon()
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Content - Course Card */}
              <div className="sticky top-6">
                <div className="bg-white border rounded-xl shadow-lg overflow-hidden">
                  <img
                    src={course?.course_img}
                    alt="Course thumbnail"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-bold text-gray-800">
                        ${course?.price?.toFixed(2)}
                      </h2>
                    </div>
                    <button
                      onClick={handlePayment}
                      className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <span>
                        {course?.course_type === "free"
                          ? "Enroll now"
                          : "Buy this course"}
                      </span>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </button>

                    <div className="border-t pt-6">
                      <h3 className="font-medium text-gray-800 mb-2">
                        For teams & companies
                      </h3>
                      <p className="text-sm text-gray-600">
                        Get special pricing for teams of 5 or more people.
                        Contact us for details.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CoursePage;
