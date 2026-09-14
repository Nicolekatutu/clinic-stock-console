import { useMutation } from '@tanstack/react-query';
import { login } from '../api/authApi';
import { setTokens } from '../../../lib/storage';
import type { LoginRequest } from '../api/auth.types';

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials),
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
    },
  });
};
