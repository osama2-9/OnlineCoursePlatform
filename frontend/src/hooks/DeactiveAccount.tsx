import axios from "axios";
import { API } from "../API/ApiBaseUrl";
import { useLogout } from "./useLogout";
import toast from "react-hot-toast";

export const DeactiveAccount = () => {
  const { handleLogout } = useLogout();

  const handleConfiremDeactive = async (userId: any) => {
    try {
      const res = await axios.post(
        `${API}/auth/deactive`,
        {
          userId: userId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

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
