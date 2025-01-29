import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

interface Course {
  course_id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  course_img: string;
  rating?: number;
  instructor_name?: string;
}

const CourseCard = ({
  course_id,
  course_img,
  title,
  description,
  category,
  price,
  rating = 4.5,
  instructor_name = "Instructor",
}: Course) => {
  return (
    <Link to={`/course-page/${course_id}`}>
      <div className="bg-white border border-gray-100 rounded-lg hover:border-gray-200 hover:shadow-md transition-all duration-300 group">
        {/* Image Container */}
        <div className="relative">
          <img
            src={course_img}
            alt={title}
            className="w-full h-52  rounded-t-lg"
          />
          {/* Price Tag */}
          <div className="absolute top-4 right-4">
            <span className="inline-block px-4 py-2 rounded-md font-medium text-sm bg-white/95 text-gray-700 shadow-sm">
              {price === 0 ? "Free Course" : `$${price.toFixed(2)}`}
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* Category & Rating */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
              {category}
            </span>
            <div className="flex items-center">
              <FaStar className="text-yellow-300 mr-1" />
              <span className="text-sm font-medium text-yellow-500">
                {rating}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-gray-600 transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">
            {description}
          </p>

          {/* Instructor Info */}
          <div className="flex items-center justify-between py-4 border-t border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-3">
                <span className="text-gray-600 font-semibold">
                  {instructor_name[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {instructor_name}
                </p>
                <p className="text-xs text-gray-500">Instructor</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <button className="w-full mt-4 px-4 py-2 bg-gray-200 text-black font-medium rounded-md hover:bg-gray-300 transition-colors duration-300">
            View Course Details
          </button>
        </div>
      </div>
    </Link>
  );
};
export default CourseCard;
