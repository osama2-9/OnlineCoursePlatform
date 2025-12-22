import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
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
  hasNext: boolean;
}

interface CoursesResponse {
  courses: Course[];
  pagination: Pagination;
}

export const useGetCourses = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const getDeviceType = () => (window.innerWidth < 768 ? "mobile" : "desktop");
  const [device, setDevice] = useState<"mobile" | "desktop">(getDeviceType);

  useEffect(() => {
    const handleResize = () => setDevice(getDeviceType());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const searchQuery = searchParams.get("search") || "";
  const categoryFilter = searchParams.get("category") || "";
  const priceFilter = searchParams.get("priceRange") || "";

  const pageSize = device === "mobile" ? 4 : 9;
  const isMobile = device === "mobile";

  const [page, setPage] = useState<number>(1);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [pagination, setPagination] = useState<Pagination>({
    totalCourses: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize,
    hasNext: false,
  });
  const fetchCourses = async (pageNum: number) => {
    try {
      const res = await axiosClient.get<CoursesResponse>(
        "/course/get-courses",
        {
          params: {
            page: pageNum,
            search: searchQuery,
            category: categoryFilter,
            priceRange: priceFilter,
            pageSize,
          },
        }
      );
      return res.data;
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error || "Failed to fetch courses");
    }
  };

  const { data, isLoading: isCoursesLoading } = useQuery({
    queryKey: [
      "courses",
      searchQuery,
      categoryFilter,
      priceFilter,
      pageSize,
      device,
    ],
    queryFn: () => fetchCourses(1),
    retry: 2,
    staleTime: 12 * 60 * 1000,
  });

  useEffect(() => {
    if (data) {
      if (page === 1) {
        setCourses(data.courses);
        setPagination(data.pagination);
      } else {
        setPagination(data.pagination);
      }
    }
  }, [data]);

  const fetchMoreCourses = useCallback(async () => {
    if (!pagination.hasNext || isLoadingMore || device !== "mobile") return;

    setIsLoadingMore(true);
    const nextPage = page + 1;
    const nextData: CoursesResponse | undefined = await fetchCourses(nextPage);

    setPage(nextPage);
    if (nextData) {
      setCourses((prev) => [...prev, ...nextData.courses]);
      setPagination(nextData.pagination);
    }

    setIsLoadingMore(false);
  }, [
    pagination?.hasNext,
    isLoadingMore,
    page,
    device,
    searchQuery,
    categoryFilter,
    priceFilter,
    pageSize,
  ]);

 return {
  courses: courses || [],
  isCoursesLoading,
  fetchMoreCourses,
  isLoadingMore,
  pagination: pagination || { totalCourses: 0, totalPages: 1, currentPage: 1, pageSize, hasNext: false },
  device,
  isMobile,
  hasMore: pagination?.hasNext ?? false,
};

};
