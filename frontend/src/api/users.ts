import { apiClient } from '@/api/client';
import type { User } from '@/types';

export const usersApi = {
  listUsers: async () => {
    const { data } = await apiClient.get<User[]>('/users');
    return data;
  },

  updateStatus: async (userId: number, isActive: boolean) => {
    const { data } = await apiClient.patch<User>(`/users/${userId}/status`, { is_active: isActive });
    return data;
  },
};
