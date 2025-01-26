import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import toast from "react-hot-toast";
import axios from "axios";
import { API } from "../API/ApiBaseUrl";
interface Quizzes {
  quiz_id: number;
  course_id: number;
  title: string;
  description: string;
  duration: number;
  max_attempts: number;
  is_published: boolean;
  course: {
    title: string;
  };
  enrollment_id: number;
  Attempt: {
    score: number;
  }[]
}
export const useGetLearnerQuizzes = () => {
  const [quizzesLoading, setIsQuizzesLoading] = useState<boolean>(false);
  const [quizzs, setQuizzes] = useState<Quizzes[]>([]);
  const { user } = useAuth();
  const getQuizzes = async () => {
    try {
      setIsQuizzesLoading(true);
      const res = await axios.get(
        `${API}/learner/get-avliable-quizzes/${user?.userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = await res.data;
      if (data) {
        setQuizzes(data.quizzes);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    } finally {
      setIsQuizzesLoading(false);
    }
  };


  useEffect(() => {
    getQuizzes();
  }, [user?.userId]);
  return { quizzs, quizzesLoading };
};
