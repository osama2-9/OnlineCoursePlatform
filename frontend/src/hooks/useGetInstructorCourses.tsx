import axios from "axios";
import toast from "react-hot-toast";
import { API } from "../API/ApiBaseUrl";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { useQuery } from "@tanstack/react-query";
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

interface InstructorCoursesResponse {
  courses: CourseDetails[];
  pagination: Pagination;
}
export const useGetInstructorCourses = () => {
  const [courses, setCourses] = useState<CourseDetails[] | null>([]);
  const { user } = useAuth();

  const getInstructorCourses = async () => {
    try {
      const res = await axios.get<InstructorCoursesResponse>(
        `${API}/instructor/instructor-courses/${user?.userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return res.data;
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["instructorcourses", user?.userId],
    queryFn: getInstructorCourses,
    staleTime: 1 * 1000 * 60,
    refetchInterval: 1 * 1000 * 60,
    retry: 2,
  });

  useEffect(() => {
    if (data) {
      setCourses(data.courses || []);
    }
  }, [data]);

  return { courses, isLoading };
};
