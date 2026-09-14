import { useQuery } from '@tanstack/react-query';
import { getMe } from '../api/authApi';
import { getAccessToken } from '../../../lib/storage';

export const useAuth = () => {
  const accessToken = getAccessToken();

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    enabled: Boolean(accessToken),
    retry: false,
  });
};
