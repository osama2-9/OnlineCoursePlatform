import axios from "axios";
import { API } from "../API/ApiBaseUrl";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import toast from "react-hot-toast";

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
    course_id:number
  };
}

export const useGetInstructorQuizzes = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizzesloading, setQuizzesLoading] = useState<boolean>(false);
  const { user } = useAuth();
  let quizzesPerPage = 8;
  const getQuizzes = async (page: number = 1) => {
    try {
      setQuizzesLoading(true);
      const res = await axios.get(
        `${API}/instructor/get-quizzes/${user?.userId}`,
        {
          params: { page, pageSize: quizzesPerPage },
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = res.data;
      if (data) {
        setQuizzes(data.quizzes);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to fetch quizzes");
    } finally {
      setQuizzesLoading(false);
    }
  };

  useEffect(()=>{getQuizzes()} ,[user?.userId])
  return { quizzes, quizzesloading };
};
