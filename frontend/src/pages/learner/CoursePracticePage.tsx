import axios from "axios";
import { useState, useEffect } from "react";
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

interface Progress {
  progress_id: number;
  user_id: number;
  course_id: number;
  lesson_id: number;
  progress: number;
  is_completed: boolean;
  last_accessed: Date;
}

const CoursePracticePage = () => {
  const { enrollmentId, courseId } = useParams();
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lessons[] | null>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lessons | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [progress, setProgress] = useState<{ [key: number]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [completedLessons, setCompletedLessons] = useState<Progress[] | null>(
    []
  );

  const getLessons = async () => {
    if (!enrollmentId || !courseId) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/learner/get-lessons/${enrollmentId}/course/${courseId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = await res.data;
      if (data) {
        setLessons(data);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletedLessons = async () => {
    try {
      const res = await axios.get(
        `${API}/learner/get-completed-lessons/user/${user?.userId}/course/${courseId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = await res.data;
      if (data) {
        setCompletedLessons(data);
        const progressMap: { [key: number]: boolean } = {};
        data.forEach((lesson: Progress) => {
          if (lesson.is_completed) {
            progressMap[lesson.lesson_id] = true;
          }
        });

        setProgress(progressMap);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    }
  };

  useEffect(() => {
    getLessons();
    getCompletedLessons();
  }, [courseId, user?.userId]);

  useEffect(() => {
    const lastWatchedLessonId = localStorage.getItem("lastWatchedLessonId");
    if (lastWatchedLessonId) {
      const lesson = lessons?.find(
        (l) => l.lesson_id === parseInt(lastWatchedLessonId)
      );
      if (lesson) setSelectedLesson(lesson);
    } else {
      setSelectedLesson(lessons ? lessons[0] : null);
    }
  }, [lessons]);

  const handleLessonSelect = (lesson: Lessons) => {
    setSelectedLesson(lesson);
    localStorage.setItem("lastWatchedLessonId", lesson.lesson_id.toString());
  };

  const markLessonAsComplete = async (lessonId: number) => {
    try {
      const newProgress = { ...progress, [lessonId]: !progress[lessonId] };
      setProgress(newProgress);

      await axios.post(
        `${API}/learner/mark-complete-lesson`,
        {
          lessonId,
          courseId: parseInt(courseId || "0"),
          userId: user?.userId,
          completed: newProgress[lessonId],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      await getCompletedLessons();

      toast.success(
        newProgress[lessonId]
          ? "Lesson marked as completed"
          : "Lesson marked as incomplete"
      );
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error || "Failed to update progress");
    }
  };

  const goToNextLesson = () => {
    if (!selectedLesson || !lessons) return;
    const currentIndex = lessons.findIndex(
      (lesson) => lesson.lesson_id === selectedLesson.lesson_id
    );
    if (currentIndex < lessons.length - 1) {
      setSelectedLesson(lessons[currentIndex + 1]);
      localStorage.setItem(
        "lastWatchedLessonId",
        lessons[currentIndex + 1].lesson_id.toString()
      );
    }
  };

  const goToPreviousLesson = () => {
    if (!selectedLesson || !lessons) return;
    const currentIndex = lessons.findIndex(
      (lesson) => lesson.lesson_id === selectedLesson.lesson_id
    );
    if (currentIndex > 0) {
      setSelectedLesson(lessons[currentIndex - 1]);
      localStorage.setItem(
        "lastWatchedLessonId",
        lessons[currentIndex - 1].lesson_id.toString()
      );
    }
  };

  const filteredLessons = lessons?.filter((lesson) =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completionPercentage = lessons
    ? Math.round(
        (Object.values(progress).filter(Boolean).length / lessons.length) * 100
      )
    : 0;
  console.log(completedLessons);

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Loading />
        </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Course Progress Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Course Progress
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Track your learning journey
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Completion</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {completionPercentage}%
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-orange-500 flex items-center justify-center">
                    <span className="text-lg font-bold text-orange-500">
                      {Object.values(progress).filter(Boolean).length}/
                      {lessons?.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar: Lessons List */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Lessons
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
                    {filteredLessons?.map((lesson) => (
                      <button
                        key={lesson.lesson_id}
                        onClick={() => handleLessonSelect(lesson)}
                        className={`w-full p-4 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                          selectedLesson?.lesson_id === lesson.lesson_id
                            ? "bg-orange-500 text-white shadow-md"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              selectedLesson?.lesson_id === lesson.lesson_id
                                ? "bg-white text-orange-500"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {lesson.lesson_order}
                          </div>
                          <span
                            className={`font-medium ${
                              selectedLesson?.lesson_id === lesson.lesson_id
                                ? "text-white"
                                : "text-gray-700"
                            }`}
                          >
                            {lesson.title}
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={!!progress[lesson.lesson_id]}
                          onChange={() =>
                            markLessonAsComplete(lesson.lesson_id)
                          }
                          className={`w-5 h-5 rounded border-2 transition-colors ${
                            selectedLesson?.lesson_id === lesson.lesson_id
                              ? "border-white text-white"
                              : "border-gray-300 text-orange-500"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content: Selected Lesson */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {selectedLesson ? (
                    <div>
                      <div className="p-6 border-b border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {selectedLesson.title}
                        </h2>
                        <p className="text-gray-600">
                          {selectedLesson.description}
                        </p>
                      </div>

                      {selectedLesson.video_url && (
                        <div className="aspect-video">
                          <VideoPlayer
                            videoUrl={selectedLesson.video_url}
                            key={selectedLesson.lesson_id}
                          />
                        </div>
                      )}

                      <div className="p-6">
                        {selectedLesson.attachment && (
                          <a
                            href={selectedLesson.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mb-6"
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
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <button
                            onClick={goToPreviousLesson}
                            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center"
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
                          <button
                            onClick={goToNextLesson}
                            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center"
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
      )}
    </>
  );
};

export default CoursePracticePage;
