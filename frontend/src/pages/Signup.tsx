import React, { useState } from "react";
import toast from "react-hot-toast";
import { HomePageLayout } from "../layouts/HomePageLayout";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../store/userSlice";
import { FcGoogle } from "react-icons/fc";
import axiosClient from "../API/axios";

export const Signup = () => {
  const dispatch = useDispatch();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const res = await axiosClient.post(
        `/auth/signup`,
        { full_name: fullName, email, password_hash: password },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = res.data;
      if (data) {
        toast.success("Successfully signed up!");
        navigate("/");
        dispatch(setUser(data));
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error || "Failed to sign up.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true);
      const res = await axiosClient.get(`/auth/google-auth-url`, {
        withCredentials: true,
      });
      const data = await res.data;
      if (data) {
        window.location.replace(data.url);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to connect with Google.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <HomePageLayout>
      <div className="flex items-center justify-center min-h-screen py-6">
        <div className="flex flex-col lg:flex-row w-full max-w-5xl bg-white lg:shadow-md lg:rounded-lg overflow-hidden">
          <div className="hidden lg:flex items-center justify-center w-full lg:w-2/5 bg-gray-50 p-6">
            <img
              src={"/login.png"}
              alt="Signup Illustration"
              className="w-4/5 h-auto"
            />
          </div>

          <div className="flex flex-col justify-center w-full lg:w-3/5 p-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center mb-3">
              Sign up and start your learning journey
            </h2>

            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="block w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="block w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="block w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "hover:bg-orange-700"
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin mr-2" />
                    Signing up...
                  </div>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="mx-2 text-xs text-gray-400">OR</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={googleLoading}
              className={`w-full py-2.5 text-sm bg-white text-gray-700 font-medium rounded-md border border-gray-300 transition-all flex items-center justify-center space-x-2 ${
                googleLoading
                  ? "cursor-not-allowed opacity-70"
                  : "hover:bg-gray-50"
              }`}
            >
              {googleLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  <FcGoogle className="text-lg" />
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="text-center text-xs text-gray-500 mt-4">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="text-orange-600 hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </HomePageLayout>
  );
};
