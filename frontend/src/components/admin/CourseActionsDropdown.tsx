import { useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { FiX } from "react-icons/fi";

interface CourseActionProps {
  courseId: number;
  instructorId: number;
  isPublished: boolean;
  courseName: string;
  onAddLesson: (courseId: number, instructorId: number) => void;
  onShowLessons: (
    courseId: number,
    instructorId: number,
    courseName: string
  ) => void;
  onTogglePublish: (courseId: number) => void;
  updateCourse: () => void;
  deleteCourse: () => void;
}

export const CourseActionsDropdown = ({
  courseId,
  instructorId,
  isPublished,
  courseName,
  onAddLesson,
  onShowLessons,
  onTogglePublish,
  updateCourse,
  deleteCourse,
}: CourseActionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="relative">
      <button onClick={toggleDropdown} className="focus:outline-none">
        <BsThreeDots size={20} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <div className="relative">
            <button
              onClick={() => {
                updateCourse();
                setIsOpen(false);
              }}
              className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
            >
              Update
            </button>
            <button
              onClick={() => {
                deleteCourse();
                setIsOpen(false);
              }}
              className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
            >
              Delete
            </button>
            <button
              onClick={() => {
                onAddLesson(courseId, instructorId);
                setIsOpen(false);
              }}
              className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
            >
              Add Lesson
            </button>
            <button
              onClick={() => {
                onShowLessons(courseId, instructorId, courseName);
                setIsOpen(false);
              }}
              className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
            >
              Show Lessons
            </button>
            <button
              onClick={() => {
                onTogglePublish(courseId);
                setIsOpen(false);
              }}
              className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
            >
              {isPublished ? "Unpublish" : "Publish"}
            </button>
            <button
              onClick={toggleDropdown}
              className="absolute top-0 right-0 p-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FiX size={16} className="inline-block" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
