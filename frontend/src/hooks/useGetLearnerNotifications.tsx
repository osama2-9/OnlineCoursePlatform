import { useAuth } from "./useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import axiosClient from "../API/axios";

interface Notifications {
  notification_id: number;
  message: string;
  type: "ASSIGNMENT_NEW" | "QUIZ_NEW" | "ASSIGNEMNT_DEADLINE";
  created_at: Date;
}

const useGetLearnerNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notifications[]>([]);
  const getNotifications = async () => {
    try {
      const res = await axiosClient.get(`/learner/get-notifications`, {
        params: {
          userId: user?.userId,
        },
      });
      const data = await res.data;
      if (data) {
        return data;
      }
      return [];
    } catch (error) {
      console.log(error);

      return [];
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", user?.userId],
    queryFn: getNotifications,
    staleTime: 24 * 60 * 60 * 1000,
    refetchInterval: 24 * 60 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    if (data) {
      setNotifications(data.data);
    }
  }, [data]);

  return { notifications, isLoading };
};

export default useGetLearnerNotifications;
