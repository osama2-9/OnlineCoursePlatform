import axios from "axios";
import { useEffect, useState } from "react";
import { API } from "../API/ApiBaseUrl";
import toast from "react-hot-toast";

interface Instructor {
  user_id: number;
  full_name: string;
}

export const useGetInstructor = () => {
  const [instractors, setInstructors] = useState<Instructor | null>(null);
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await axios.get(`${API}/admin/get-instructors`, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
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
