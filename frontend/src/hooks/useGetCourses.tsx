import { useQuery } from "@tanstack/react-query";
import axiosClient from "../API/axios";

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
  avgRating: string;
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
  const { data, isLoading, isError, error } = useQuery<CoursesResponse, Error>({
    queryKey: [
      "courses",
      currentPage,
      searchQuery,
      categoryFilter,
      priceFilter,
    ],
    queryFn: async () => {
      const res = await axiosClient.get<CoursesResponse>(
        `/course/get-courses`,
        {
          params: {
            page: currentPage,
            search: searchQuery,
            category: categoryFilter,
            priceRange: priceFilter,
          },
        }
      );
      return res.data;
    },
    staleTime: 1000 * 60 * 12,
    refetchInterval: 1000 * 60 * 12,
    retry: 1,
  });

  return {
    courses: data?.courses || [],
    pagination: data?.pagination || null,
    loading: isLoading,
    isError,
    error,
  };
};
