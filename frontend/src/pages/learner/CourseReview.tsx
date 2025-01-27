import { useEffect, useState } from "react";
import { LearnerLayout } from "../../layouts/LearnerLayout";
import toast from "react-hot-toast";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import { useAuth } from "../../hooks/useAuth";

interface CourseToReview {
  course_id: number;
  title: string;
  course_img: string;
  category: string;
  instructor: {
    full_name: string;
  };
}

export const CourseReview = () => {
  const { user } = useAuth();

  const [courses, setCourses] = useState<CourseToReview[]>([]);
  const getCoursesToReview = async () => {
    try {
      const res = await axios.get(
        `${API}/learner/get-courses-toReview/${user?.userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const data = await res.data;
      if (data) {
        setCourses(data);
        setRating(0);
        setComment("");
        setSelectedCourse(null);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    }
  };

  useEffect(() => {
    getCoursesToReview();
  }, [user?.userId]);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number>(0);

  const handleSubmitReview = async (courseId: number) => {
    try {
      const res = await axios.post(
        `${API}/learner/submit-review`,
        {
          userId: user?.userId,
          courseId,
          rating,
          comment,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = await res.data;
      if (data) {
        toast.success(data.message);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.error);
    }
  };

  const StarRating = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            className="focus:outline-none"
          >
            <svg
              className={`w-8 h-8 ${
                star <= (hoveredStar || rating)
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  return (
    <LearnerLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Course Reviews</h1>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-blue-700">
              Only completed courses are available for review. Your feedback
              helps improve the learning experience for future students!
            </p>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No completed courses to review yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {courses.map((course) => (
              <div
                key={course.course_id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row gap-4 p-6">
                  <img
                    src={course.course_img}
                    alt={course.title}
                    className="w-48 h-32 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                          {course.title}
                        </h2>
                        <p className="text-gray-600 mt-1">
                          Instructor: {course.instructor.full_name}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    </div>

                    {selectedCourse === course.course_id ? (
                      <div className="mt-6 space-y-4">
                        <div>
                          <label className="block mb-2 font-medium text-gray-700">
                            Your Rating
                          </label>
                          <StarRating />
                        </div>
                        <div>
                          <label className="block mb-2 font-medium text-gray-700">
                            Your Review
                          </label>
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            rows={4}
                            placeholder="What did you think about this course? What did you learn? What could be improved?"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleSubmitReview(course.course_id)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
                          >
                            Submit Review
                          </button>
                          <button
                            onClick={() => setSelectedCourse(null)}
                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200 font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedCourse(course.course_id)}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 inline-flex items-center gap-2 font-medium"
                      >
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Write a Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </LearnerLayout>
  );
};
