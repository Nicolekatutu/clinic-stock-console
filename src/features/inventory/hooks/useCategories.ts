import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../api/categoriesApi';

export const useCategories = () => {
  return useQuery({
    queryKey: ['product-categories'],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });
};
