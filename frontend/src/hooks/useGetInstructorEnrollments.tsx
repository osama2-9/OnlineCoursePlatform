import axios from "axios";
import toast from "react-hot-toast";
import { API } from "../API/ApiBaseUrl";
import { useAuth } from "./useAuth";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

export interface EnrollmentsData {
  enrollment_id: number;
  enrollment_date: Date;
  status: string;
  user: {
    full_name: string;
    is_active: boolean;
    email: string;
    isEmailVerified: boolean;
    lastLogin: Date;
  };
  course: {
    title: string;
    course_id: number;
  };
}
interface Pagination {
  totalEnrollments: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}
interface InstructorEnrollmentsReponse {
  enrollments: EnrollmentsData[];
  pagintion: Pagination;
}
export const useGetInstructorEnrollments = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentsData[] | null>([]);
  const [pagintion, setPagination] = useState<Pagination>({
    currentPage: 1,
    limit: 0,
    totalEnrollments: 0,
    totalPages: 0,
  });
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);

  const getEnrollmentsData = async () => {
    try {
      setEnrollmentsLoading(true);
      const res = await axios.get<InstructorEnrollmentsReponse>(
        `${API}/instructor/instructor-courses-enrollments/${user?.userId}`,
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
    } finally {
      setEnrollmentsLoading(false);
    }
  };

  const { data } = useQuery({
    queryKey: ["instructorenrollments", user?.userId],
    queryFn: getEnrollmentsData,
    staleTime: 1 * 1000 * 60,
    refetchInterval: 1 * 1000 * 60,
    retry: 2,
  });
  useEffect(() => {
    if (data) {
      setEnrollments(data.enrollments || []);
      setPagination(data.pagintion || null);
    }
  }, [data]);

  return { enrollments, enrollmentsLoading  ,pagintion};
};
