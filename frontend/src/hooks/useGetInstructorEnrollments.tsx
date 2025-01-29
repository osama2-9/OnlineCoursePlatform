import axios from "axios";
import toast from "react-hot-toast";
import { API } from "../API/ApiBaseUrl";
import { useAuth } from "./useAuth";
import { useEffect, useState } from "react";

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

export const useGetInstructorEnrollments = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentsData[] | null>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const getEnrollmentsData = async () => {
    try {
      setEnrollmentsLoading(true);
      const res = await axios.get(
        `${API}/instructor/instructor-courses-enrollments/${user?.userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = await res.data;
      if (data) {
        setEnrollments(data.enrollments);
        setPagination(data.pagination);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    } finally {
      setEnrollmentsLoading(false);
    }
  };
  useEffect(() => {
    getEnrollmentsData();
  }, [user?.userId]);

  return { enrollments, enrollmentsLoading, pagination };
};
