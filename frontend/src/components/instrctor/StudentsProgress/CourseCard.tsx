import { BookOpen } from "lucide-react";
import { CourseWithStudents } from "../../../types/StudentsProgress";
import { getProgressColor, getScoreColor } from "../../../utils/StudentsProgress";

export const CourseCard = ({ course }: { course: CourseWithStudents }) => {
  const courseAvgProgress =
    course.students.reduce(
      (sum: any, s: any) => sum + parseFloat(s.progress),
      0
    ) / course.students.length;

  const courseAvgScore =
    course.students.reduce(
      (sum: any, s: any) => sum + parseFloat(s.avg_quiz_score),
      0
    ) / course.students.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <BookOpen className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{course.course_title}</h3>
          <p className="text-sm text-gray-600">
            {course.students.length} students enrolled
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Avg Progress</span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getProgressColor(
              courseAvgProgress
            )}`}
          >
            {courseAvgProgress.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Avg Quiz Score</span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(
              courseAvgScore
            )}`}
          >
            {courseAvgScore.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};
