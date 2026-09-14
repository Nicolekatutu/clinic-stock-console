import { useQueryClient } from '@tanstack/react-query';
import { clearTokens } from '../../../lib/storage';

export const useLogout = () => {
  const queryClient = useQueryClient();

  return () => {
    clearTokens();

    queryClient.removeQueries({
      queryKey: ['auth'],
    });

    queryClient.removeQueries({
      queryKey: ['product'],
    });

    queryClient.removeQueries({
      queryKey: ['products'],
    });

    queryClient.removeQueries({
      queryKey: ['product-categories'],
    });
  };
};
