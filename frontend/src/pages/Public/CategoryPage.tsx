import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ChevronDown, Search, X } from 'lucide-react';
import clsx from 'clsx';

import { categoriesApi } from '@/api/categories';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { EmptyState } from '@/components/common/EmptyState';
import { HeroBackground } from '@/components/common/HeroBackground';
import { Pagination } from '@/components/common/Pagination';
import { ProductCard, ProductCardSkeleton } from '@/components/common/ProductCard';
import { SEO, breadcrumbSchema } from '@/components/common/SEO';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { ROUTES, SORT_OPTIONS, STORE_NAME } from '@/constants';
import { NotFoundPage } from '@/pages/Public/NotFoundPage';
import type { ProductSort } from '@/types';

const PAGE_SIZE = 12;
const isSort = (v: string | null): v is ProductSort => SORT_OPTIONS.some((o) => o.value === v);

export function CategoryPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [params, setParams] = useSearchParams();
  const activeSub = params.get('sub') ? Number(params.get('sub')) : null;
  const search = params.get('search') ?? '';
  const sortParam = params.get('sort');
  const sort: ProductSort = isSort(sortParam) ? sortParam : 'newest';
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [query, setQuery] = useState(search);
  useEffect(() => setQuery(search), [search]);

  const { data: category, isLoading: loadingCategory, isError } = useQuery({
    queryKey: ['categories', 'detail', slug],
    queryFn: () => categoriesApi.getBySlug(slug),
    enabled: !!slug,
    retry: false,
    staleTime: 5 * 60_000,
  });

  const { data: products, isLoading, isFetching } = useQuery({
    queryKey: ['products', 'category', slug, activeSub, search, sort, page],
    queryFn: () =>
      categoriesApi.getCategoryProducts(slug, {
        subcategory_id: activeSub ?? undefined,
        search: search || undefined,
        sort,
        page,
        page_size: PAGE_SIZE,
      }),
    enabled: !!slug && !isError,
    placeholderData: keepPreviousData,
  });

  const update = (changes: Record<string, string | null>, resetPage = true) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v === null || v === '' ? next.delete(k) : next.set(k, v)));
    if (resetPage) next.delete('page');
    setParams(next);
  };

  if (isError) {
    return <NotFoundPage title="Category not found" message="This category may have been renamed or removed." />;
  }

  const subcategories = category?.subcategories ?? [];
  const activeSubcategory = subcategories.find((s) => s.id === activeSub);
  const total = products?.total ?? 0;

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    update({ search: query.trim() || null });
  };

  return (
    <PublicLayout>
      <SEO
        title={category ? `${category.name} — Buy Online in Pakistan` : 'Category'}
        description={
          category?.description ||
          `Shop ${category?.name ?? 'our collection'} online at ${STORE_NAME} — premium quality, free delivery and cash on delivery across Pakistan.`
        }
        canonical={ROUTES.CATEGORY_PAGE(slug)}
        image={category?.image_url ?? undefined}
        noIndex={!!search}
        schema={category ? breadcrumbSchema([['Home', '/'], ['Products', ROUTES.PRODUCTS], [category.name, ROUTES.CATEGORY_PAGE(slug)]]) : undefined}
      />

      {/* Banner — uses the category image when one is uploaded */}
      <section className="relative overflow-hidden bg-navy">
        {category?.image_url && (
          <img src={category.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/40" />
        <HeroBackground />
        <div className="container-page relative py-10 sm:py-16">
          <Breadcrumbs
            tone="light"
            className="mb-4"
            items={[
              { label: 'Home', to: ROUTES.HOME },
              { label: 'Products', to: ROUTES.PRODUCTS },
              { label: category?.name ?? '…', to: activeSubcategory ? ROUTES.CATEGORY_PAGE(slug) : undefined },
              ...(activeSubcategory ? [{ label: activeSubcategory.name }] : []),
            ]}
          />
          {loadingCategory ? (
            <div className="h-12 w-64 animate-pulse rounded-xl bg-white/10" />
          ) : (
            <>
              <p className="eyebrow-light mb-2">{activeSubcategory ? category?.name : 'Collection'}</p>
              <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
                {activeSubcategory?.name ?? category?.name}
              </h1>
              {category?.description && !activeSubcategory && (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">{category.description}</p>
              )}
            </>
          )}
        </div>
      </section>

      {/* Subcategory chips — sits below the sticky header (64px / 72px) */}
      {subcategories.length > 0 && (
        <div className="sticky top-16 z-30 border-b border-navy/10 bg-white/95 backdrop-blur-md lg:top-[72px]">
          <div className="container-page">
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-3">
              {[{ id: null as number | null, name: `All ${category?.name ?? ''}` }, ...subcategories].map((sub) => {
                const active = activeSub === sub.id;
                return (
                  <button
                    key={sub.id ?? 'all'}
                    onClick={() => update({ sub: sub.id === null ? null : String(sub.id) })}
                    aria-pressed={active}
                    className={clsx(
                      'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                      active ? 'border-navy bg-navy text-white' : 'border-navy/15 bg-white text-navy-soft hover:border-navy/40 hover:text-navy'
                    )}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <section className="container-page py-8 sm:py-10">
        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <form onSubmit={submitSearch} role="search" className="relative sm:w-80">
            <label htmlFor="category-search" className="sr-only">Search in {category?.name}</label>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-soft/50" />
            <input
              id="category-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search in ${activeSubcategory?.name ?? category?.name ?? 'this category'}…`}
              enterKeyHint="search"
              className="field h-10 rounded-full py-0 pl-10 pr-10"
            />
            {search && (
              <button
                type="button"
                onClick={() => update({ search: null })}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-navy-soft hover:bg-cream-2"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </form>

          <div className="flex items-center justify-between gap-3 sm:ml-auto">
            <p className="text-sm text-navy-soft" aria-live="polite">
              {isLoading ? 'Loading…' : <><span className="font-semibold text-navy">{total}</span> {total === 1 ? 'product' : 'products'}</>}
            </p>
            <div className="relative">
              <label htmlFor="category-sort" className="sr-only">Sort by</label>
              <select
                id="category-sort"
                value={sort}
                onChange={(e) => update({ sort: e.target.value === 'newest' ? null : e.target.value })}
                className="h-10 cursor-pointer appearance-none rounded-full border border-navy/15 bg-white pl-4 pr-9 text-sm font-medium text-navy hover:border-navy/30 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-soft" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products && products.items.length > 0 ? (
          <>
            <div className={clsx('grid grid-cols-2 gap-3 transition-opacity sm:gap-5 md:grid-cols-3 lg:grid-cols-4', isFetching && 'opacity-60')}>
              {products.items.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 2} categoryName={activeSubcategory?.name ?? category?.name} />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={products.total_pages}
              onPageChange={(p) => {
                update({ page: p > 1 ? String(p) : null }, false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </>
        ) : (
          <EmptyState
            title={search ? 'No matching products' : 'Nothing here yet'}
            description={search ? `Nothing in this category matches “${search}”.` : 'New pieces are added regularly — check back soon.'}
            action={
              search || activeSub ? (
                <button onClick={() => update({ search: null, sub: null })} className="btn btn-primary btn-sm mt-2">
                  View all {category?.name}
                </button>
              ) : undefined
            }
          />
        )}
      </section>
    </PublicLayout>
  );
}
