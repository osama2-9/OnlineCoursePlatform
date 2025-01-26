import axios from "axios";
import toast from "react-hot-toast";
import { API } from "../API/ApiBaseUrl";
import { clearUser } from "../store/userSlice";
import { useDispatch } from "react-redux";

export const useLogout = () => {
  const dispatch = useDispatch();
  const handleLogout = async () => {
    try {
      const res = await axios.post(
        `${API}/auth/logout`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.status === 200 && res.data) {
        dispatch(clearUser());
      } else {
        toast.error("Failed to log out!");
      }
    } catch (error: any) {
      console.error("Logout error: ", error);
      const errorMessage =
        error?.response?.data?.error || "An unexpected error occurred.";
      toast.error(errorMessage);
    }
  };

  return { handleLogout };
};
