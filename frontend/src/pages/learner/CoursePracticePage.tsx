import axios from "axios";
import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { API } from "../../API/ApiBaseUrl";
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { VideoPlayer } from "../../components/VideoPlayer";
import { Loading } from "../../components/Loading";

interface Lessons {
  title: string;
  video_url: string;
  description: string;
  lesson_id: number;
  attachment: string;
  lesson_order: number;
}

interface ProgressData {
  progress_id: number;
  lesson_id: number;
  user_id: number;
  course_id: number;
  is_completed: boolean;
  progress_percentage: number;
  last_accessed: string;
  time_spent: number;
  lesson: {
    lesson_id: number;
    title: string;
    lesson_order: number;
    duration?: number;
    course_id: number;
  };
}

interface CompletedLessonsResponse {
  message: string;
  data: ProgressData[];
  metadata: {
    user_id: number;
    course_id: number;
    course_title: string;
    user_name: string;
    total_lessons_in_course: number;
    total_progress_entries: number;
    completed_lessons: number;
    in_progress_lessons: number;
    completion_percentage: number;
    last_activity: number | null;
  };
  summary: {
    completed: Array<{
      lesson_id: number;
      lesson_title: string;
      lesson_order: number;
      completed_at: string;
      progress_percentage: number;
    }>;
    in_progress: Array<{
      lesson_id: number;
      lesson_title: string;
      lesson_order: number;
      last_accessed: string;
      progress_percentage: number;
    }>;
  };
}

