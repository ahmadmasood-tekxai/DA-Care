import { apiClient } from '@/api/client';
import type {
  ListProductsParams,
  PaginatedResponse,
  Product,
  ProductCreateInput,
  ProductDetail,
  ProductUpdateInput,
} from '@/types';

export const productsApi = {
  list: async (params: ListProductsParams = {}): Promise<PaginatedResponse<Product>> => {
    const { data } = await apiClient.get<PaginatedResponse<Product>>('/products', { params });
    return data;
  },
  getBySlug: async (slug: string): Promise<ProductDetail> => {
    const { data } = await apiClient.get<ProductDetail>(`/products/${slug}`);
    return data;
  },
  create: async (payload: ProductCreateInput): Promise<Product> => {
    const { data } = await apiClient.post<Product>('/products', payload);
    return data;
  },
  update: async (id: number, payload: ProductUpdateInput): Promise<Product> => {
    const { data } = await apiClient.patch<Product>(`/products/${id}`, payload);
    return data;
  },
  uploadImage: async (id: number, file: File): Promise<Product> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<Product>(`/products/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  uploadImages: async (id: number, files: File[]): Promise<Product> => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    const { data } = await apiClient.post<Product>(`/products/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};
