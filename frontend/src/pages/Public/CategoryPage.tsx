import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, LayoutGrid, Search, SlidersHorizontal, X } from 'lucide-react';

import { categoriesApi } from '@/api/categories';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { ProductCard } from '@/components/common/ProductCard';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { HeroBackground } from '@/components/common/HeroBackground';
import { SEO } from '@/components/common/SEO';
import { resolveIcon, ROUTES } from '@/constants';

const PAGE_SIZE = 12;

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  const { data: category, isLoading: isCategoryLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoriesApi.getBySlug(slug!),
    enabled: !!slug,
  });

  const { data: products, isLoading: isProductsLoading } = useQuery({
    queryKey: ['category-products', slug, activeSubcategoryId, search, page],
    queryFn: () =>
      categoriesApi.getCategoryProducts(slug!, {
        subcategory_id: activeSubcategoryId ?? undefined,
        search: search || undefined,
        page,
        page_size: PAGE_SIZE,
      }),
    enabled: !!slug,
  });

  function handleSubcategoryClick(id: number | null) {
    setActiveSubcategoryId(id);
    setPage(1);
    setSearch('');
    setSearchInput('');
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function handleClearSearch() {
    setSearch('');
    setSearchInput('');
    setPage(1);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const hasSubcategories = (category?.subcategories?.length ?? 0) > 0;
  const activeSubcategory = category?.subcategories?.find(s => s.id === activeSubcategoryId);
  const CategoryIcon = resolveIcon(category?.icon ?? 'Shirt');
  const totalPages = products?.total_pages ?? 1;

  const pageTitle = activeSubcategory
    ? `${activeSubcategory.name} — ${category?.name}`
    : category?.name ?? 'Category';

  return (
    <PublicLayout>
      <SEO
        title={`${pageTitle} — Shop Online | OQIRA`}
        description={
          category?.description
            ? category.description
            : `Shop ${category?.name ?? ''} at OQIRA — premium quality, fast delivery, COD available across Pakistan.`
        }
        keywords={`OQIRA, ${category?.name ?? ''}, ${activeSubcategory?.name ?? ''}, online shopping Pakistan, buy online Pakistan, COD Pakistan`}
        url={`https://okira.vercel.app/categories/${slug}`}
      />

      {/* ─── Hero Banner ─── */}
      <section className="relative overflow-hidden bg-navy px-6 pb-16 pt-28 text-center">
        <HeroBackground />
        <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_50%_0%,_#D1D0D0_0%,_transparent_60%)]" />

        <div className="relative z-10">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center justify-center gap-2 text-xs text-cream/50">
            <Link to={ROUTES.HOME} className="hover:text-cream transition-colors">Home</Link>
            <span>/</span>
            <Link to={ROUTES.PRODUCTS} className="hover:text-cream transition-colors">Products</Link>
            <span>/</span>
            <span className="text-cream/80">{category?.name ?? '...'}</span>
            {activeSubcategory && (
              <>
                <span>/</span>
                <span className="text-gold">{activeSubcategory.name}</span>
              </>
            )}
          </div>

          {/* Icon + Title */}
          <div className="mb-3 flex justify-center">
            {category?.image_url ? (
              <img
                src={category.image_url}
                alt={category.name}
                className="h-16 w-16 rounded-2xl object-cover border-2 border-white/20 shadow-xl"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 border border-white/15 shadow-xl">
                <CategoryIcon className="h-8 w-8 text-white" />
              </div>
            )}
          </div>

          <span className="section-tag animate-fade-in-up">
            {activeSubcategory ? activeSubcategory.name : 'Category'}
          </span>
          <h1 className="mt-2 text-4xl font-display font-semibold tracking-tight text-white sm:text-5xl animate-fade-in-up" style={{ animationDelay: '80ms' }}>
            {activeSubcategory ? activeSubcategory.name : (category?.name ?? (isCategoryLoading ? '...' : 'Category'))}
          </h1>
          {category?.description && !activeSubcategory && (
            <p className="mx-auto mt-4 max-w-md text-sm font-light text-cream/70 animate-fade-in-up" style={{ animationDelay: '160ms' }}>
              {category.description}
            </p>
          )}
          {products && (
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2 text-xs font-bold uppercase tracking-widest text-gold backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '240ms' }}>
              {products.total} product{products.total !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </section>

      {/* ─── Subcategory Filter Tabs ─── */}
      {hasSubcategories && (
        <div className="sticky top-[64px] z-30 border-b border-navy/10 bg-white/95 backdrop-blur-md shadow-sm">
          <div className="mx-auto max-w-6xl px-6">
            {/* Label row */}
            <div className="flex items-center gap-2 pt-3 pb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-navy/30">Subcategories</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
              {/* "All" tab */}
              <button
                onClick={() => handleSubcategoryClick(null)}
                className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 ${activeSubcategoryId === null
                  ? 'bg-navy text-white shadow-md shadow-navy/25 scale-[1.02]'
                  : 'bg-navy/5 text-navy-soft hover:bg-navy/10 hover:text-navy'
                  }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                All {category?.name}
                {products && activeSubcategoryId === null && (
                  <span className="ml-0.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-extrabold">
                    {products.total}
                  </span>
                )}
              </button>

              {category?.subcategories?.map((sub) => {
                const SubIcon = resolveIcon(sub.icon);
                const isActive = activeSubcategoryId === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => handleSubcategoryClick(sub.id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 ${isActive
                      ? 'bg-pink-deep text-white shadow-md shadow-pink-deep/25 scale-[1.02]'
                      : 'bg-pink-pale/30 text-pink-deep/80 border border-pink-deep/10 hover:bg-pink-pale hover:text-pink-deep hover:border-pink-deep/30'
                      }`}
                  >
                    {sub.image_url ? (
                      <img src={sub.image_url} alt={sub.name} className="h-3.5 w-3.5 rounded-full object-cover" />
                    ) : (
                      <SubIcon className="h-3.5 w-3.5" />
                    )}
                    {sub.name}
                    {isActive && products && (
                      <span className="ml-0.5 rounded-full bg-white/25 px-1.5 py-0.5 text-[9px] font-extrabold">
                        {products.total}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── Products Section ─── */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-6xl">

          {/* Search + Filter bar */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-soft" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={`Search in ${activeSubcategory?.name ?? category?.name ?? 'category'}…`}
                  className="w-full rounded-full border border-navy/15 bg-white py-2.5 pl-10 pr-10 text-sm focus:border-pink-deep focus:outline-none focus:ring-2 focus:ring-pink-deep/30 sm:w-64"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-soft hover:text-navy"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-full bg-navy px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-pink-deep"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Search
              </button>
            </form>

            {/* Active filter indicator */}
            {(search || activeSubcategoryId) && (
              <div className="flex flex-wrap items-center gap-2">
                {search && (
                  <span className="flex items-center gap-1.5 rounded-full bg-navy/10 px-3 py-1.5 text-xs font-semibold text-navy">
                    "{search}"
                    <button onClick={handleClearSearch} className="text-navy-soft hover:text-rose-600">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {activeSubcategory && (() => {
                  const SubIcon = resolveIcon(activeSubcategory.icon);
                  return (
                    <span className="flex items-center gap-1.5 rounded-full bg-pink-pale px-3 py-1.5 text-xs font-semibold text-pink-deep">
                      {activeSubcategory.image_url ? (
                        <img src={activeSubcategory.image_url} alt={activeSubcategory.name} className="h-3 w-3 rounded-full object-cover" />
                      ) : (
                        <SubIcon className="h-3 w-3" />
                      )}
                      {activeSubcategory.name}
                      <button onClick={() => handleSubcategoryClick(null)} className="hover:text-rose-600">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })()}
              </div>
            )}

            {/* Results count */}
            {!isProductsLoading && products && products.total > 0 && (
              <p className="text-xs text-navy-soft sm:text-right">
                <span className="font-semibold text-navy">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, products.total)}
                </span>{' '}
                of <span className="font-semibold text-navy">{products.total}</span> products
              </p>
            )}
          </div>

          {/* Product Grid */}
          {isProductsLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-3xl border border-navy/10 bg-white">
                  <div className="aspect-square w-full bg-slate-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 w-3/4 rounded bg-slate-200" />
                    <div className="h-4 w-full rounded bg-slate-200" />
                    <div className="mt-4 flex items-center justify-between">
                      <div className="h-6 w-1/3 rounded bg-slate-200" />
                      <div className="h-9 w-20 rounded-full bg-slate-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products && products.items.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.items.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    categoryName={activeSubcategory?.name ?? category?.name}
                  />
                ))}
              </div>

              <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          ) : (
            <EmptyState
              title={search ? 'No products match your search' : 'No products here yet'}
              description={
                search
                  ? `Try a different keyword or clear the search.`
                  : activeSubcategory
                    ? `No products in "${activeSubcategory.name}" yet.`
                    : `No products in "${category?.name}" yet.`
              }
              action={(search || activeSubcategoryId) ? (
                <button
                  onClick={() => { handleClearSearch(); setActiveSubcategoryId(null); }}
                  className="mt-4 rounded-full bg-navy px-6 py-2.5 text-sm font-bold text-white hover:bg-pink-deep transition-colors"
                >
                  <ArrowLeft className="mr-1.5 inline h-4 w-4" />
                  View all products
                </button>
              ) : undefined}
            />
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
