import { Link } from "react-router-dom";
import ExploreCourses from "../components/ExploreCourses";
import Services from "../components/Services";
import { HomePageLayout } from "../layouts/HomePageLayout";
import {
  FaGraduationCap,
  FaUsers,
  FaChalkboardTeacher,
  FaBook,
} from "react-icons/fa";
import { ArrowRight, BookOpen } from "lucide-react";

export const HomePage = () => {
  const stats = [
    { label: "Active Students", value: "10,000+", icon: FaUsers },
    { label: "Expert Instructors", value: "100+", icon: FaChalkboardTeacher },
    { label: "Online Courses", value: "500+", icon: FaBook },
    { label: "Graduates", value: "5,000+", icon: FaGraduationCap },
  ];

  return (
    <HomePageLayout>
      <div className="relative p-4 bg-white overflow-hidden">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-20 pb-16 text-center lg:pt-32">
            <div className="mx-auto max-w-fit">
              <div className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-600 ring-1 ring-inset ring-orange-500/10">
                <BookOpen className="w-4 h-4 mr-2" />
                Professional Online Courses
              </div>
            </div>
            <h1 className="mx-auto max-w-4xl font-display text-5xl  md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mt-6 leading-tight">
              Unlock Your
              <span className="relative whitespace-nowrap text-orange-600">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 418 42"
                  className="absolute left-0 top-2/3 h-[0.58em] w-full fill-orange-300/70"
                  preserveAspectRatio="none"
                >
                  <path d="m203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.935-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z" />
                </svg>
                <span className="relative ml-1 text-">Potential</span>
              </span>
              <span className="block">with Online Learning</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg md:text-xl tracking-tight text-slate-700">
              Access world-class education and career development resources.
              Learn from industry experts and join a global community of
              learners.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 sm:gap-x-6">
              <Link
                to="/login"
                className="group inline-flex items-center justify-center rounded-full py-2 px-4 text-sm font-semibold bg-orange-600 text-white hover:bg-orange-700 hover:text-white transition"
              >
                Get Started
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center justify-center rounded-full py-2 px-4 text-md font-semibold text-orange-600 transition"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
        <div
          className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl"
          aria-hidden="true"
        >
          <div
            className="relative left-1/2 aspect-[1155/678] w-[90vw] max-w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-orange-50 to-blue-50 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
      </div>

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

      <div className="bg-gray-50 py-16">
        <Services />
      </div>

      <div className="bg-white py-16">
        <ExploreCourses />
      </div>

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

      <div className="bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 py-20 mb-10 rounded max-w-7xl mx-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-lg sm:text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are advancing their careers through
            our platform. Take the next step toward your goals today!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to={"/signup"}
              className="px-8 py-3 bg-white text-indigo-900 font-semibold rounded-full shadow hover:bg-indigo-50 transition-colors"
            >
              Get Started Now
            </Link>
            <Link
              to={"/explore"}
              className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-indigo-900 transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </div>
    </HomePageLayout>
  );
};
