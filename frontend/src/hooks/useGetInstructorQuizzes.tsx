import axios from "axios";
import { API } from "../API/ApiBaseUrl";
import { useState } from "react";
import { useAuth } from "./useAuth";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

interface Quiz {
  quiz_id: number;
  title: string;
  description: string;
  duration: number;
  max_attempts: number;
  is_published: boolean;
  created_at: string;
  course: {
    title: string;
    course_id: number;
  };
}

interface Pagination {
  totalQuizzes: number;
  totalPages: number;
  currentPage: number;
}

interface QuizzesResponse {
  quizzes: Quiz[];
  pagination: Pagination;
}

export const useGetInstructorQuizzes = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [quizzesLoading, setQuizzesLoading] = useState<boolean>(false);
  const { user } = useAuth();
  const quizzesPerPage = 8;

  const getQuizzes = async () => {
    if (!user?.userId) return null;
    setQuizzesLoading(true);
    try {
      const res = await axios.get<QuizzesResponse>(
        `${API}/instructor/get-quizzes/${user.userId}`,
        {
          params: { page: currentPage, pageSize: quizzesPerPage },
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return res.data;
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to fetch quizzes");
      return {
        quizzes: [],
        pagination: { currentPage: 1, totalPages: 1, totalQuizzes: 0 },
      };
    } finally {
      setQuizzesLoading(false);
    }
  };
  const { data } = useQuery({
    queryKey: ["quizzes", user?.userId, currentPage],
    queryFn: getQuizzes,
    staleTime: 1 * 60 * 1000,
    refetchInterval: 1 * 60 * 1000,
    retry: 2,
    enabled: !!user?.userId,
  });
  const changePage = (newPage: number) => {
    setCurrentPage(newPage);
  };
  return {
    quizzes: data?.quizzes || [],
    quizzesLoading,
    pagination: data?.pagination || {
      currentPage: 1,
      totalPages: 1,
      totalQuizzes: 0,
    },
    changePage,
  };
};
