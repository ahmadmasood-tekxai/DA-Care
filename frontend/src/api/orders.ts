import { apiClient } from '@/api/client';
import type { Order, OrderCreateInput, OrderStatus, PaymentStatus, BankDetailsOut } from '@/types';

export const ordersApi = {
  create: async (payload: OrderCreateInput): Promise<Order> => {
    const { data } = await apiClient.post<Order>('/orders', payload);
    return data;
  },
  list: async (status?: OrderStatus, payment_status?: PaymentStatus): Promise<Order[]> => {
    const { data } = await apiClient.get<Order[]>('/orders', { params: { status, payment_status } });
    return data;
  },
  updateStatus: async (id: number, status: OrderStatus): Promise<Order> => {
    const { data } = await apiClient.patch<Order>(`/orders/${id}/status`, { status });
    return data;
  },
  getBankDetails: async (): Promise<BankDetailsOut> => {
    const { data } = await apiClient.get<BankDetailsOut>('/orders/bank-details');
    return data;
  },
  markTransferred: async (id: number, transactionRef?: string, receipt?: File): Promise<Order> => {
    const formData = new FormData();
    if (transactionRef) formData.append('transaction_ref', transactionRef);
    if (receipt) formData.append('receipt', receipt);
    const { data } = await apiClient.post<Order>(`/orders/${id}/mark-transferred`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  verifyPayment: async (id: number, action: 'confirm' | 'reject', reason?: string): Promise<Order> => {
    const { data } = await apiClient.post<Order>(`/orders/${id}/verify-payment`, {
      action,
      rejection_reason: reason,
    });
    return data;
  },
};
