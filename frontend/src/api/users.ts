import { apiClient } from '@/api/client';
import type { AdminUser, EmailStatus, MessageResponse, StaffCreateInput, UserRole } from '@/types';

export const usersApi = {
  list: async (params?: { role?: UserRole; search?: string }): Promise<AdminUser[]> => {
    const { data } = await apiClient.get<AdminUser[]>('/users', { params });
    return data;
  },
  createStaff: async (payload: StaffCreateInput): Promise<AdminUser> => {
    const { data } = await apiClient.post<AdminUser>('/users', payload);
    return data;
  },
  update: async (id: number, payload: { is_active?: boolean; role?: UserRole }): Promise<AdminUser> => {
    const { data } = await apiClient.patch<AdminUser>(`/users/${id}`, payload);
    return data;
  },
};

export const emailApi = {
  status: async (): Promise<EmailStatus> => {
    const { data } = await apiClient.get<EmailStatus>('/email/status');
    return data;
  },
  sendTest: async (to?: string): Promise<MessageResponse> => {
    const { data } = await apiClient.post<MessageResponse>('/email/test', { to: to || null });
    return data;
  },
};
