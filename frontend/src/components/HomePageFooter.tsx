import { useState } from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaArrowRight,
} from "react-icons/fa";

export const HomePageFooter = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    // Handle subscription logic
    alert(`Thank you for subscribing with: ${email}`);
    setEmail("");
  };

  return (
    <footer className="bg-gray-900 text-white w-full">
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
        <div className="bg-gray-800 rounded-lg p-6 lg:p-8 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h3 className="text-xl lg:text-2xl font-bold mb-2">
                Stay Updated with UpLearn
              </h3>
              <p className="text-gray-300 text-sm lg:text-base">
                Subscribe to our newsletter for the latest courses and learning
                tips.
              </p>
            </div>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSubscribe}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                Subscribe
                <FaArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-md bg-orange-600 flex items-center justify-center mr-2">
                <span className="font-bold text-white">U</span>
              </div>
              <h3 className="text-2xl font-bold">UpLearn</h3>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Empowering learners worldwide with accessible and engaging online
              education since 2015.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
              >
                <FaFacebookF className="text-white" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
              >
                <FaTwitter className="text-white" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
              >
                <FaLinkedinIn className="text-white" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
              >
                <FaInstagram className="text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold border-b border-gray-700 pb-2">
              Explore
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Home", path: "/" },
                { name: "All Courses", path: "/courses" },
                { name: "About Us", path: "/about" },
                { name: "Become an Instructor", path: "/become-an-instructor" },
                { name: "Contact", path: "/contact" },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.path}
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200 flex items-center"
                  >
                    <FaArrowRight className="mr-2 text-xs" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold border-b border-gray-700 pb-2">
              Resources
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Help Center", path: "/help" },
                { name: "Career Guidance", path: "/careers" },
                { name: "Success Stories", path: "/success-stories" },
                { name: "Privacy Policy", path: "/privacy" },
                { name: "Terms of Service", path: "/terms" },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.path}
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200 flex items-center"
                  >
                    <FaArrowRight className="mr-2 text-xs" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold border-b border-gray-700 pb-2">
              Contact Us
            </h3>
            <div className="space-y-4 text-gray-400">
              <p className="flex items-start">
                <FaEnvelope className="mt-1 mr-3 text-blue-500" />
                <span>support@uplearn.com</span>
              </p>
              <p className="flex items-start">
                <FaPhone className="mt-1 mr-3 text-blue-500" />
                <span>+1 (123) 456-7890</span>
              </p>
              <p className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3 text-blue-500" />
                <span>123 Learning Street, Education City, CA 94105</span>
              </p>
              <p className="text-sm mt-6">
                Office Hours:
                <br />
                Monday - Friday: 9 AM - 6 PM (EST)
              </p>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center md:flex md:justify-between md:items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} UpLearn. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <a
              href="/privacy"
              className="text-gray-400 hover:text-blue-400 text-sm mr-6"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="text-gray-400 hover:text-blue-400 text-sm"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
