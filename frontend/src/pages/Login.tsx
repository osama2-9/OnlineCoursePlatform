import axios from "axios";
import React, { useState } from "react";
import { API } from "../API/ApiBaseUrl";
import toast from "react-hot-toast";
import { HomePageLayout } from "../layouts/HomePageLayout";
import { setUser } from "../store/userSlice";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [is2FARequired, setIs2FARequired] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  const dispatch = useDispatch();
  const navigator = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await axios.post(
        `${API}/auth/login`,
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      const data = res.data;
      if (data) {
        if (data.twoFARequired) {
          setIs2FARequired(true);
        } else {
          dispatch(setUser(data));
          navigator("/");
        }
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await axios.post(
        `${API}/auth/verify-2fa`,
        { email, token: twoFACode },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      const data = res.data;
      if (data) {
        dispatch(setUser(data));
        navigator("/");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <HomePageLayout>
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white lg:shadow-xl lg:rounded-xl overflow-hidden transform transition-all  duration-300">
          <div className="hidden lg:flex items-center justify-center w-full lg:w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 p-12">
            <img
              src={"/login.png"}
              alt="Login Illustration"
              className="w-3/4 h-auto transform transition-transform  duration-300"
            />
          </div>

          <div className="flex flex-col justify-center w-full lg:w-1/2 p-8 lg:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-8 animate-fade-in">
              Welcome Back! 👋
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Log in to continue your learning journey
            </p>

            <form
              onSubmit={is2FARequired ? handle2FAVerification : handleLogin}
              className="space-y-6"
            >
              <div className="space-y-4">
                {!is2FARequired && (
                  <>
                    <div className="relative">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        className="block w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-orange-300"
                        required
                      />
                    </div>

                    <div className="relative">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="********"
                          className="block w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-orange-300"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {is2FARequired && (
                  <div className="relative">
                    <label
                      htmlFor="2fa-code"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      2FA Code
                    </label>
                    <input
                      id="2fa-code"
                      type="text"
                      value={twoFACode}
                      onChange={(e) => setTwoFACode(e.target.value)}
                      placeholder="Enter 2FA code"
                      className="block w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-orange-300"
                      required
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className={`w-full py-4 bg-orange-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:translate-y-[-1px] hover:shadow-lg ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "hover:bg-orange-700"
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3"
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
                    Logging in...
                  </span>
                ) : is2FARequired ? (
                  "Verify 2FA"
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <div className="text-center space-y-4 mt-8">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors"
                >
                  Sign up
                </Link>
              </p>
              <Link
                to="/forgot-password"
                className="block text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </HomePageLayout>
  );
};
