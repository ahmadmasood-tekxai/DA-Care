import { apiClient } from '@/api/client';
import type { Order, OrderCreateInput, OrderStatus } from '@/types';

export const ordersApi = {
  create: async (payload: OrderCreateInput): Promise<Order> => {
    const { data } = await apiClient.post<Order>('/orders', payload);
    return data;
  },
  list: async (status?: OrderStatus): Promise<Order[]> => {
    const { data } = await apiClient.get<Order[]>('/orders', { params: { status } });
    return data;
  },
  updateStatus: async (id: number, status: OrderStatus): Promise<Order> => {
    const { data } = await apiClient.patch<Order>(`/orders/${id}/status`, { status });
    return data;
  },
};
