import { Link } from "react-router-dom";
import ExploreCourses from "../components/ExploreCourses";
import Services from "../components/Services";
import { HomePageLayout } from "../layouts/HomePageLayout";
import { useEffect, useState } from "react";
import {
  FaGraduationCap,
  FaUsers,
  FaChalkboardTeacher,
  FaBook,
} from "react-icons/fa";

export const HomePage = () => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setShowContent(true);
  }, []);

  const stats = [
    { label: "Active Students", value: "10,000+", icon: FaUsers },
    { label: "Expert Instructors", value: "100+", icon: FaChalkboardTeacher },
    { label: "Online Courses", value: "500+", icon: FaBook },
    { label: "Graduates", value: "5,000+", icon: FaGraduationCap },
  ];

  return (
    <HomePageLayout>
      {/* Hero Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div
              className={`lg:w-1/2 transition-all duration-1000 ${
                showContent
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-10"
              }`}
            >
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Transform Your Future with Professional Online Learning
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Access world-class education and career development resources.
                Learn from industry experts and join a global community of
                learners.
              </p>
              <div className="flex gap-4">
                <Link
                  to={"/login"}
                  className="px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  to={"/explore"}
                  className="px-8 py-3 bg-white text-gray-800 font-medium rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  Browse Courses
                </Link>
              </div>
            </div>
            <div
              className={`lg:w-1/2 transition-all duration-1000 ${
                showContent
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-10"
              }`}
            >
              <img
                src="/hero.png"
                alt="Online Learning"
                className="w-full h-auto rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats?.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
                  <stat.icon className="w-6 h-6 text-gray-700" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-gray-50 py-16">
        <Services />
      </div>

      {/* Explore Courses Section */}
      <div className="bg-white py-16">
        <ExploreCourses />
      </div>

      {/* Instructor Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Become an Instructor
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Share your expertise with millions of learners worldwide. Join our
              community of leading instructors and help shape the future of
              online education.
            </p>
            <Link
              to={"/become-an-instractour"}
              className="px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Start Teaching Today
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform
            </h2>
            <p className="text-lg text-gray-600">
              Discover what makes us the preferred choice for professional
              development
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Interactive Learning",
                description:
                  "Engage with dynamic content designed for effective learning outcomes",
              },
              {
                title: "Expert Instruction",
                description:
                  "Learn from industry professionals with real-world experience",
              },
              {
                title: "Flexible Schedule",
                description:
                  "Study at your own pace with lifetime access to course materials",
              },
            ]?.map((feature, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are advancing their careers through
            our platform.
          </p>
          <Link
            to={"/signup"}
            className="px-8 py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Get Started Now
          </Link>
        </div>
      </div>
    </HomePageLayout>
  );
};
