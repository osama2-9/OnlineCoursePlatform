import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosClient from "../API/axios";

interface Instructor {
  user_id: number;
  full_name: string;
}

export const useGetInstructor = () => {
  const [instractors, setInstructors] = useState<Instructor | null>(null);
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await axiosClient.get(`/admin/get-instructors`);
        const data = await response.data;
        if (data && data.instructors) {
          setInstructors(data.instructors);
        }
      } catch (error) {
        console.error("Error fetching instructors", error);
        toast.error("Failed to fetch instructors");
      }
    };

    fetchInstructors();
  }, []);

  return { instractors };
};
