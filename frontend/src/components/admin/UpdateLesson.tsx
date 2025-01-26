import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { API } from "../../API/ApiBaseUrl";
import { useAuth } from "../../hooks/useAuth";

interface Lesson {
  lesson_id: number;
  lesson_order: number;
  title: string;
  content: string;
  description: string;
  video_url: File | string | null;
  attachment: File | string | null;
  is_free: boolean;
}

export const UpdateLesson = ({
  lesson,
  courseId,
  onCancel,
  isOpen,
  onUpdate,
}: {
  lesson: Lesson;
  courseId: string;
  onCancel: () => void;
  isOpen: boolean;
  onUpdate: () => void;
}) => {
  const [updatedLesson, setUpdatedLesson] = useState<Lesson>(lesson);

  const { user } = useAuth();


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setUpdatedLesson((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setUpdatedLesson((prev) => ({ ...prev, [name]: value }));
    }
  };

  const toggleIsFree = () => {
    setUpdatedLesson((prev) => ({ ...prev, is_free: !prev.is_free }));
  };

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    const lessonToUpdate = {
      lesson_id: updatedLesson.lesson_id,
      course_id: courseId,
      instructor_id: user?.userId,
      title: updatedLesson.title,
      video_url: updatedLesson.video_url,
      description: updatedLesson.description,
      content: updatedLesson.content,
      attachment: updatedLesson.attachment,
      is_free: updatedLesson.is_free,
    };

    try {
      const res = await axios.put(
        `${API}/lesson/update-lesson`,
        {
          lessonToUpdate,
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
        onUpdate();
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <h2 className="text-2xl font-bold mb-6">Update Lesson</h2>
            <form method="POST" onSubmit={handleUpdateLesson}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={updatedLesson.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Content */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <textarea
                  name="content"
                  value={updatedLesson.content}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={updatedLesson.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              {/* Video Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Video
                </label>
                <input
                  type="file"
                  accept="video/*"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Attachment Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">
                  Attachment (Optional)
                </label>
                <input
                  type="file"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">
                  Lesson Type
                </label>
                <div className="mt-2 flex items-center">
                  <span className="mr-2 text-sm font-medium text-gray-700">
                    {updatedLesson.is_free ? "Free" : "Paid"}
                  </span>
                  <button
                    type="button"
                    onClick={toggleIsFree}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      updatedLesson.is_free ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        updatedLesson.is_free
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={onCancel}
                  type="button"
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
