import axios from "axios";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { API } from "../API/ApiBaseUrl";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export const ActiveAccount = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  const navigate = useNavigate();

  const activeAccountAttempt = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${API}/auth/active-acc-attempt`,
        { token },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      const data = await res.data;
      if (data) {
        setIsActivated(true);
        toast.success(data.message);
        // Redirect the user to the login page after activation
        setTimeout(() => {
          navigate("/login");
        }, 2000); // Delay before redirecting to allow the user to see the success message
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      activeAccountAttempt();
    }
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-lg bg-white shadow-sm rounded-lg p-8 space-y-6">
        <h1 className="text-3xl font-semibold text-gray-800 text-center">
          Activate Your Account
        </h1>

        {isActivated ? (
          <div className="text-center">
            <p className="text-xl text-green-600">
              Your account has been successfully activated!
            </p>
          </div>
        ) : (
          <div className="text-center">
            {isLoading ? (
              <div className="flex justify-center items-center">
                <Loader2 className="animate-spin text-orange-600 h-12 w-12" />{" "}
                {/* Lucide Loading Icon */}
              </div>
            ) : (
              <p className="text-gray-600">
                {token
                  ? "We are activating your account. Please wait..."
                  : "No activation token found. Please check your activation link."}
              </p>
            )}
          </div>
        )}

        <div className="text-center mt-6">
          {!isLoading && !isActivated && (
            <button
              onClick={activeAccountAttempt}
              className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all"
            >
              Retry Activation
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
