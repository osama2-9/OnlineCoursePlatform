import { useState } from "react";
import { EnrolledCourses } from "../../components/learnre/EnrolledCourses";
import { PaymentsHistory } from "../../components/learnre/PaymentsHistory";
import { Quizzes } from "../../components/learnre/Quizzes";
import { useAuth } from "../../hooks/useAuth";
import { LearnerLayout } from "../../layouts/LearnerLayout";
import {
  FaBook,
  FaChartLine,
  FaClock,
  FaGraduationCap,
  FaRegClock,
} from "react-icons/fa";

export const LearnerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    {
      title: "Courses in Progress",
      value: "4",
      icon: FaBook,
      change: "+2 this month",
    },
    {
      title: "Hours Learned",
      value: "26",
      icon: FaClock,
      change: "+5 this week",
    },
    {
      title: "Completed Courses",
      value: "8",
      icon: FaGraduationCap,
      change: "+1 this month",
    },
    {
      title: "Average Score",
      value: "92%",
      icon: FaChartLine,
      change: "+3% improvement",
    },
  ];

  return (
    <LearnerLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Welcome Section */}
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <stat.icon className="w-6 h-6 text-gray-700" />
                </div>
                <span className="text-sm text-gray-500">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {["overview", "courses", "quizzes", "payments"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                    activeTab === tab
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
          </div>
        </div>
      </div>
    </LearnerLayout>
  );
};
