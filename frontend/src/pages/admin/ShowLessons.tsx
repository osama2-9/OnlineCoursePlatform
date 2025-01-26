import axios from "axios";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { AdminLayout } from "../../layouts/AdminLayout";
import { VideoPlayer } from "../../components/VideoPlayer";
import { API } from "../../API/ApiBaseUrl";
import { Loading } from "../../components/Loading";
import { FaEllipsisV } from "react-icons/fa";
import { ConfirmeDelete } from "../../components/admin/ConfirmeDelete";
import { UpdateLesson } from "../../components/admin/UpdateLesson";

import { Lesson } from "../../types/Lesson";

interface Response {
  lessons: Lesson[];
}

export const ShowLessons = () => {
  const { courseId, instructorId, courseName } = useParams();
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
        `${API}/lesson/get-lesson/${courseId}/${instructorId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = res.data;
      if (data) {
        setLessons(data.lessons);
      }
    } catch (error: any) {
      console.log(error);
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
      console.log(error);
      toast.error("Failed to update lesson order.");
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
      getLessons(); // Refresh the lessons list
    } catch (error: any) {
      console.log(error);
      toast.error("Failed to delete lesson.");
    } finally {
      setShowDeleteModal(false); // Close the delete modal
    }
  };

  const toggleMenu = (lessonId: number) => {
    setOpenMenuId(openMenuId === lessonId ? null : lessonId);
  };
  useEffect(() => {
    getLessons();
  }, [courseId, instructorId]);

  return (
    <AdminLayout>
      {loading ? (
        <Loading />
      ) : (
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Lessons for Course {courseName}
          </h1>

          {lessons.length === 0 ? (
            <p className="text-center text-gray-600">
              This course doesn't have lessons yet.
            </p>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.lesson_id.toString()}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                >
                  <div className="aspect-video">
                    <VideoPlayer videoUrl={lesson.video_url} />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h2 className="text-lg font-bold text-gray-900 mb-2">
                        {lesson.title}
                      </h2>
                      <div className="relative">
                        <button
                          onClick={() => toggleMenu(lesson.lesson_id)}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <FaEllipsisV className="text-gray-600" />
                        </button>
                        {openMenuId === lesson.lesson_id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg ">
                            <button
                              onClick={() => onClickUpdate(lesson)}
                              className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Update Lesson
                            </button>
                            <button
                              onClick={() => onClickDelete(lesson)}
                              className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              Delete Lesson
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-4">
                      {lesson.content.length > 100
                        ? `${lesson.content.substring(0, 100)}...`
                        : lesson.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          lesson.is_free
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {lesson.is_free ? "Free" : "Paid"}
                      </span>
                      <span className="text-sm text-gray-500">
                        Order: {lesson.lesson_order}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => moveLessonUp(index)}
                        disabled={index === 0}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
                      >
                        Move Up
                      </button>
                      <button
                        onClick={() => moveLessonDown(index)}
                        disabled={index === lessons.length - 1}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
                      >
                        Move Down
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showDeleteModal && selectedLesson && (
            <ConfirmeDelete
              title={selectedLesson.title}
              key={selectedLesson.lesson_id}
              onCancel={onCancelDelete}
              onConfirm={handleDeleteLesson}
            />
          )}

          {selectedLesson && showUpdateModal && courseId && (
            <UpdateLesson
              onUpdate={onConfirmUpdate}
              onCancel={onCancelUpdate}
              courseId={courseId}
              lesson={selectedLesson}
              isOpen={showUpdateModal}
            />
          )}
        </div>
      )}
    </AdminLayout>
  );
};
