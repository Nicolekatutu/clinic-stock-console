import { useQuery } from '@tanstack/react-query';
import { getProduct } from '../api/productsApi';

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
    enabled: Number.isInteger(id) && id > 0,
  });
};
