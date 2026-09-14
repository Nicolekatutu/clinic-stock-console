import api from '../../../lib/axios';
import type { AuthUser, LoginRequest, LoginResponse } from './auth.types';

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', credentials);

  return response.data;
};

export const getMe = async (): Promise<AuthUser> => {
  const response = await api.get<AuthUser>('/auth/me');

  return response.data;
};
