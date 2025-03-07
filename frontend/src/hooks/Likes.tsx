import axios from "axios";
import toast from "react-hot-toast";
import { API } from "../API/ApiBaseUrl";
import { useState } from "react";

export const Likes = (articleId: any, userId: any) => {
 const [addLikeSuccess, setAddLikeSuccess] = useState<boolean>(false);
 const [removeLikeSuccess, setRemoveLikeSuccess] = useState<boolean>(false);

  const handleClickLike = async () => {
    try {
      const res = await axios.post(
        `${API}/articels/like`,
        {
          articleId: articleId,
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
      if (data.add_like_success) {
        setAddLikeSuccess(true);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to like article");
    }
  };

  const handleClickUnlike = async () => {
    try {
      const res = await axios.delete(
        `${API}/articels/remove-like/${articleId}/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = await res.data;
      if (data.remove_like_success) {
        setRemoveLikeSuccess(true);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to unlike article");
    }
  };

  return { handleClickLike, handleClickUnlike ,addLikeSuccess, removeLikeSuccess};
};
