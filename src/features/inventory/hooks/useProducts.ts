import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../api/productsApi';

export const useProducts = (
  limit: number,
  skip: number,
  search: string,
  category: string,
  sortBy: string,
  order: 'asc' | 'desc',
) => {
  return useQuery({
    queryKey: ['products', limit, skip, search, category, sortBy, order],
    queryFn: ({ signal }) =>
      getProducts({
        limit,
        skip,
        search,
        category,
        sortBy,
        order,
        signal,
      }),
    placeholderData: (previousData) => previousData,
  });
};
