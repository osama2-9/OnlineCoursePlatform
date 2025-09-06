import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import axiosClient from "../API/axios";

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
      const res = await axiosClient.get<CategoriesResponse>(
        `/articels/get-categories`
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
