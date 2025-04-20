import axios from "axios";
import React, { useState, useEffect } from "react";
import { API } from "../API/ApiBaseUrl";
import { HomePageLayout } from "../layouts/HomePageLayout";
import { setUser } from "../store/userSlice";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [is2FARequired, setIs2FARequired] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  const [error, setError] = useState<string>("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const errorParam = queryParams.get('error');
    if (errorParam === 'google_auth_failed' || errorParam === 'auth_verification_failed') {
      setError('Google authentication failed. Please try again.');
    }
  }, [location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError("");
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
          navigate("/");
        }
      }
    } catch (error: any) {
      console.error(error);
      if (
        error?.response?.data?.error === "This Account has been deactivated "
      ) {
        setError(error?.response?.data?.error);
      } else {
        setError(error?.response?.data?.error || "Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError("");
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
        navigate("/");
      }
    } catch (error: any) {
      console.error(error);
      setError(error?.response?.data?.error || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async() => {
    try {
      setGoogleLoading(true)
      const res = await axios.get(`${API}/auth/google-auth-url` ,{
        withCredentials: true,
      });
      const data = await res.data
      if(data){
        window.location.replace(data.url);
      }
    } catch (error) {
      console.log(error);
      setError("Failed to login with Google");
    }finally{
      setGoogleLoading(false)
    }
  
  };

  const activeLink = () => {
    return (
      <Link to={"/active-account-request"} className="text-green-600 font-semibold">
        Reactivate your account
      </Link>
    );
  };

  return (
    <HomePageLayout>
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col lg:flex-row w-full max-w-5xl bg-white lg:shadow-lg lg:rounded-lg overflow-hidden">
          <div className="hidden lg:flex items-center justify-center w-full lg:w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <img
              src={"/login.png"}
              alt="Login Illustration"
              className="w-3/4 h-auto"
            />
          </div>

          <div className="flex flex-col justify-center w-full lg:w-1/2 p-6 lg:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center mb-4">
              Welcome Back! 👋
            </h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Log in to continue your learning journey
            </p>

            <form
              onSubmit={is2FARequired ? handle2FAVerification : handleLogin}
              className="space-y-4"
            >
              <div className="space-y-3">
                {!is2FARequired && (
                  <>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        className="block w-full p-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-all"
                        required
                      />
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
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="********"
                          className="block w-full p-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {is2FARequired && (
                  <div>
                    <label
                      htmlFor="2fa-code"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      2FA Code
                    </label>
                    <input
                      id="2fa-code"
                      type="text"
                      value={twoFACode}
                      onChange={(e) => setTwoFACode(e.target.value)}
                      placeholder="Enter 2FA code"
                      className="block w-full p-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                )}
              </div>

              {error && (
                <div className="text-red-500 text-xs mt-1 text-center">
                  {error === "This Account has been deactivated" ? (
                    <>
                      {error} <br />
                      {activeLink()}
                    </>
                  ) : (
                    error
                  )}
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-2.5 text-sm bg-orange-600 text-white font-medium rounded-md transition-all ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "hover:bg-orange-700"
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
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
                    Logging in...
                  </span>
                ) : is2FARequired ? (
                  "Verify 2FA"
                ) : (
                  "Login"
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
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className={`w-full py-2.5 text-sm bg-white text-gray-700 font-medium rounded-md border border-gray-300 transition-all flex items-center justify-center space-x-2 ${
                googleLoading ? "cursor-not-allowed opacity-70" : "hover:bg-gray-50"
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

            <div className="text-center space-y-2 mt-4">
              <p className="text-xs text-gray-600">
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
                className="block text-xs text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors"
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