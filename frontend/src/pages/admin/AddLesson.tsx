import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { AdminLayout } from "../../layouts/AdminLayout";
import axios from "axios";
import toast from "react-hot-toast";
import { API } from "../../API/ApiBaseUrl";

export const AddLesson = () => {
  const { courseId, instructorId } = useParams();
  const cloudinaryUrl = import.meta.env.VITE_CLOUDINARY_BASE_URL;
  const cloudinaryCloude = import.meta.env.VITE_CLOUDE_NAME;
  const cloudinaryUploadrePreset = import.meta.env.VITE_UPLOAD_PRESET;
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    description: "",
    video_url: "",
    attachment: "",
    is_free: false,
    lesson_order: 1,
  });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      console.log("Video file selected:", file.name);
    } else {
      toast.error("Please upload a valid video file.");
      setVideoFile(null);
    }
  };

  const uploadVideo = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", `${cloudinaryUploadrePreset}`);

    try {
      const response = await axios.post(
        `${cloudinaryUrl}/${cloudinaryCloude}/video/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              setUploadProgress(progress);
            }
          },
        }
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Failed to upload video:", error);
      toast.error("Failed to upload video.");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!instructorId) {
        toast.error("Instructor ID is missing. Please log in again.");
        return;
      }

      let videoUrl = formData.video_url;
      if (videoFile) {
        videoUrl = await uploadVideo(videoFile);
        if (!videoUrl) {
          setLoading(false);
          return;
        }
      }

      const payload = {
        ...formData,
        video_url: videoUrl,
        instructor_id: instructorId,
        course_id: courseId,
      };

      const response = await axios.post(
        `${API}/lesson/create-lesson`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        toast.success("Lesson added successfully!");
        setFormData({
          title: "",
          content: "",
          description: "",
          video_url: "",
          attachment: "",
          is_free: false,
          lesson_order: 1,
        });
        setVideoFile(null);
        setUploadProgress(0);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to add lesson");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Add New Lesson</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={3}
              required
            />
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700"
            >
              Content
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={5}
              required
            />
          </div>

          {/* Lesson Order */}
          <div>
            <label
              htmlFor="lesson_order"
              className="block text-sm font-medium text-gray-700"
            >
              Lesson Order
            </label>
            <input
              type="number"
              id="lesson_order"
              name="lesson_order"
              value={formData.lesson_order}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              min="1"
              required
            />
          </div>

          <div>
            <label
              htmlFor="video_url"
              className="block text-sm font-medium text-gray-700"
            >
              Upload Video
            </label>
            <input
              type="file"
              id="video_url"
              name="video_url"
              onChange={handleVideoChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              accept="video/*"
              required
            />
          </div>

          {uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full">
              <div
                className="bg-orange-600 text-xs font-medium text-white text-center p-0.5 leading-none rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              >
                {uploadProgress}%
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="attachment"
              className="block text-sm font-medium text-gray-700"
            >
              Attachment (Optional)
            </label>
            <input
              type="file"
              id="attachment"
              name="attachment"
              value={formData.attachment}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_free"
              name="is_free"
              checked={formData.is_free}
              onChange={handleInputChange}
              className="h-4 w-4 text-black focus:ring-orange-500 border-gray-300 rounded"
            />
            <label
              htmlFor="is_free"
              className="ml-2 block text-sm text-gray-700"
            >
              Is this lesson free?
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-black text-white font-semibold rounded-md  focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <span>Adding Lesson...</span>
                  <div className="ml-2 w-4 h-4 border-2 border-white border-t-2 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                "Add Lesson"
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
