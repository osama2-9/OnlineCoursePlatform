// In useAuth.js
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { useEffect, useCallback } from "react";
import axiosClient from "../API/axios";
import { clearUser, setUser } from "../store/userSlice";

export const useAuth = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();

  const fetchUserData = useCallback(async () => {
    try {
      const response = await axiosClient.get("/auth/me");
      dispatch(setUser(response.data));
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      dispatch(clearUser());
    }
  }, [dispatch]);

  useEffect(() => {
    if (!user) {
      fetchUserData();
    }
  }, [user, fetchUserData]);

  return { user, fetchUserData };
};
