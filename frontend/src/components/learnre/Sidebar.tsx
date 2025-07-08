import { FaHome, FaBook, FaChartLine, FaStar } from "react-icons/fa";
import { Link, NavLink } from "react-router-dom";

export const Sidebar = () => {
  return (
    <div className="p-6 bg-white h-full shadow-lg">
      <div className="mb-8">  

      <Link to={'/'} >
        <h1 className="text-2xl font-bold text-orange-600">Uplearn</h1>
        <p className="text-sm text-gray-500">Your Learning Platform</p>
      </Link>
      </div>

      <nav>
        <ul className="space-y-3">
          <li>
            <NavLink
              to="/learner/dashboard"
              className={({ isActive }) =>
                `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <FaHome className="w-5 h-5" />
              <span>Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/learner/courses/show"
              className={({ isActive }) =>
                `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <FaBook className="w-5 h-5" />
              <span>Courses</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/learner/progress"
              className={({ isActive }) =>
                `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <FaChartLine className="w-5 h-5" />
              <span>Progress</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/learner/course/review"
              className={({ isActive }) =>
                `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <FaStar className="w-5 h-5" />
              <span>Review</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">More</h3>
        <ul className="space-y-3">
          <li>
            <Link
              to="/learner/account/settings"
              className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>⚙️</span>
              <span>Settings</span>
            </Link>
          </li>
          <li>
            <Link
              to="/support"
              className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>🛠️</span>
              <span>Support</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};
