import { apiClient } from '@/api/client';
import type { LoginRequest, RegisterInput, TokenResponse, UpdateMeInput, User } from '@/types';

export const authApi = {
  login: async (payload: LoginRequest): Promise<TokenResponse> => {
    const { data } = await apiClient.post<TokenResponse>('/auth/login', payload);
    return data;
  },
  /** Storefront sign-up — always creates a customer and returns a session. */
  register: async (payload: RegisterInput): Promise<TokenResponse> => {
    const { data } = await apiClient.post<TokenResponse>('/auth/register', payload);
    return data;
  },
  googleVerify: async (idToken: string): Promise<TokenResponse> => {
    const { data } = await apiClient.post<TokenResponse>('/auth/google/verify', { id_token: idToken });
    return data;
  },
  providers: async (): Promise<{ google_client_id: string }> => {
    const { data } = await apiClient.get<{ google_client_id: string }>('/auth/providers');
    return data;
  },
  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },
  updateMe: async (payload: UpdateMeInput): Promise<User> => {
    const { data } = await apiClient.patch<User>('/auth/me', payload);
    return data;
  },
};
