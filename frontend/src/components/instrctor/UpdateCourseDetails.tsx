import React, { useState, useEffect } from "react";
import { CourseDetails } from "../../hooks/useGetInstructorCourses";
import toast from "react-hot-toast";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import { useAuth } from "../../hooks/useAuth";

interface UpdateCourseDetailsProps {
  course: CourseDetails;
  onClose: () => void;
}
export const UpdateCourseDetails = ({
  course,
  onClose,
}: UpdateCourseDetailsProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(course?.title || "");
  const [description, setDescription] = useState(course?.description || "");
  const [learningOutcomes, setLearningOutcomes] = useState(
    course?.learning_outcomes || [""]
  );

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description);
      setLearningOutcomes(course.learning_outcomes || [""]);
    }
  }, [course]);

  const handleLearningOutcomeChange = (index: number, value: string) => {
    const newOutcomes = [...learningOutcomes];
    newOutcomes[index] = value;
    setLearningOutcomes(newOutcomes);
  };

  const addLearningOutcome = () => {
    setLearningOutcomes([...learningOutcomes, ""]);
  };

  const removeLearningOutcome = (index: number) => {
    const newOutcomes = learningOutcomes.filter((_, i) => i !== index);
    setLearningOutcomes(newOutcomes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${API}/instructor/update-course`,
        {
          instructorId: user?.userId,
          courseId: course?.course_id,
          title: title,
          description: description,
          learning_outcomes: learningOutcomes,
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
        onClose();
        setDescription("");
        setTitle("");
        setLearningOutcomes([]);
        toast.success(data.message);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    }

    onClose();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Update Course Details</h2>

      {/* Title Field */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      {/* Description Field */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          rows={4}
          required
        />
      </div>

      {/* Learning Outcomes */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Learning Outcomes
        </label>
        {learningOutcomes.map((outcome: string, index: number) => (
          <div key={index} className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={outcome}
              onChange={(e) =>
                handleLearningOutcomeChange(index, e.target.value)
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            {learningOutcomes.length > 1 && (
              <button
                type="button"
                onClick={() => removeLearningOutcome(index)}
                className="   rounded-md text-red-500"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addLearningOutcome}
          className="mt-2 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
        >
          Add Learning Outcome
        </button>
      </div>

      {/* Submit and Close Buttons */}
      <div className="mt-6 flex justify-end space-x-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Close
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Update Course
        </button>
      </div>
    </div>
  );
};
