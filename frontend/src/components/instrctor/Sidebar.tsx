import { useState } from "react";
import {
  FaHome,
  FaBook,
  FaChartLine,
  FaBell,
  FaUsers,
  FaBars,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

export const InstructorSidebar = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  // Close sidebar when clicking outside
  const closeSidebar = () => {
    if (isSidebarVisible) {
      setIsSidebarVisible(false);
    }
  };

  return (
    <>
      {/* Menu Icon for Small Screens */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 bg-blue-600 text-white rounded-lg focus:outline-none"
        >
          <FaBars className="w-6 h-6" />
        </button>
      </div>

      {/* Overlay for Small Screens */}
      {isSidebarVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:relative inset-y-0 left-0 w-64 p-6 bg-white h-full shadow-lg transform transition-transform duration-300 ease-in-out ${
          isSidebarVisible
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        } z-50`}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-orange-600">Uplearn</h1>
          <p className="text-sm text-gray-500">Instructor Dashboard</p>
        </div>

        <nav>
          <ul className="space-y-3">
            <li>
              <NavLink
                to="/instructor/dashboard"
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
                onClick={closeSidebar}
              >
                <FaHome className="w-5 h-5" />
                <span>Dashboard</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/instructor/courses"
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
                onClick={closeSidebar}
              >
                <FaBook className="w-5 h-5" />
                <span>Courses</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/instructor/quizess"
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
                onClick={closeSidebar}
              >
                <FaBook className="w-5 h-5" />
                <span>Quizess</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/instructor/quizzes/attempts"
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
                onClick={closeSidebar}
              >
                <FaBook className="w-5 h-5" />
                <span>Quizzes Attempts</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/instructor/learners"
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
                onClick={closeSidebar}
              >
                <FaUsers className="w-5 h-5" />
                <span>Learners</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/instructor/analytics"
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
                onClick={closeSidebar}
              >
                <FaChartLine className="w-5 h-5" />
                <span>Analytics</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/instructor/notifications"
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
                onClick={closeSidebar}
              >
                <FaBell className="w-5 h-5" />
                <span>Notifications</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">More</h3>
          <ul className="space-y-3">
            <li>
              <NavLink
                to="/instructor/settings"
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
                onClick={closeSidebar}
              >
                <span>⚙️</span>
                <span>Settings</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};
