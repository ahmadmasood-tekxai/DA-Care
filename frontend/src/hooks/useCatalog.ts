import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { categoriesApi } from '@/api/categories';
import { productsApi } from '@/api/products';
import { ProductBadge, type ListProductsParams } from '@/types';

/**
 * Storefront data hooks. Query keys keep the `['categories']` / `['products', …]`
 * prefixes the admin screens invalidate, so edits there refresh the shop too.
 */

const FIVE_MINUTES = 5 * 60_000;

/** Shared storefront queries — reused across components so they share one cache entry. */
export const STOREFRONT_QUERIES = {
  deals: { on_sale: true, sort: 'discount', page_size: 10 },
  bestsellers: { badge: ProductBadge.BESTSELLER, page_size: 10 },
  newArrivals: { badge: ProductBadge.NEW, page_size: 10 },
} satisfies Record<string, ListProductsParams>;

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list, staleTime: FIVE_MINUTES });
}

export function useProducts(params: ListProductsParams, { enabled = true } = {}) {
  return useQuery({
    queryKey: ['products', 'list', params],
    queryFn: () => productsApi.list(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    enabled,
  });
}

export function useProduct(slug?: string) {
  return useQuery({
    queryKey: ['products', 'detail', slug],
    queryFn: () => productsApi.getBySlug(slug!),
    enabled: !!slug,
    retry: (count, error) => (error as { response?: { status?: number } })?.response?.status !== 404 && count < 1,
  });
}
