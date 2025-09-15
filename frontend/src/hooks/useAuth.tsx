import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { useLogout } from "./useLogout";
import { useEffect, useCallback, useRef } from "react";
import axiosClient from "../API/axios";
import { clearUser, setUser } from "../store/userSlice";
import { useLocation } from "react-router-dom";

export const useAuth = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const { handleLogout } = useLogout();
  const location = useLocation();
  const isCheckingAuth = useRef(false);

  const handleLogoutRef = useRef(handleLogout);
  handleLogoutRef.current = handleLogout;

  const checkAuth = useCallback(async () => {
    if (isCheckingAuth.current) return;
    isCheckingAuth.current = true;

    try {
      const authCheck = await axiosClient.get("/auth/check-auth");

      if (authCheck.status === 200 && !user) {
        const response = await axiosClient.get("/auth/me");
        dispatch(setUser(response.data));
      }
    } catch (error: any) {
      console.log("Auth check error:", error);

      if (error?.response?.status === 401) {
        try {
          await axiosClient.post("/auth/refresh");
          const response = await axiosClient.get("/auth/me");
          dispatch(setUser(response.data));
        } catch (refreshError) {
          handleLogoutRef.current();
        }
      } else {
        dispatch(clearUser());
      }
    } finally {
      isCheckingAuth.current = false;
    }
  }, [dispatch, user]);

  useEffect(() => {
    const handleAuthLogout = () => {
      dispatch(clearUser());
      handleLogoutRef.current();
    };

    window.addEventListener("auth:logout", handleAuthLogout);
    return () => window.removeEventListener("auth:logout", handleAuthLogout);
  }, [dispatch]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  const refreshUserData = useCallback(async () => {
    if (isCheckingAuth.current) return;

    isCheckingAuth.current = true;

    try {
      await axiosClient.get(`/auth/check-auth`);
      const res = await axiosClient.get("/auth/me");
      dispatch(setUser(res.data));
    } catch (error: any) {
      console.log("Refresh user data error:", error);
      if (error?.response?.status === 401) {
        dispatch(clearUser());
        handleLogoutRef.current();
      } else {
        dispatch(clearUser());
      }
    } finally {
      isCheckingAuth.current = false;
    }
  }, [dispatch]);

  return { user, checkAuth, refreshUserData };
};
