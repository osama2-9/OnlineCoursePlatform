import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../API/axios";
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
  totalPages: number;
  currentPage: number;
  limit: number;
}

interface InstructorCoursesResponse {
  courses: CourseDetails[];
  pagination: Pagination;
}
export const useGetInstructorCourses = () => {
  const [courses, setCourses] = useState<CourseDetails[] | null>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    limit: 0,
    totalCourses: 0,
    totalPages: 0,
  });
  const { user } = useAuth();

  const getInstructorCourses = async () => {
    try {
      const res = await axiosClient.get<InstructorCoursesResponse>(
        `/instructor/instructor-courses/${user?.userId}`
      );
      return res.data;
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      "instructorcourses",
      user?.userId,
      pagination.currentPage,
      pagination.totalPages,
    ],
    queryFn: getInstructorCourses,
    staleTime: 24 * 60 * 60 * 1000,
    refetchInterval: 24 * 60 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    if (data) {
      setCourses(data.courses || []);
      setPagination(data.pagination || null);
    }
  }, [data]);

  return { courses, isLoading, pagination };
};
