import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, LayoutGrid, Search, SlidersHorizontal, Tag, X } from 'lucide-react';
import clsx from 'clsx';

import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { ProductCard, ProductCardSkeleton } from '@/components/common/ProductCard';
import { SEO, breadcrumbSchema } from '@/components/common/SEO';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { ROUTES, SORT_OPTIONS, resolveIcon } from '@/constants';
import { useCategories, useProducts } from '@/hooks/useCatalog';
import { useOverlay } from '@/hooks/useOverlay';
import type { CategoryWithCount, ProductSort } from '@/types';

const PAGE_SIZE = 12;

const isSort = (v: string | null): v is ProductSort => SORT_OPTIONS.some((o) => o.value === v);

interface FiltersProps {
  categories?: CategoryWithCount[];
  activeCategory: string;
  activeSub: number | null;
  dealsOnly: boolean;
  search: string;
  onCategory: (slug: string) => void;
  onSub: (id: number | null) => void;
  onDeals: (value: boolean) => void;
  onSearch: (q: string) => void;
}

function Filters({ categories, activeCategory, activeSub, dealsOnly, search, onCategory, onSub, onDeals, onSearch }: FiltersProps) {
  const [query, setQuery] = useState(search);
  useEffect(() => setQuery(search), [search]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  const rowClass = (active: boolean) =>
    clsx(
      'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors',
      active ? 'bg-navy text-white' : 'text-navy-soft hover:bg-cream hover:text-navy'
    );

  return (
    <div className="space-y-7">
      <form onSubmit={submit} role="search">
        <label htmlFor="filter-search" className="eyebrow mb-2.5 block">Search</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-soft/50" />
          <input
            id="filter-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            enterKeyHint="search"
            className="field pl-10"
          />
        </div>
      </form>

      <div>
        <p className="eyebrow mb-2.5">Offers</p>
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-navy/10 bg-white px-3 py-3 transition-colors hover:border-sale/40">
          <span className="flex items-center gap-2 text-sm font-medium text-navy">
            <Tag className="h-4 w-4 text-sale" /> On sale only
          </span>
          <input
            type="checkbox"
            checked={dealsOnly}
            onChange={(e) => onDeals(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded accent-[#c2410c]"
          />
        </label>
      </div>

      <div>
        <p className="eyebrow mb-2.5">Categories</p>
        <ul className="space-y-0.5">
          <li>
            <button onClick={() => onCategory('')} className={rowClass(!activeCategory)}>
              <LayoutGrid className="h-4 w-4 shrink-0" /> <span className="flex-1">All products</span>
            </button>
          </li>
          {categories?.map((cat) => {
            const Icon = resolveIcon(cat.icon);
            const isActive = activeCategory === cat.slug;
            const subs = cat.subcategories ?? [];
            return (
              <li key={cat.id}>
                <button onClick={() => onCategory(cat.slug)} className={rowClass(isActive && !activeSub)} aria-expanded={subs.length ? isActive : undefined}>
                  {cat.image_url ? (
                    <img src={cat.image_url} alt="" className="h-5 w-5 shrink-0 rounded-full object-cover" />
                  ) : (
                    <Icon className="h-4 w-4 shrink-0" />
                  )}
                  <span className="flex-1 truncate">{cat.name}</span>
                  <span className={clsx('text-xs', isActive && !activeSub ? 'text-white/60' : 'text-navy-soft/50')}>{cat.product_count}</span>
                  {subs.length > 0 && <ChevronDown className={clsx('h-3.5 w-3.5 transition-transform', isActive && 'rotate-180')} />}
                </button>
                {isActive && subs.length > 0 && (
                  <ul className="ml-5 mt-1 space-y-0.5 border-l border-navy/10 pl-3">
                    {subs.map((sub) => (
                      <li key={sub.id}>
                        <button
                          onClick={() => onSub(activeSub === sub.id ? null : sub.id)}
                          className={clsx(
                            'w-full rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors',
                            activeSub === sub.id ? 'bg-gold/15 font-semibold text-navy' : 'text-navy-soft hover:bg-cream hover:text-navy'
                          )}
                        >
                          {sub.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const activeCategory = params.get('category') ?? '';
  const activeSub = params.get('sub') ? Number(params.get('sub')) : null;
  const search = params.get('search') ?? '';
  const dealsOnly = params.has('deals');
  const sortParam = params.get('sort');
  const sort: ProductSort = isSort(sortParam) ? sortParam : 'newest';
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [filtersOpen, setFiltersOpen] = useState(false);
  useOverlay(filtersOpen, () => setFiltersOpen(false));

  const { data: categories } = useCategories();
  const { data: products, isLoading, isFetching } = useProducts({
    category_slug: activeCategory || undefined,
    subcategory_id: activeSub ?? undefined,
    search: search || undefined,
    on_sale: dealsOnly || undefined,
    sort,
    page,
    page_size: PAGE_SIZE,
  });

  const category = useMemo(() => categories?.find((c) => c.slug === activeCategory), [categories, activeCategory]);
  const subcategory = category?.subcategories?.find((s) => s.id === activeSub);

  /** Update the URL; any filter change resets to page 1. */
  const update = (changes: Record<string, string | null>, { resetPage = true, closeFilters = false } = {}) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v === null || v === '' ? next.delete(k) : next.set(k, v)));
    if (resetPage) next.delete('page');
    setParams(next);
    if (closeFilters) setFiltersOpen(false);
  };

  const onCategory = (slug: string) =>
    update({ category: slug === activeCategory ? null : slug, sub: null }, { closeFilters: !slug || !categories?.find((c) => c.slug === slug)?.subcategories?.length });
  const onSub = (id: number | null) => update({ sub: id === null ? null : String(id) }, { closeFilters: true });
  const onDeals = (value: boolean) => update({ deals: value ? '1' : null });
  const onSearch = (q: string) => update({ search: q || null }, { closeFilters: true });
  const clearAll = () => {
    setParams(new URLSearchParams());
    setFiltersOpen(false);
  };
  const goToPage = (p: number) => {
    update({ page: p > 1 ? String(p) : null }, { resetPage: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const title = subcategory?.name ?? category?.name ?? (dealsOnly ? 'Deals & offers' : search ? `Results for “${search}”` : 'All products');
  const activeChips = [
    category && { label: category.name, clear: () => update({ category: null, sub: null }) },
    subcategory && { label: subcategory.name, clear: () => update({ sub: null }) },
    dealsOnly && { label: 'On sale', clear: () => onDeals(false) },
    search && { label: `“${search}”`, clear: () => onSearch('') },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const filterProps: FiltersProps = { categories, activeCategory, activeSub, dealsOnly, search, onCategory, onSub, onDeals, onSearch };
  const total = products?.total ?? 0;

  return (
    <PublicLayout>
      <SEO
        title={category ? `${category.name} — Shop Online in Pakistan` : dealsOnly ? 'Deals & Offers' : 'Shop All Products'}
        description={
          category?.description ||
          `Shop ${category?.name ?? 'cosmetics, skin care, jewellery, apparel and baby essentials'} online at OQIRA — free delivery and cash on delivery across Pakistan.`
        }
        canonical={category ? ROUTES.CATEGORY_PAGE(category.slug) : ROUTES.PRODUCTS}
        noIndex={!!search}
        schema={breadcrumbSchema([['Home', '/'], ['Products', ROUTES.PRODUCTS], ...(category ? [[category.name, ROUTES.CATEGORY_PAGE(category.slug)] as [string, string]] : [])])}
      />

      <PageHeader
        title={title}
        eyebrow={dealsOnly ? 'Limited-time offers' : 'The collection'}
        description={
          category?.description ||
          (dealsOnly ? 'Selected favourites at reduced prices — while stocks last.' : 'Premium cosmetics, jewellery, apparel and baby essentials, delivered nationwide.')
        }
        breadcrumbs={[
          { label: 'Home', to: ROUTES.HOME },
          { label: 'Products', to: ROUTES.PRODUCTS },
          ...(category ? [{ label: category.name, to: `${ROUTES.PRODUCTS}?category=${category.slug}` }] : []),
          ...(subcategory ? [{ label: subcategory.name }] : []),
        ]}
      />

      <div className="container-page py-8 sm:py-10">
        <div className="flex items-start gap-10">
          {/* Desktop sidebar */}
          <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] w-64 shrink-0 overflow-y-auto pb-6 pr-1 scrollbar-thin lg:block" aria-label="Filters">
            <Filters {...filterProps} />
            {activeChips.length > 0 && (
              <button onClick={clearAll} className="btn btn-outline btn-sm mt-6 w-full">Clear all filters</button>
            )}
          </aside>

          <div className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <button onClick={() => setFiltersOpen(true)} className="btn btn-outline btn-sm lg:hidden">
                <SlidersHorizontal className="h-4 w-4" /> Filters
                {activeChips.length > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-navy px-1.5 text-[10px] text-white">{activeChips.length}</span>
                )}
              </button>

              <p className="text-sm text-navy-soft" aria-live="polite">
                {isLoading ? 'Loading…' : <><span className="font-semibold text-navy">{total}</span> {total === 1 ? 'product' : 'products'}</>}
              </p>

              <div className="ml-auto flex items-center gap-2">
                <label htmlFor="sort" className="hidden text-sm text-navy-soft sm:block">Sort by</label>
                <div className="relative">
                  <select
                    id="sort"
                    value={sort}
                    onChange={(e) => update({ sort: e.target.value === 'newest' ? null : e.target.value })}
                    className="h-9 cursor-pointer appearance-none rounded-full border border-navy/15 bg-white pl-4 pr-9 text-sm font-medium text-navy transition-colors hover:border-navy/30 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
                  >
                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-soft" />
                </div>
              </div>

              {activeChips.length > 0 && (
                <ul className="flex w-full flex-wrap gap-2">
                  {activeChips.map((chip) => (
                    <li key={chip.label}>
                      <button
                        onClick={chip.clear}
                        className="flex items-center gap-1.5 rounded-full bg-cream-2 py-1.5 pl-3 pr-2 text-xs font-medium text-navy transition-colors hover:bg-cream-3"
                        aria-label={`Remove filter ${chip.label}`}
                      >
                        {chip.label} <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                  <li>
                    <button onClick={clearAll} className="px-2 py-1.5 text-xs font-semibold text-pink-deep underline-offset-4 hover:underline">Clear all</button>
                  </li>
                </ul>
              )}
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 2xl:grid-cols-4">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : products && products.items.length > 0 ? (
              <>
                <div className={clsx('grid grid-cols-2 gap-3 transition-opacity sm:gap-5 md:grid-cols-3 2xl:grid-cols-4', isFetching && 'opacity-60')}>
                  {products.items.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      priority={i < 2}
                      categoryName={categories?.find((c) => c.id === product.category_id)?.name}
                    />
                  ))}
                </div>
                <Pagination page={page} totalPages={products.total_pages} onPageChange={goToPage} />
              </>
            ) : (
              <EmptyState
                title="No products found"
                description={search ? `Nothing matches “${search}”. Try another word or clear your filters.` : 'Try a different category or clear your filters.'}
                action={activeChips.length > 0 ? <button onClick={clearAll} className="btn btn-primary btn-sm mt-2">Clear filters</button> : undefined}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
      {filtersOpen &&
        createPortal(
          <div className="fixed inset-0 z-[90] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
            <div className="absolute inset-0 animate-fade-in bg-navy/50 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
            <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm animate-slide-in-left flex-col bg-white shadow-lift">
              <div className="flex h-16 items-center justify-between border-b border-navy/10 px-5">
                <p className="font-display text-xl">Filters</p>
                <button className="icon-btn -mr-2" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <Filters {...filterProps} />
              </div>
              <div className="pb-safe flex gap-3 border-t border-navy/10 p-4">
                <button onClick={clearAll} className="btn btn-outline flex-1">Clear</button>
                <button onClick={() => setFiltersOpen(false)} className="btn btn-primary flex-[2]">
                  Show {total} {total === 1 ? 'result' : 'results'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </PublicLayout>
  );
}
