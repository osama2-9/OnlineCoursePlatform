import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { InstructorLayout } from "../../layouts/InstructorLayout";
import axios from "axios";
import toast from "react-hot-toast";
import { API } from "../../API/ApiBaseUrl";
import {
  FaArrowLeft,
  FaCloudUploadAlt,
  FaLock,
  FaUnlock,
} from "react-icons/fa";

export const AddLessonToCourse = () => {
  const { courseId, instructorId } = useParams();
  const navigate = useNavigate();
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
  const [dragActive, setDragActive] = useState(false);

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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      toast.success("Video file selected!");
    } else {
      toast.error("Please upload a valid video file.");
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      toast.success("Video file selected!");
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
        navigate(`/instructor/courses/${courseId}/lessons`);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to add lesson");
    } finally {
      setLoading(false);
    }
  };

  return (
    <InstructorLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate(`/instructor/courses/${courseId}/lessons`)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Back to Lessons
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Add New Lesson
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Lesson Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  placeholder="Enter lesson title"
                />
              </div>

              <div>
                <label
                  htmlFor="lesson_order"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Lesson Order
                </label>
                <input
                  type="number"
                  id="lesson_order"
                  name="lesson_order"
                  value={formData.lesson_order}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Short Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                rows={3}
                required
                placeholder="Brief description of the lesson"
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Detailed Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                rows={5}
                required
                placeholder="Detailed lesson content"
              />
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="video_url" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Drop your video here, or{" "}
                      <span className="text-blue-600 hover:text-blue-500">
                        browse
                      </span>
                    </span>
                    <input
                      type="file"
                      id="video_url"
                      name="video_url"
                      onChange={handleVideoChange}
                      className="hidden"
                      accept="video/*"
                      required
                    />
                  </label>
                </div>
                {videoFile && (
                  <p className="mt-2 text-sm text-gray-500">
                    Selected: {videoFile.name}
                  </p>
                )}
              </div>
            </div>

            {uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300 flex items-center justify-center text-xs text-white"
                  style={{ width: `${uploadProgress}%` }}
                >
                  {uploadProgress}%
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_free"
                  name="is_free"
                  checked={formData.is_free}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="is_free"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Make this lesson free
                </label>
              </div>
              {formData.is_free ? (
                <FaUnlock className="text-green-500" />
              ) : (
                <FaLock className="text-gray-500" />
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <span>Creating Lesson...</span>
                  <div className="ml-2 w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                "Create Lesson"
              )}
            </button>
          </form>
        </div>
      </div>
    </InstructorLayout>
  );
};
