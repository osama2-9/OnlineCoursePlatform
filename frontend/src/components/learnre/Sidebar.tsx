import { FaHome, FaBook, FaChartLine, FaBell, FaStar } from "react-icons/fa"; // Import icons from react-icons
import { NavLink } from "react-router-dom"; // For active link highlighting

export const Sidebar = () => {
  return (
    <div className="p-6 bg-white h-full shadow-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-orange-600">Uplearn</h1>
        <p className="text-sm text-gray-500">Your Learning Platform</p>
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
          <li>
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <FaBell className="w-5 h-5" />
              <span>Notifications</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Optional: Collapsible Sections */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">More</h3>
        <ul className="space-y-3">
          <li>
            <a
              href="#"
              className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>⚙️</span>
              <span>Settings</span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>🛠️</span>
              <span>Support</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};
