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
        `/api/course/course-details/${course_id}`,
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
        <>
          <div className="bg-gray-50 min-h-screen p-6 flex justify-center">
            <div className="bg-white shadow-md rounded-lg w-full  p-6">
              <div className="border-b pb-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {course?.title}
                  </h1>
                  <p className="text-gray-600 mt-2">{course?.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Author:{" "}
                    <span className="text-gray-800 font-medium">
                      {course?.instructor?.full_name}
                    </span>
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-yellow-500 text-xl">★</span>
                    <span className="text-gray-700 ml-1 text-sm font-medium">
                      4.6
                    </span>
                    <span className="text-gray-500 ml-2 text-sm">
                      (2037 reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Content */}
                <div className="col-span-2">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    What will you learn?
                  </h2>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    {course?.learning_outcomes?.map((lo, Idx) => (
                      <li key={Idx}>{lo}</li>
                    ))}
                  </ul>

                  <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-4">
                    Course content
                  </h2>
                  <p className="text-sm text-gray-500 mb-2">
                    {lessonsLength} lesson
                  </p>
                  <div className="border rounded-lg divide-y">
                    {course?.lessons?.map((lecture, index) => (
                      <div key={lecture.lesson_id} className="p-4">
                        <div
                          className="flex justify-between items-center cursor-pointer"
                          onClick={() => handleLectureClick(index)}
                        >
                          <span className="text-gray-800 font-medium">
                            {lecture?.title}
                          </span>
                          <span className="text-orange-500">
                            {lecture.is_free ? "Preview" : <FaLock size={20} />}
                          </span>
                        </div>
                        {selectedLecture === index && (
                          <div className="mt-2 text-gray-600 mb-3 text-sm">
                            <p className="mb-4">{lecture.description}</p>
                            {lecture.is_free ? (
                              <VideoPlayer videoUrl={`${lecture.video_url}`} />
                            ) : (
                              renderLockIcon()
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Content */}
                <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
                  <img
                    src={course?.course_img}
                    alt="Course thumbnail"
                    className="w-full h-52 mt-4 md:mt-0 rounded-lg"
                  />
                  <br />
                  <div className="mb-4">
                    <h2 className="text-3xl font-bold text-gray-800">
                      ${course?.price?.toFixed(2)}
                    </h2>
                    <button
                      onClick={handlePayment}
                      className="bg-orange-500 text-white w-full py-3 mt-4 rounded-md hover:bg-gray-900"
                    >
                      {course?.course_type === "free"
                        ? "Enroll now"
                        : "Buy this course"}
                    </button>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-medium text-gray-800">
                      Educating 5+ people?
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CoursePage;
