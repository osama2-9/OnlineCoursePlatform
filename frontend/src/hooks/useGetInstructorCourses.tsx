import axios from "axios";
import toast from "react-hot-toast";
import { API } from "../API/ApiBaseUrl";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
export interface CourseDetails {
  title: string;
  description: string;
  category: string;
  course_id: number;
  course_img: string;
  instructor_id: number;
  is_published: boolean;
  learning_outcomes: string[];
  price: number;
  total_enrollments: number;
  average_rating: number;
}

interface Pagination {
    totalCourses: number;
    totalPages: 1;
    currentPage: 1;
    limit: 10;
}
export const useGetInstructorCourses = () => {
  const [courses, setCourses] = useState<CourseDetails[] | null>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const getInstructorCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/instructor/instructor-courses/${user?.userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = await res.data;
      if (data) {
        setCourses(data.courses);
        setPagination(data.pagination);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInstructorCourses();
  }, [user?.userId]);

  return { courses, loading, pagination };
};
