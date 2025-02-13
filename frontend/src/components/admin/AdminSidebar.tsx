import {
  FaUser,
  FaBook,
  FaMoneyBillAlt,
  FaClipboardList,
  FaCog,
  FaChevronDown,
  FaBars,
  FaHome,
  FaHammer,
  FaUsers,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { TbDeviceAnalytics } from "react-icons/tb";

export const AdminSidebar = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [isQuizzesOpen, setIsQuizzesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEnrollmentsOpen, setIsEnrollmentsOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

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
          <p className="text-sm text-gray-500">Admin Dashboard</p>
        </div>

        <nav>
          <ul className="space-y-3">
            {/* Users Section */}
            <li>
              <NavLink
                to="/admin/dashboard"
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
                <span>Home</span>
              </NavLink>
            </li>
            <li>
              <button
                className="flex items-center space-x-3 p-3 w-full text-left rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
                onClick={() => setIsUsersOpen(!isUsersOpen)}
              >
                <FaUser className="w-5 h-5" />
                <span>Users</span>
                <FaChevronDown
                  className={`ml-auto w-4 h-4 transition-transform ${
                    isUsersOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              {isUsersOpen && (
                <div className="ml-8 space-y-2 mt-2">
                  <NavLink
                    to="/admin/users/show"
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                    onClick={closeSidebar}
                  >
                    <span>Show Users</span>
                  </NavLink>
                  <NavLink
                    to="/admin/users/add"
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                    onClick={closeSidebar}
                  >
                    <span>Add User</span>
                  </NavLink>
                </div>
              )}
            </li>

            {/* Courses Section */}
            <li>
              <button
                className="flex items-center space-x-3 p-3 w-full text-left rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
                onClick={() => setIsCoursesOpen(!isCoursesOpen)}
              >
                <FaBook className="w-5 h-5" />
                <span>Courses</span>
                <FaChevronDown
                  className={`ml-auto w-4 h-4 transition-transform ${
                    isCoursesOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              {isCoursesOpen && (
                <div className="ml-8 space-y-2 mt-2">
                  <NavLink
                    to="/admin/courses/show"
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                    onClick={closeSidebar}
                  >
                    <span>Show Courses</span>
                  </NavLink>
                  <NavLink
                    to="/admin/courses/add"
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                    onClick={closeSidebar}
                  >
                    <span>Add Course</span>
                  </NavLink>
                </div>
              )}
            </li>

            {/* Quizzes Section */}
            <li>
              <button
                className="flex items-center space-x-3 p-3 w-full text-left rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
                onClick={() => setIsQuizzesOpen(!isQuizzesOpen)}
              >
                <FaClipboardList className="w-5 h-5" />
                <span>Quizzes</span>
                <FaChevronDown
                  className={`ml-auto w-4 h-4 transition-transform ${
                    isQuizzesOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              {isQuizzesOpen && (
                <div className="ml-8 space-y-2 mt-2">
                  <NavLink
                    to="/admin/quizzes/show"
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                    onClick={closeSidebar}
                  >
                    <span>Show Quizzes</span>
                  </NavLink>
                </div>
              )}
            </li>

            {/* Enrollments Section */}
            <li>
              <button
                className="flex items-center space-x-3 p-3 w-full text-left rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
                onClick={() => setIsEnrollmentsOpen(!isEnrollmentsOpen)}
              >
                <FaUsers className="w-5 h-5" />
                <span>Enrollments</span>
                <FaChevronDown
                  className={`ml-auto w-4 h-4 transition-transform ${
                    isEnrollmentsOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              {isEnrollmentsOpen && (
                <div className="ml-8 space-y-2 mt-2">
                  <NavLink
                    to="/admin/enrollments/show"
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                    onClick={closeSidebar}
                  >
                    <span>Show Enrollments</span>
                  </NavLink>
                </div>
              )}
            </li>

            {/* Reviews Section */}
            <li>
              <button
                className="flex items-center space-x-3 p-3 w-full text-left rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
                onClick={() => setIsReviewsOpen(!isReviewsOpen)}
              >
                <FaHammer className="w-5 h-5" />
                <span>Reviews</span>
                <FaChevronDown
                  className={`ml-auto w-4 h-4 transition-transform ${
                    isReviewsOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              {isReviewsOpen && (
                <div className="ml-8 space-y-2 mt-2">
                  <NavLink
                    to="/admin/reviews"
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                    onClick={closeSidebar}
                  >
                    <span>Show Reviews</span>
                  </NavLink>
                </div>
              )}
            </li>

            {/* Payments Section */}
            <li>
              <NavLink
                to="/admin/analystics"
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
                onClick={closeSidebar}
              >
                <TbDeviceAnalytics className="w-5 h-5" />
                <span>Analytics</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/applications"
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
                onClick={closeSidebar}
              >
                <FaClipboardList className="w-5 h-5" />
                <span>Applications</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/payments/show"
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
                onClick={closeSidebar}
              >
                <FaMoneyBillAlt className="w-5 h-5" />
                <span>Payments</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Settings Section */}
        <div className="mt-8">
          <button
            className="flex items-center space-x-3 p-3 w-full text-left rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          >
            <FaCog className="w-5 h-5" />
            <span>Settings</span>
            <FaChevronDown
              className={`ml-auto w-4 h-4 transition-transform ${
                isSettingsOpen ? "transform rotate-180" : ""
              }`}
            />
          </button>
          {isSettingsOpen && (
            <div className="ml-8 space-y-2 mt-2">
              <NavLink
                to="/admin/settings/profile"
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
                onClick={closeSidebar}
              >
                <span>Profile Settings</span>
              </NavLink>
              <NavLink
                to="/admin/settings/account"
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
                onClick={closeSidebar}
              >
                <span>Account Settings</span>
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
