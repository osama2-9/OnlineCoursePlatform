import React, { useState } from "react";
import { Calendar, Clock, Award, BookOpen, Loader2 } from "lucide-react";
import { format, differenceInDays, isAfter } from "date-fns";
import { LearnerLayout } from "../../layouts/LearnerLayout";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../supbase/SupbaseClient";
import axiosClient from "../../API/axios";

const AssignmentSubmissionPage = () => {
  const { assignment } = useLocation().state;
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [link, setLink] = useState<string>("");

  const formatDate = (date: Date) => {
    return format(new Date(date), "EEE, MMM d, yyyy");
  };

  const formatTime = (date: Date) => {
    return format(new Date(date), "h:mm a");
  };

  const daysRemaining = () => {
    const today = new Date();
    const end = new Date(assignment.end_date);
    if (isAfter(today, end)) {
      return 0;
    }
    return differenceInDays(end, today);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (
      value &&
      !value.startsWith("http://") &&
      !value.startsWith("https://")
    ) {
      value = "https://" + value;
    }
    setLink(value);
  };

  const handleUploadFileToSupabase = async (file: File) => {
    const filePath = `assignments/${user?.userId}/${Date.now()}_${file.name}`;

    const { error } = await supabase.storage
      .from("uplearn")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error("Upload error:", error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from("uplearn")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  const handleSubmit = async () => {
    try {
      setIsUploading(true);

      if (!selectedFile && !link) {
        toast.error("Please select a file or provide a link");
        setIsUploading(false);
        return;
      }

      let fileUrl = link;

      if (selectedFile) {
        fileUrl = await handleUploadFileToSupabase(selectedFile);
      }

      const res = await axiosClient.post(
        `/assignments/submit-assignment`,
        {
          assignment_id: assignment.assignment_id,
          file_url: fileUrl,
          student_id: user?.userId,
        },
       
      );

      if (res.data) {
        toast.success(res.data.message);
        setSubmitted(true);
      }
    } catch (error: any) {
      console.error("Error submitting assignment:", error);
      toast.error(
        error?.response?.data?.error || "Failed to submit assignment"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const isDeadlinePassed = new Date(assignment.end_date) < new Date();

  return (
    <LearnerLayout>
      <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-sm">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">
              {assignment.title}
            </h1>
          </div>
          <div className="mt-2 flex items-center">
            <Award className="mr-1 text-yellow-500" size={18} />
            <span className="text-gray-600 font-medium">
              {assignment.points} points
            </span>
          </div>
        </div>

        <div className="mb-8 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Assignment Details
          </h2>
          <p className="text-gray-700 mb-6">{assignment.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Calendar className="mr-2 text-gray-500" size={20} />
              <div>
                <div className="text-sm text-gray-500">Start Date</div>
                <div className="font-medium text-gray-700">
                  {formatDate(assignment.start_date)} at{" "}
                  {formatTime(assignment.start_date)}
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <Clock className="mr-2 text-gray-500" size={20} />
              <div>
                <div className="text-sm text-gray-500">Due Date</div>
                <div className="font-medium text-gray-700">
                  {formatDate(assignment.end_date)} at{" "}
                  {formatTime(assignment.end_date)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-gray-100 p-3 rounded-md border border-gray-200">
            <div className="flex items-center">
              <Clock className="mr-2 text-gray-600" size={20} />
              <span className="font-medium text-gray-800">
                {daysRemaining()} days remaining to submit
              </span>
            </div>
          </div>
        </div>

        {!submitted ? (
          <div className="bg-white p-6 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Submit Your Assignment
            </h2>
            {isDeadlinePassed ? (
              <p className="text-red-500 mb-4">
                Assignment submission deadline passed
              </p>
            ) : null}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Upload File
              </label>
              <div className="border-2 border-dashed border-gray-300 p-6 rounded-md text-center bg-gray-50">
                {selectedFile ? (
                  <div className="text-center">
                    <BookOpen
                      className="mx-auto mb-2 text-gray-500"
                      size={32}
                    />
                    <p className="text-gray-800 font-medium">
                      {selectedFile.name}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      className="mt-2 text-sm text-gray-600 underline"
                      onClick={() => setSelectedFile(null)}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">
                      Drag and drop your file here, or
                    </p>
                    <label className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md cursor-pointer hover:bg-gray-300 transition-colors">
                      Browse Files
                      <input
                        type="file"
                        disabled={isDeadlinePassed}
                        className={`hidden ${
                          isDeadlinePassed
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        onChange={handleFileSelect}
                      />
                    </label>
                    <p className="mt-2 text-sm text-gray-500">
                      Supported file types: PDF, DOCX, ZIP (Max 25MB)
                    </p>
                  </div>
                )}
              </div>

              <p className="mt-2 text-sm text-gray-500 mb-2">
                or add a link for your project here (github, gitlab, etc.)
              </p>
              <input
                readOnly={isDeadlinePassed}
                disabled={isDeadlinePassed}
                type="text"
                className={`w-full ${
                  isDeadlinePassed ? "opacity-50 cursor-not-allowed" : ""
                } px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-200`}
                placeholder="Enter project link"
                value={link}
                onChange={handleLinkChange}
              />
            </div>

            {isUploading && (
              <div className="mb-4">
                <div className="flex flex-col items-center justify-center ">
                  <Loader2 className="animate-spin text-blue-500" />
                  <p className="text-gray-500 text-sm mt-4">Uploading</p>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                className={`px-6 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors ${
                  (!selectedFile && !link) || isDeadlinePassed
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={
                  (!selectedFile && !link) || isUploading || isDeadlinePassed
                }
                title={
                  isDeadlinePassed
                    ? "Assignment submission deadline passed"
                    : "Submit"
                }
                onClick={handleSubmit}
              >
                {isUploading ? "Uploading..." : "Submit Assignment"}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Assignment Submitted Successfully!
            </h2>
            <p className="text-gray-700 mb-4">
              Your submission has been received and is now being reviewed.
            </p>
            <div className="mt-6">
              <button className="px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors">
                View Submission
              </button>
            </div>
          </div>
        )}
      </div>
    </LearnerLayout>
  );
};

export default AssignmentSubmissionPage;
