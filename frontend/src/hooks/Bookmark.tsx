import { useState } from "react";
import toast from "react-hot-toast";
import axiosClient from "../API/axios";

export const useBookmark = (articleId: any, userId: any) => {
  const [addBookmarkSuccess, setAddBookmarkSuccess] = useState<boolean>(false);
  const [removeBookmarkSuccess, setRemoveBookmarkSuccess] =
    useState<boolean>(false);

  const addBookmark = async () => {
    try {
      const res = await axiosClient.post(`/articels/add-bookmark`, {
        userId: userId,
        articleId: articleId,
      });

      const data = await res.data;
      if (data.add_bookmark_success) {
        setAddBookmarkSuccess(true);
        toast.success(data.message || "Article bookmarked successfully");
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to bookmark article");
    }
  };

  const removeBookmark = async () => {
    try {
      const res = await axiosClient.delete(
        `/articels/remove-bookmark/${articleId}/${userId}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.data;
      if (data.remove_bookmark_success) {
        setRemoveBookmarkSuccess(true);
        toast.success(data.message || "Bookmark removed successfully");
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to remove bookmark");
    }
  };

  return {
    addBookmarkSuccess,
    removeBookmarkSuccess,
    addBookmark,
    removeBookmark,
  };
};
