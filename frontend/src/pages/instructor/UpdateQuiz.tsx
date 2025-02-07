import { useState, useEffect } from "react";
import { InstructorLayout } from "../../layouts/InstructorLayout";
import toast from "react-hot-toast";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import { useLocation, useNavigate } from "react-router-dom";

export const UpdateQuiz = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(state?.title || "");
  const [duration, setDuration] = useState<number>(state?.duration || 0);
  const [description, setDescription] = useState<string>(
    state?.description || ""
  );
  const [maxAttempts, setMaxAttempts] = useState<number>(
    state?.maxAttempts || 1
  );

  useEffect(() => {
    if (!state?.quizId) {
      toast.error("No quiz selected for update");
      navigate("/instructor/quizzes");
    }
  }, [state, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const res = await axios.put(
        `${API}/instructor/update-quiz`,
        {
          quizId: state?.quizId,
          title,
          description,
          max_attempts: maxAttempts,
          duration,
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
        navigate("/instructor/quizess");
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to update quiz");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <InstructorLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Update Quiz</h1>

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

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/instructor/quizzes")}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
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
                  Updating...
                </div>
              ) : (
                "Update Quiz"
              )}
            </button>
          </div>
        </form>
      </div>
    </InstructorLayout>
  );
};
