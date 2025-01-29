import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../API/ApiBaseUrl";

interface Course {
  course_id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  course_img: string;
  instructor: {
    full_name: string;
  };
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

export const useGetCourses = (
  currentPage?: number,
  searchQuery?: string,
  categoryFilter?: string,
  priceFilter?: string
) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const getCourses = async () => {
    try {
      setLoading(true);

      const res = await axios.get<CoursesResponse>(
        `${API}/course/get-courses`,
        {
          params: {
            page: currentPage,
            search: searchQuery,
            category: categoryFilter,
            priceRange: priceFilter,
          },
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const data = res.data;
      if (data) {
        setCourses(data.courses);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCourses();
  }, [currentPage, searchQuery, categoryFilter, priceFilter]);

  return { courses, loading, pagination, setCourses, setPagination };
};
