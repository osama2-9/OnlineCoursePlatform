import axios from "axios";
import React, { useState } from "react";
import { API } from "../API/ApiBaseUrl";
import toast from "react-hot-toast";
import { HomePageLayout } from "../layouts/HomePageLayout";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../store/userSlice";

export const Signup = () => {
  const dispatch = useDispatch();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
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
      const res = await axios.post(
        `${API}/auth/signup`,
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

  return (
    <HomePageLayout>
      <div className="flex items-center justify-center min-h-screen ">
        <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white lg:shadow-lg lg:rounded-lg overflow-hidden">
          <div className="hidden lg:flex items-center justify-center w-full lg:w-1/2 bg-gray-50 p-8">
            <img
              src={"/login.png"}
              alt="Signup Illustration"
              className="w-3/4 h-auto"
            />
          </div>

          <div className="flex flex-col justify-center w-full lg:w-1/2 p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-4">
              Sign up and start your learning journey
            </h2>

            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-1"
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
                  className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
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
                  className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
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
                    className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                className={`w-full py-3 bg-orange-600 text-white font-medium rounded-lg transition-colors ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "hover:bg-orange-700"
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2" />
                    Signing up...
                  </div>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>

            <div className="text-center text-sm text-gray-500 mt-6">
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
