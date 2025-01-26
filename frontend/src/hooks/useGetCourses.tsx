import axios from "axios";
import { useEffect, useState } from "react";
interface Course {
  course_id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  course_img: string;
}

interface Pagination {
  totalCourses: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

interface CoursesResponse {
  courses: Course[];
  pagination: Pagination;
}

export const useGetCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const getCourses = async () => {
    try {
      setLoading(true);

      const res = await axios.get<CoursesResponse>(`/api/course/get-courses`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      const data = res.data;
      if (data) {
        setCourses(data.courses);
      }
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCourses();
  }, [currentPage]);

  return { courses, loading, pagination, setCurrentPage };
};
