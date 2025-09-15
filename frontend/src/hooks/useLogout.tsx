import { useDispatch } from "react-redux";
import { clearUser } from "../store/userSlice";
import axiosClient from "../API/axios";

export const useLogout = () => {
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await axiosClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(clearUser());
    }
  };

  return { handleLogout };
};
