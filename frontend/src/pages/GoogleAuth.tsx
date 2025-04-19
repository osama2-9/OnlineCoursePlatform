import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API } from "../API/ApiBaseUrl";
import { useDispatch } from "react-redux";
import { setUser } from "../store/userSlice";
import { HomePageLayout } from "../layouts/HomePageLayout";

interface GoogleCallBackResponse {
  success: boolean;
  user: {
    userId: number;
    full_name: string;
    email: string;
    role: "learner" | "support" | "admin" | "instructor";
    towFAStatus: boolean;
    isActive: boolean;
  };
}

export const GoogleAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get<GoogleCallBackResponse>(`${API}/auth/google/callback`, {
          withCredentials: true
        });
        
        if (response.data.success && response.data.user) {
          dispatch(setUser(response.data.user));
          navigate("/");
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/login?error=auth_verification_failed");
      }
    };

    setTimeout(() => {
      fetchUserData();
    }, 500);
  }, [dispatch, navigate]);

  return (
    <HomePageLayout>
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="animate-spin mb-4 mx-auto h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-800">Authentication Successful</h2>
          <p className="text-gray-600 mt-2">Please wait while we log you in...</p>
        </div>
      </div>
    </HomePageLayout>
  );
};