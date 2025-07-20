import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

interface Course {
  course_id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  course_img: string;
  avgRating: number;
  instructor_name?: string;
}

const CourseCard = ({
  course_id,
  course_img,
  title,
  description,
  category,
  price,
  avgRating,
  instructor_name = "Instructor",
}: Course) => {
  return (
    <Link to={`/course-page/${course_id}`}>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden">
        <div className="relative overflow-hidden">
          <img
            src={course_img}
            alt={title}
            className="w-full h-48  group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg font-semibold text-sm bg-white/95 backdrop-blur-sm text-gray-800 shadow-lg border border-white/20">
              {price === 0 ? "Free Course" : `$${price.toFixed(2)}`}
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
              {category}
            </span>
            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
              <FaStar className="text-yellow-400 mr-1 text-sm" />
              <span className="text-sm font-semibold text-gray-800">
                {avgRating.toFixed(1)}
              </span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors leading-tight">
            {title}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {description}
          </p>

          <div className="flex items-center py-3 border-t border-gray-100">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center mr-3 border border-gray-200">
              <span className="text-gray-700 font-bold text-sm">
                {instructor_name[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {instructor_name}
              </p>
              <p className="text-xs text-gray-500 font-medium">Instructor</p>
            </div>
          </div>

          <button className="w-full mt-4 px-4 py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm">
            View Course Details
          </button>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
