import axios from "axios";
import { API } from "../API/ApiBaseUrl";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface Category {
  name: string;
  category_id: number;
}

interface CategoriesResponse {
  categories: Category[];
}

export const useGetCategories = () => {
  const [categoriesOptions, setCategoriesOptions] = useState<Category[]>([]);

  const getCategories = async () => {
    try {
      const res = await axios.get<CategoriesResponse>(
        `${API}/articels/get-categories`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = res.data;
      if (data) {
        return data;
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 24 * 1000 * 60,
    refetchInterval: 24 * 1000 * 60,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data && data.categories) {
      setCategoriesOptions(data.categories);
    }
  }, [data]);

  return { categoriesOptions, error, isLoading };
};