const CoursePracticePage = () => {
  const { enrollmentId, courseId } = useParams<{
    enrollmentId: string;
    courseId: string;
  }>();
  const { user } = useAuth();

  const [lessons, setLessons] = useState<Lessons[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lessons | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [progressLoading, setProgressLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [progressData, setProgressData] =
    useState<CompletedLessonsResponse | null>(null);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState<number | null>(
    null
  );

  const progressMap = useMemo(() => {
    const map: { [key: number]: boolean } = {};
    if (progressData?.data) {
      progressData.data.forEach((progress) => {
        map[progress.lesson_id] = progress.is_completed;
      });
    }
    return map;
  }, [progressData]);

  const getLessons = useCallback(async () => {
    if (!enrollmentId || !courseId) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${API}/learner/get-lessons/${enrollmentId}/course/${courseId}`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.data) {
        const sortedLessons = response.data.sort(
          (a: Lessons, b: Lessons) => a.lesson_order - b.lesson_order
        );
        setLessons(sortedLessons);
      }
    } catch (error: any) {
      console.error("Error fetching lessons:", error);
      toast.error(error?.response?.data?.error || "Failed to fetch lessons");
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [enrollmentId, courseId]);

  // Get completed lessons function
  const getCompletedLessons = useCallback(async () => {
    if (!user?.userId || !courseId) return;

    try {
      setProgressLoading(true);
      const response = await axios.get(
        `${API}/learner/get-completed-lessons/user/${user.userId}/course/${courseId}`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      setProgressData(response.data);
    } catch (error: any) {
      console.error("Error fetching progress:", error);
      toast.error(error?.response?.data?.error || "Failed to fetch progress");
      setProgressData(null);
    } finally {
      setProgressLoading(false);
    }
  }, [user?.userId, courseId]);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([getLessons(), getCompletedLessons()]);
    };
    loadData();
  }, [getLessons, getCompletedLessons]);

  useEffect(() => {
    if (!lessons.length) return;

    const lastWatchedLessonId = localStorage.getItem(
      `lastWatchedLesson_${courseId}`
    );

    if (lastWatchedLessonId) {
      const lesson = lessons.find(
        (l) => l.lesson_id === parseInt(lastWatchedLessonId)
      );
      if (lesson) {
        setSelectedLesson(lesson);
        return;
      }
    }

    if (progressData?.data) {
      const incompleteLesson = lessons.find(
        (lesson) => !progressMap[lesson.lesson_id]
      );
      if (incompleteLesson) {
        setSelectedLesson(incompleteLesson);
        return;
      }
    }

    setSelectedLesson(lessons[0]);
  }, [lessons, progressData, progressMap, courseId]);

  const handleLessonSelect = useCallback(
    (lesson: Lessons) => {
      setSelectedLesson(lesson);
      localStorage.setItem(
        `lastWatchedLesson_${courseId}`,
        lesson.lesson_id.toString()
      );
    },
    [courseId]
  );

  const markLessonAsComplete = useCallback(
    async (lessonId: number) => {
      if (!user?.userId || !courseId) return;

      const currentStatus = progressMap[lessonId] || false;
      const newStatus = !currentStatus;

      // Optimistic update
      setProgressData((prev) => {
        if (!prev) return prev;

        const updatedData = prev.data.map((progress) =>
          progress.lesson_id === lessonId
            ? {
                ...progress,
                is_completed: newStatus,
                last_accessed: new Date().toISOString(),
              }
            : progress
        );

        const lessonExists = prev.data.some((p) => p.lesson_id === lessonId);
        if (!lessonExists) {
          const lesson = lessons.find((l) => l.lesson_id === lessonId);
          if (lesson) {
            updatedData.push({
              progress_id: Date.now(),
              lesson_id: lessonId,
              user_id: user.userId!,
              course_id: parseInt(courseId),
              is_completed: newStatus,
              progress_percentage: newStatus ? 100 : 0,
              last_accessed: new Date().toISOString(),
              time_spent: 0,
              lesson: {
                lesson_id: lessonId,
                title: lesson.title,
                lesson_order: lesson.lesson_order,
                course_id: parseInt(courseId),
              },
            });
          }
        }

        const completedCount = updatedData.filter((p) => p.is_completed).length;
        const totalLessons = prev.metadata.total_lessons_in_course;

        return {
          ...prev,
          data: updatedData,
          metadata: {
            ...prev.metadata,
            completed_lessons: completedCount,
            completion_percentage:
              totalLessons > 0
                ? Math.round((completedCount / totalLessons) * 100)
                : 0,
          },
        };
      });

      try {
        setIsUpdatingProgress(lessonId);

        await axios.post(
          `${API}/learner/mark-complete-lesson`,
          {
            lessonId,
            courseId: parseInt(courseId),
            userId: user.userId,
            completed: newStatus,
          },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        toast.success(
          newStatus
            ? "Lesson marked as completed"
            : "Lesson marked as incomplete"
        );
      } catch (error: any) {
        console.error("Error updating progress:", error);
        toast.error(
          error?.response?.data?.error || "Failed to update progress"
        );

        await getCompletedLessons();
      } finally {
        setIsUpdatingProgress(null);
      }
    },
    [user?.userId, courseId, progressMap, lessons, getCompletedLessons]
  );

  // Navigation functions
  const goToNextLesson = useCallback(() => {
    if (!selectedLesson || !lessons.length) return;

    const currentIndex = lessons.findIndex(
      (lesson) => lesson.lesson_id === selectedLesson.lesson_id
    );

    if (currentIndex < lessons.length - 1) {
      const nextLesson = lessons[currentIndex + 1];
      handleLessonSelect(nextLesson);
    }
  }, [selectedLesson, lessons, handleLessonSelect]);

  const goToPreviousLesson = useCallback(() => {
    if (!selectedLesson || !lessons.length) return;

    const currentIndex = lessons.findIndex(
      (lesson) => lesson.lesson_id === selectedLesson.lesson_id
    );

    if (currentIndex > 0) {
      const prevLesson = lessons[currentIndex - 1];
      handleLessonSelect(prevLesson);
    }
  }, [selectedLesson, lessons, handleLessonSelect]);

  // Filter lessons based on search
  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) =>
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [lessons, searchQuery]);

  // Calculate completion stats
  const completionStats = useMemo(() => {
    const totalLessons = lessons.length;
    const completedCount = Object.values(progressMap).filter(Boolean).length;
    const completionPercentage =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return {
      totalLessons,
      completedCount,
      completionPercentage,
    };
  }, [lessons.length, progressMap]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading />
      </div>
    );
  }

  // Error state - no lessons
  if (!lessons.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Lessons Available
            </h2>
            <p className="text-gray-600 mb-4">
              This course doesn't have any lessons yet.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {progressData?.metadata.course_title || "Course Progress"}
              </h1>
              <p className="text-gray-600 mt-1">
                Track your learning journey
                {progressData?.metadata.user_name && (
                  <span className="ml-2 text-sm">
                    • Welcome, {progressData.metadata.user_name}
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Completion</p>
                <p className="text-2xl font-bold text-gray-900">
                  {progressLoading
                    ? "..."
                    : `${completionStats.completionPercentage}%`}
                </p>
              </div>

              <div
                className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${
                  completionStats.completionPercentage === 100
                    ? "border-green-500 bg-green-50"
                    : "border-orange-500"
                }`}
              >
                <span
                  className={`text-sm font-bold ${
                    completionStats.completionPercentage === 100
                      ? "text-green-600"
                      : "text-orange-500"
                  }`}
                >
                  {completionStats.completedCount}/
                  {completionStats.totalLessons}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>
                {completionStats.completedCount} of{" "}
                {completionStats.totalLessons} lessons completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  completionStats.completionPercentage === 100
                    ? "bg-green-500"
                    : "bg-orange-500"
                }`}
                style={{ width: `${completionStats.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar: Lessons List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Lessons ({lessons.length})
                </h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search lessons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredLessons.map((lesson) => {
                  const isCompleted = progressMap[lesson.lesson_id] || false;
                  const isSelected =
                    selectedLesson?.lesson_id === lesson.lesson_id;
                  const isUpdating = isUpdatingProgress === lesson.lesson_id;

                  return (
                    <button
                      key={lesson.lesson_id}
                      onClick={() => handleLessonSelect(lesson)}
                      className={`w-full p-4 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                        isSelected
                          ? "bg-orange-500 text-white shadow-md"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            isSelected
                              ? "bg-white text-orange-500"
                              : isCompleted
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {lesson.lesson_order}
                        </div>
                        <div className="text-left">
                          <p
                            className={`font-medium text-sm ${
                              isSelected ? "text-white" : "text-gray-700"
                            }`}
                          >
                            {lesson.title}
                          </p>
                          {isCompleted && (
                            <p className="text-xs text-green-600 font-medium">
                              Completed
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markLessonAsComplete(lesson.lesson_id);
                        }}
                        disabled={isUpdating}
                        className={`w-5 h-5 rounded border-2 transition-colors flex items-center justify-center ${
                          isSelected
                            ? "border-white"
                            : isCompleted
                            ? "border-green-500 bg-green-500"
                            : "border-gray-300 hover:border-orange-500"
                        }`}
                      >
                        {isUpdating ? (
                          <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          isCompleted && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )
                        )}
                      </button>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content: Selected Lesson */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {selectedLesson ? (
                <div>
                  {/* Lesson Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                          {selectedLesson.lesson_order}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            {selectedLesson.title}
                          </h2>
                          {progressMap[selectedLesson.lesson_id] && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          markLessonAsComplete(selectedLesson.lesson_id)
                        }
                        disabled={
                          isUpdatingProgress === selectedLesson.lesson_id
                        }
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          progressMap[selectedLesson.lesson_id]
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-orange-500 text-white hover:bg-orange-600"
                        }`}
                      >
                        {isUpdatingProgress === selectedLesson.lesson_id
                          ? "Updating..."
                          : progressMap[selectedLesson.lesson_id]
                          ? "Mark Incomplete"
                          : "Mark Complete"}
                      </button>
                    </div>

                    {selectedLesson.description && (
                      <p className="text-gray-600">
                        {selectedLesson.description}
                      </p>
                    )}
                  </div>

                  {/* Video Player */}
                  {selectedLesson.video_url && (
                    <div className="aspect-video">
                      <VideoPlayer
                        videoUrl={selectedLesson.video_url}
                        key={selectedLesson.lesson_id}
                      />
                    </div>
                  )}

                  {/* Lesson Content */}
                  <div className="p-6">
                    {selectedLesson.attachment && (
                      <div className="mb-6">
                        <a
                          href={selectedLesson.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          Download Materials
                        </a>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <button
                        onClick={goToPreviousLesson}
                        disabled={
                          lessons.findIndex(
                            (l) => l.lesson_id === selectedLesson.lesson_id
                          ) === 0
                        }
                        className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                        Previous
                      </button>

                      <span className="text-sm text-gray-500">
                        Lesson {selectedLesson.lesson_order} of {lessons.length}
                      </span>

                      <button
                        onClick={goToNextLesson}
                        disabled={
                          lessons.findIndex(
                            (l) => l.lesson_id === selectedLesson.lesson_id
                          ) ===
                          lessons.length - 1
                        }
                        className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <svg
                          className="w-5 h-5 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                    />
                  </svg>
                  <p className="text-xl font-medium text-gray-900 mb-2">
                    Select a lesson to begin
                  </p>
                  <p className="text-gray-600">
                    Choose from the lessons list to start learning
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePracticePage;
