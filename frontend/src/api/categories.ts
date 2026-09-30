import { apiClient } from '@/api/client';
import type {
  Category,
  CategoryCreateInput,
  CategoryUpdateInput,
  CategoryWithCount,
  PaginatedResponse,
  Product,
} from '@/types';

export const categoriesApi = {
  list: async (): Promise<CategoryWithCount[]> => {
    const { data } = await apiClient.get<CategoryWithCount[]>('/categories');
    return data;
  },
  listAll: async (): Promise<CategoryWithCount[]> => {
    // Returns all categories including subcategories flat
    const { data } = await apiClient.get<CategoryWithCount[]>('/categories', { params: { parent_only: false } });
    return data;
  },
  getBySlug: async (slug: string): Promise<CategoryWithCount> => {
    const { data } = await apiClient.get<CategoryWithCount>(`/categories/${slug}`);
    return data;
  },
  getCategoryProducts: async (
    slug: string,
    params: { search?: string; subcategory_id?: number; page?: number; page_size?: number } = {}
  ): Promise<PaginatedResponse<Product>> => {
    const { data } = await apiClient.get<PaginatedResponse<Product>>(`/categories/${slug}/products`, { params });
    return data;
  },
  create: async (payload: CategoryCreateInput): Promise<Category> => {
    const { data } = await apiClient.post<Category>('/categories', payload);
    return data;
  },
  update: async (id: number, payload: CategoryUpdateInput): Promise<Category> => {
    const { data } = await apiClient.patch<Category>(`/categories/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
  uploadImage: async (id: number, file: File): Promise<Category> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<Category>(`/categories/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
