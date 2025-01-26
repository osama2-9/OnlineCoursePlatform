import React, { useState } from "react";
import { InstructorLayout } from "../../layouts/InstructorLayout";
import Select from "react-select";
import { useGetInstructorCourses } from "../../hooks/useGetInstructorCourses";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";

interface CourseOptions {
  label: string;
  value: number;
}

export const CreateQuiz = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<CourseOptions | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const { courses } = useGetInstructorCourses();
  const { user } = useAuth();

  const courseOptions: CourseOptions[] =
    courses?.map((course) => ({
      label: course.title,
      value: course.course_id,
    })) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(`${API}/instructor/create-quiz`, {
        instructorId: user?.userId,
        courseId: selectedCourse?.value,
        title: title,
        description: description,
        duration: duration,
        maxAttempts: maxAttempts,
      } ,{
        headers:{
            "Content-Type":"application/json"
        },
        withCredentials:true
      });
      const data = await res.data;
      if (data) {
        toast.success(data.message);
        setTitle("");
        setDescription("");
        setMaxAttempts(0);
        setDuration(0);
        setSelectedCourse(null);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <InstructorLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Create Quiz</h1>

        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md"
        >
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter quiz title"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={5}
              placeholder="Enter quiz description"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                placeholder="Enter duration"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Attempts
              </label>
              <input
                type="number"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(parseInt(e.target.value))}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                placeholder="Enter max attempts"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course
            </label>
            <Select<CourseOptions>
              options={courseOptions}
              value={selectedCourse}
              onChange={(selectedOption) => setSelectedCourse(selectedOption)}
              className="mt-1"
              placeholder="Select a course"
              isSearchable
              required
              styles={{
                control: (base) => ({
                  ...base,
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  borderColor: "#D1D5DB",
                  "&:hover": {
                    borderColor: "#D1D5DB",
                  },
                }),
              }}
            />
          </div>

          <div className="mb-8 p-4 bg-gray-100 text-gray-800 rounded-lg">
            <p className="text-sm">
              <strong>Note:</strong> The quiz will not be published until you
              add questions.
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </div>
              ) : (
                "Create Quiz"
              )}
            </button>
          </div>
        </form>
      </div>
    </InstructorLayout>
  );
};
