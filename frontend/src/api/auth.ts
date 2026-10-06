import { apiClient } from '@/api/client';
import type { LoginRequest, TokenResponse, User } from '@/types';

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

export const authApi = {
  login: async (payload: LoginRequest): Promise<TokenResponse> => {
    const { data } = await apiClient.post<TokenResponse>('/auth/login', payload);
    return data;
  },
  register: async (payload: RegisterPayload): Promise<User> => {
    const { data } = await apiClient.post<User>('/auth/register', payload);
    return data;
  },
  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },
  updateMe: async (payload: { full_name?: string; password?: string }): Promise<User> => {
    const { data } = await apiClient.patch<User>('/auth/me', payload);
    return data;
  },
};
