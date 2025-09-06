import axiosClient from "../API/axios";
import { useLogout } from "./useLogout";
import toast from "react-hot-toast";

export const DeactiveAccount = () => {
  const { handleLogout } = useLogout();

  const handleConfiremDeactive = async (userId: any) => {
    try {
      const res = await axiosClient.post(`/auth/deactive`, {
        userId: userId,
      });

      const data = await res.data;
      if (data && data.success) {
        handleLogout();
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    }
  };

  return { handleConfiremDeactive };
};
