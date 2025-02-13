import axios from "axios";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { InstructorLayout } from "../../layouts/InstructorLayout";
import { VideoPlayer } from "../../components/VideoPlayer";
import { API } from "../../API/ApiBaseUrl";
import { Loading } from "../../components/Loading";
import { FaEllipsisV, FaArrowLeft } from "react-icons/fa";
import { ConfirmeDelete } from "../../components/admin/ConfirmeDelete";
import { UpdateLesson } from "../../components/admin/UpdateLesson";
import { Lesson } from "../../types/Lesson";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface Response {
  lessons: Lesson[];
}

export const ShowCourseLessons = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setIsLoading] = useState<boolean>(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);

  const getLessons = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get<Response>(
        `${API}/instructor/get-course-lessons/${user?.userId}/course/${courseId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setLessons(res.data.lessons);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to fetch lessons.");
    } finally {
      setIsLoading(false);
    }
  };

  const onClickDelete = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowDeleteModal(true);
  };

  const onCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedLesson(null);
  };

  const onClickUpdate = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowUpdateModal(true);
  };

  const onCancelUpdate = () => {
    setSelectedLesson(null);
    setShowUpdateModal(false);
  };

  const onConfirmUpdate = () => {
    setShowUpdateModal(false);
    setSelectedLesson(null);
    getLessons(); 
  };

  const handleDeleteLesson = async () => {
    try {
      await axios.delete(
        `${API}/lesson/delete-lesson/${selectedLesson?.lesson_id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      toast.success("Lesson deleted successfully!");
      getLessons();
    } catch (error: any) {
      toast.error("Failed to delete lesson.");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const toggleMenu = (lessonId: number) => {
    setOpenMenuId(openMenuId === lessonId ? null : lessonId);
  };

  const updateLessonOrder = async (orderedLessons: Lesson[]) => {
    try {
      const updatedOrder = orderedLessons.map((lesson, index) => ({
        lesson_id: lesson.lesson_id,
        lesson_order: index + 1,
      }));

      await axios.put(
        `${API}/lesson/update-order`,
        { lessons: updatedOrder },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      toast.success("Lesson order updated successfully!");
    } catch (error: any) {
      toast.error("Failed to update lesson order.");
      getLessons(); 
    }
  };

  const moveLessonUp = (index: number) => {
    if (index === 0) return;

    const newLessons = [...lessons];
    [newLessons[index - 1], newLessons[index]] = [
      newLessons[index],
      newLessons[index - 1],
    ];
    setLessons(newLessons);
    updateLessonOrder(newLessons);
  };

  const moveLessonDown = (index: number) => {
    if (index === lessons.length - 1) return;

    const newLessons = [...lessons];
    [newLessons[index], newLessons[index + 1]] = [
      newLessons[index + 1],
      newLessons[index],
    ];
    setLessons(newLessons);
    updateLessonOrder(newLessons);
  };

  useEffect(() => {
    getLessons();
  }, [courseId]);

  return (
    <InstructorLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate("/instructor/courses")}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2" /> Back to Courses
          </button>
          <button
            onClick={() =>
              navigate(`/instructor/courses/${courseId}/add-lesson/${user?.userId}`)
            }
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <span>Add New Lesson</span>
            <span className="text-lg">+</span>
          </button>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="space-y-8">
            {lessons.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  No Lessons Yet
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Start creating lessons for your course! Your students are
                  waiting to learn from you.
                </p>
              </div>
            ) : (
              <div className="grid gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson.lesson_id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                  >
                    <div className="p-2 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-xl">
                      <span className="text-sm text-gray-500 px-2">
                        Lesson {lesson.lesson_order}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => moveLessonUp(index)}
                          disabled={index === 0}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            index === 0
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                          }`}
                        >
                          Move Up
                        </button>
                        <button
                          onClick={() => moveLessonDown(index)}
                          disabled={index === lessons.length - 1}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            index === lessons.length - 1
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                          }`}
                        >
                          Move Down
                        </button>
                      </div>
                    </div>
                    <div className="aspect-video rounded-t-xl overflow-hidden">
                      <VideoPlayer videoUrl={lesson.video_url} />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200">
                          {lesson.title}
                        </h3>
                        <div className="relative">
                          <button
                            onClick={() => toggleMenu(lesson.lesson_id)}
                            className="p-2.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
                          >
                            <FaEllipsisV className="text-gray-600" />
                          </button>
                          {openMenuId === lesson.lesson_id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              <button
                                onClick={() => onClickUpdate(lesson)}
                                className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                              >
                                Edit Lesson
                              </button>
                              <button
                                onClick={() => onClickDelete(lesson)}
                                className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 border-t border-gray-100"
                              >
                                Delete Lesson
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-6 line-clamp-3 text-sm leading-relaxed">
                        {lesson.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-4 py-1.5 text-sm font-medium rounded-full ${
                            lesson.is_free
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {lesson.is_free ? "Free Preview" : "Premium"}
                        </span>

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showDeleteModal && selectedLesson && (
          <ConfirmeDelete
            title={selectedLesson.title}
            onCancel={onCancelDelete}
            onConfirm={handleDeleteLesson}
          />
        )}

        {showUpdateModal && selectedLesson && courseId && (
          <UpdateLesson
            onUpdate={onConfirmUpdate}
            onCancel={onCancelUpdate}
            courseId={courseId}
            lesson={selectedLesson}
            isOpen={showUpdateModal}
          />
        )}
      </div>
    </InstructorLayout>
  );
};
