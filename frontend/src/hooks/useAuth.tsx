import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import axios from "axios";
import { API } from "../API/ApiBaseUrl";
import { useLogout } from "./useLogout";
import { useEffect } from "react";
interface AuthResponse {
  success: boolean;
}
export const useAuth = () => {
  const user = useSelector((state: RootState) => state?.user?.user);
  const { handleLogout } = useLogout();
  const checkAuth = async () => {
    try {
      const res = await axios.get<AuthResponse>(`${API}/auth/check-auth`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      const data = res.data;
      if (data) return true;
    } catch (error: any) {
      console.log(error);
      if (error.response.status === 401) {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    checkAuth();
  }, [user]);
  return { user, checkAuth };
};
