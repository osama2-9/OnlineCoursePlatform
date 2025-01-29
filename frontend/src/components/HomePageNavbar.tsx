import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiLogIn, FiUserPlus, FiLogOut } from "react-icons/fi";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useLogout } from "../hooks/useLogout";
import { FaChalkboardUser } from "react-icons/fa6";

export const HomePageNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.user);
  const { handleLogout } = useLogout();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigateBasedOnRole = () => {
    if (user?.role === "learner") {
      navigate("/learner/dashboard");
    } else if (user?.role === "instructor") {
      navigate("/instructor/dashboard");
    } else if (user?.role === "admin") {
      navigate("/admin/dashboard");
    }
  };

  return (
    <nav className="bg-white text-orange-500 py-4 px-8 shadow-sm fixed w-full top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Logo Section */}
        <Link to={"/"}>
          <div className="flex items-center space-x-4">
            <img src="/uplearn.png" alt="Logo" className="h-10" />
            <span className="text-2xl font-semibold">UpLearn</span>
          </div>
        </Link>

        {/* Desktop Menu Links */}
        <div className="space-x-6 hidden md:flex items-center">
          {user ? (
            <>
              <div className="flex items-center space-x-4">
                <button
                  onClick={navigateBasedOnRole}
                  className="text-gray-700 hover:text-orange-500 transition-all duration-300 ease-in-out"
                >
                  Welcome, {user.full_name}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center hover:text-gray-700 transition-all duration-300 ease-in-out"
                  aria-label="Logout"
                >
                  <FiLogOut className="mr-2" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center hover:text-gray-700 transition-all duration-300 ease-in-out"
                aria-label="Login"
              >
                <FiLogIn className="mr-2" />
                Login
              </Link>
              <Link
                to="/signup"
                className="flex items-center hover:text-gray-700 transition-all duration-300 ease-in-out"
                aria-label="Signup"
              >
                <FiUserPlus className="mr-2" />
                Signup
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            className="text-orange-500"
            onClick={toggleMobileMenu}
            aria-label="Toggle Menu"
          >
            <FiMenu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden mt-4 space-y-4 ${
          isMobileMenuOpen ? "block" : "hidden"
        }`}
      >
        {user ? (
          <>
            <button
              onClick={() => {
                navigateBasedOnRole();
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 px-4 text-gray-700 hover:bg-orange-100 rounded-md transition-all duration-300 ease-in-out"
            >
              Welcome, {user.full_name}
            </button>
            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 px-4 text-gray-700 hover:bg-orange-100 rounded-md transition-all duration-300 ease-in-out"
              aria-label="Logout"
            >
              <FiLogOut className="mr-2 inline" />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="block py-2 px-4 text-gray-700 hover:bg-orange-100 rounded-md transition-all duration-300 ease-in-out"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Login"
            >
              <FiLogIn className="mr-2 inline" />
              Login
            </Link>
            <Link
              to="/signup"
              className="block py-2 px-4 text-gray-700 hover:bg-orange-100 rounded-md transition-all duration-300 ease-in-out"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Signup"
            >
              <FiUserPlus className="mr-2 inline" />
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
