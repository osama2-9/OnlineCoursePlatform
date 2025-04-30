import { CheckCircle, FileText, XCircle } from "lucide-react";
import { Lesson } from "../../types/ModerationDashboardTypes";
import { VideoPlayer } from "../VideoPlayer";

interface LessonContentProps {
  lesson: Lesson;
  handleApprove: (lessonId: number) => void;
  handleReject: (lessonId: number) => void;
  isApproveLoading: boolean;
  setModerationNote: (note: string) => void;
  moderationNote: string;
  isRejectLoading: boolean;
}

const LessonContent = ({
  lesson,
  handleApprove,
  isApproveLoading,
  handleReject,
  moderationNote,
  setModerationNote,
  isRejectLoading,
}: LessonContentProps) => {
  const formatDate = (dateValue: string | Date | undefined) => {
    if (!dateValue) return "N/A";

    try {
      if (typeof dateValue === "string") {
        return dateValue;
      }
      return dateValue.toLocaleDateString();
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">{lesson.title}</h2>
          <div className="flex items-center mt-1 text-sm text-gray-500">
            <span className="capitalize mr-2">{lesson.type}</span>
            <span>•</span>
            <span className="ml-2">By {lesson.author_name}</span>
          </div>
        </div>
        <div className="flex space-x-3">
          {lesson.status === "pending" && (
            <>
              <button
                onClick={() => handleReject(lesson.lesson_id || 0)}
                disabled={isRejectLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </button>
              <button
                onClick={() => handleApprove(lesson.lesson_id || 0)}
                disabled={isApproveLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isApproveLoading ? "Approving..." : "Approve"}
              </button>
            </>
          )}
          {lesson.status === "approved" && (
            <div className="flex items-center text-green-700">
              <CheckCircle className="h-5 w-5 mr-1" />
              <span>Approved on {formatDate(lesson.created_at)}</span>
            </div>
          )}
          {lesson.status === "rejected" && (
            <div className="flex items-center text-red-700">
              <XCircle className="h-5 w-5 mr-1" />
              <span>Rejected on {formatDate(lesson.created_at)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-sm font-medium text-gray-700">
            Lesson Description
          </h3>
          <div className="mt-2 text-sm text-gray-500">
            <p>{lesson.description}</p>
          </div>
        </div>

        {lesson.video_url && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-sm font-medium text-gray-700">Video Content</h3>
            <div className="mt-2 aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-gray-500 text-center">
                <p>Video URL: {lesson.video_url}</p>
                <p className="text-xs mt-1">
                  <VideoPlayer
                    key={lesson.lesson_id}
                    videoUrl={lesson.video_url}
                  />
                </p>
              </div>
            </div>
          </div>
        )}

        {lesson.content && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-sm font-medium text-gray-700">
              Lesson Content
            </h3>
            <div className="mt-2 prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
            </div>
          </div>
        )}

        {lesson.attachment && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-sm font-medium text-gray-700">Attachments</h3>
            <div className="mt-2">
              <div className="flex items-center p-2 bg-white rounded border border-gray-200">
                <FileText className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-blue-600 hover:underline">
                  {lesson.attachment}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-sm font-medium text-gray-700">Metadata</h3>
          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">ID</p>
              <p className="font-medium text-gray-900">
                {lesson.lesson_id || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Type</p>
              <p className="font-medium text-gray-900 capitalize">
                {lesson.type || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Author</p>
              <p className="font-medium text-gray-900">
                {lesson.author_name || "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Created At</p>
              <p className="font-medium text-gray-900">
                {formatDate(lesson.created_at)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <p
                className={`font-medium capitalize ${
                  lesson.status === "pending"
                    ? "text-yellow-700"
                    : lesson.status === "approved"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {lesson.status || "unknown"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700">
            Moderation Notes
          </h3>
          <textarea
            className="mt-2 w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            rows={4}
            placeholder="Add moderation notes here (optional)"
            value={moderationNote}
            onChange={(e) => setModerationNote(e.target.value)}
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default LessonContent;
