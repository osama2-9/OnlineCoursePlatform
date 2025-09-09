import { Link, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiLogIn,
  FiUserPlus,
  FiLogOut,
  FiBookOpen,
  FiUser,
  FiChevronDown,
  FiSearch,
} from "react-icons/fi";
import { RiDashboard3Line } from "react-icons/ri";

import { useState, useRef, useEffect } from "react";
import { useLogout } from "../hooks/useLogout";
import { useAuth } from "../hooks/useAuth";

export const HomePageNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { handleLogout } = useLogout();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);

    if (showProfileMenu) setShowProfileMenu(false);
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const navigateBasedOnRole = () => {
    if (user?.role === "learner") {
      navigate("/learner/dashboard");
    } else if (user?.role === "instructor") {
      navigate("/instructor/dashboard");
    } else if (user?.role === "admin") {
      navigate("/admin/dashboard");
    } else if (user?.role === "support") {
      navigate("/support/dashboard");
    } else if (user?.role === "moderator") {
      navigate("/moderator/dashboard");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }

      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white text-orange-500 py-4 px-8 shadow-sm  w-full top-0 z-50">
      <div className="flex items-center justify-between">
        <Link to={"/"}>
          <div className="flex items-center space-x-4">
            <img src="/uplearn.png" alt="Logo" className="h-20" />
          
          </div>
        </Link>

        <div
          className="flex-1 max-w-xl mx-6 hidden sm:block"
          ref={searchContainerRef}
        >
          <form className="relative">
            <div className="flex items-center relative">
              <input
                ref={searchInputRef}
                type="text"
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200"
                placeholder="Search courses"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search"
              />

              <div className="ml-5 mt-1 flex items-center space-x-2">
                {searchQuery && (
                  <>
                    <button
                      onClick={() => {
                        navigate(`/search?q=${searchQuery}`);
                        setSearchQuery("");
                      }}
                    >
                      <FiSearch className="h-5 w-5 text-gray-400" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="space-x-6 hidden md:flex items-center">
          <Link
            to="/articels"
            className="flex items-center hover:text-gray-700 transition-all duration-300 ease-in-out"
            aria-label="Articles"
          >
            <FiBookOpen className="mr-2" />
            Articles
          </Link>
          {user ? (
            <>
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 hover:text-gray-700 transition-all duration-300 ease-in-out"
                  aria-label="User menu"
                  aria-expanded={showProfileMenu}
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                    {user.profile_image ? (
                      <img
                        src={user.profile_image}
                        alt={user.full_name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <FiUser className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{user.full_name}</span>
                  <FiChevronDown className="h-4 w-4" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 w-48 mt-2 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.full_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigateBasedOnRole();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <RiDashboard3Line className="mr-2 h-4 w-4" /> Dashboard
                    </button>
                    {user.role === "admin" ||
                      (user.role === "instructor" && (
                        <Link
                          to="/profile/articles"
                          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center w-full"
                        >
                          <FiBookOpen className="mr-2 h-4 w-4" /> Your Articles
                        </Link>
                      ))}
                    <div className="border-t border-gray-100 mt-1">
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                      >
                        <FiLogOut className="mr-2 h-4 w-4" /> Sign out
                      </button>
                    </div>
                  </div>
                )}
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

        <div className="md:hidden flex items-center">
          <button
            type="button"
            className="text-orange-500"
            onClick={toggleMobileMenu}
            aria-label="Toggle Menu"
          >
            <FiMenu size={24} />
          </button>
        </div>
      </div>

      <div
        className={`md:hidden mt-4 space-y-4 ${
          isMobileMenuOpen ? "block" : "hidden"
        }`}
      >
        <div className="py-2 px-4">
          <form className="relative">
            <div className="flex items-center relative">
              <input
                ref={searchInputRef}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                placeholder="Search..."
                value={searchQuery}
                aria-label="Search"
              />
              <div className="ml-5 mt-1 flex items-center space-x-2">
                {searchQuery && (
                  <button
                    onClick={() => {
                      navigate(`/search?q=${searchQuery}`);
                      setSearchQuery("");
                    }}
                  >
                    <FiSearch className="h-5 w-5 text-black" />
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        <Link
          to="/articels"
          className="block py-2 px-4 text-gray-700 hover:bg-orange-100 rounded-md transition-all duration-300 ease-in-out"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Articles"
        >
          <FiBookOpen className="mr-2 inline" />
          Articles
        </Link>
        {user ? (
          <>
            <div className="px-4 py-2 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white mr-2">
                  {user.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={user.full_name}
                      className="w-full h-full  rounded-full"
                    />
                  ) : (
                    <FiUser className="h-4 w-4" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {user.full_name}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                navigateBasedOnRole();
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 px-4 text-gray-700 hover:bg-orange-100 rounded-md transition-all duration-300 ease-in-out"
            >
              <RiDashboard3Line className="mr-2 inline" /> Dashboard
            </button>
            <Link
              to="/profile/articles"
              className="block py-2 px-4 text-gray-700 hover:bg-orange-100 rounded-md transition-all duration-300 ease-in-out"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FiBookOpen className="mr-2 inline" /> Your Articles
            </Link>
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
