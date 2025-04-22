import { useState } from "react";
import { EnrolledCourses } from "../../components/learnre/EnrolledCourses";
import { PaymentsHistory } from "../../components/learnre/PaymentsHistory";
import { Quizzes } from "../../components/learnre/Quizzes";
import { useAuth } from "../../hooks/useAuth";
import { LearnerLayout } from "../../layouts/LearnerLayout";
import {
  FaRegClock,
  FaBell,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import MyAssignments from "../../components/learnre/MyAssignments";
import useGetLearnerNotifications from "../../hooks/useGetLearnerNotifications";
import { Loader2 } from "lucide-react";

export const LearnerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { notifications, isLoading } = useGetLearnerNotifications();



  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const getNotificationIcon = (type: any) => {
    switch (type) {
      case "ASSIGNMENT_NEW":
        return <FaBell className="text-blue-500" />;
      case "QUIZ_NEW":
        return <FaBell className="text-blue-500" />;
      case "ASSIGNMENT_DEADLINE":
        return <FaBell className="text-blue-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  return (
    <LearnerLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.full_name}
              </h1>
              <p className="text-gray-600 mt-1">
                Continue your learning journey
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <FaRegClock className="text-gray-400" />
              <span className="text-gray-600">
                Last login: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>


        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <div
            className="flex items-center justify-between p-4 cursor-pointer border-b"
            onClick={toggleNotifications}
          >
            <div className="flex items-center space-x-2">
              <FaBell className="text-gray-700" />
              <h2 className="font-semibold text-gray-900">Recent Updates</h2>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {notifications.filter((notification) => new Date(notification.created_at).getDay() == new Date().getDay()).length} notifications
              </span>
            </div>
            {notificationsOpen ? (
              <FaChevronUp className="text-gray-600" />
            ) : (
              <FaChevronDown className="text-gray-600" />
            )}
          </div>

          {notificationsOpen && (
            <div className="divide-y divide-gray-100">
              {isLoading ? (<>
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="text-orange-600 animate-spin" size={20} />
                </div>
              </>)
                : (<>
                  {notifications.map((notification, index) => (
                    <div
                      key={index}
                      className={`p-4 flex items-start space-x-4 ${new Date(notification.created_at).getDay() == new Date().getDay() ? "bg-blue-50" : ""
                        }`}
                    >
                      <div className="p-2 bg-gray-50 rounded-lg">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="text-gray-900">{notification.message}</p>
                          <span className="text-sm text-gray-500">
                            {new Date(notification.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {new Date(notification.created_at) == new Date() && (
                          <span className="text-xs font-medium text-blue-600">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  ))}</>)}

            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                "overview",
                "courses",
                "quizzes",
                "payments",
                "assignments",
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === tab
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Activity
                  </h2>
                  <EnrolledCourses userId={user?.userId} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Upcoming Quizzes
                  </h2>
                  <Quizzes />
                </div>
              </div>
            )}
            {activeTab === "courses" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  My Courses
                </h2>
                <EnrolledCourses userId={user?.userId} />
              </div>
            )}
            {activeTab === "quizzes" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Quiz Performance
                </h2>
                <Quizzes />
              </div>
            )}
            {activeTab === "payments" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment History
                </h2>
                <PaymentsHistory userId={user?.userId} />
              </div>
            )}
            {activeTab === "assignments" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  My Assignments
                </h2>
                <MyAssignments userId={user?.userId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </LearnerLayout>
  );
};
