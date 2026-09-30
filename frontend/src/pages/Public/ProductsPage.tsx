import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, Search, X, ChevronRight, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';

import { categoriesApi } from '@/api/categories';
import { productsApi } from '@/api/products';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { ProductCard } from '@/components/common/ProductCard';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { HeroBackground } from '@/components/common/HeroBackground';
import { resolveIcon, ROUTES } from '@/constants';
import { SEO } from '@/components/common/SEO';

const PAGE_SIZE = 12;

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const activeSubcategoryId = searchParams.get('sub') ? Number(searchParams.get('sub')) : null;
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string>(activeCategory);

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', activeCategory, activeSubcategoryId, search, page],
    queryFn: () =>
      productsApi.list({
        category_slug: activeCategory || undefined,
        subcategory_id: activeSubcategoryId ?? undefined,
        search: search || undefined,
        page,
        page_size: PAGE_SIZE,
      }),
  });

  const activeCategoryObj = useMemo(
    () => categories?.find((c) => c.slug === activeCategory),
    [categories, activeCategory]
  );
  const activeCategoryName = activeCategoryObj?.name;
  const subcategories = activeCategoryObj?.subcategories ?? [];

  const activeSubcategoryObj = useMemo(
    () => subcategories.find((s) => s.id === activeSubcategoryId),
    [subcategories, activeSubcategoryId]
  );

  function selectCategory(slug: string) {
    const next = new URLSearchParams(searchParams);
    if (slug === activeCategory) {
      next.delete('category');
      setExpandedCat('');
    } else {
      next.set('category', slug);
      setExpandedCat(slug);
    }
    next.delete('sub');
    setPage(1);
    setSearch('');
    setSearchInput('');
    setSearchParams(next);
  }

  function selectSubcategory(id: number | null) {
    const next = new URLSearchParams(searchParams);
    if (id === null || id === activeSubcategoryId) {
      next.delete('sub');
    } else {
      next.set('sub', String(id));
    }
    setPage(1);
    setSearch('');
    setSearchInput('');
    setSearchParams(next);
    setSidebarOpen(false);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function clearAll() {
    const next = new URLSearchParams();
    setSearch('');
    setSearchInput('');
    setPage(1);
    setExpandedCat('');
    setSearchParams(next);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const totalPages = products?.total_pages ?? 1;
  const hasActiveFilters = activeCategory || activeSubcategoryId || search;

  return (
    <PublicLayout>
      <SEO
        title={activeCategoryName ? `${activeCategoryName} — Buy Online in Pakistan` : 'Shop All Products — Cosmetics, Jewellery, Suits & Baby Clothes'}
        description={activeCategoryName
          ? `OQIRA par ${activeCategoryName} khareeden — premium quality, fast delivery, COD available.`
          : 'OQIRA par shop karein — cosmetics, skin care, jewellery, luxury suits, baby garments. Cash on delivery + bank transfer.'}
        keywords={`OQIRA, ${activeCategoryName ? activeCategoryName + ' Pakistan, ' : ''}online shopping Pakistan`}
        url={`https://okira.vercel.app/products${activeCategory ? '?category=' + activeCategory : ''}`}
      />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-navy px-6 pb-12 pt-28 text-center">
        <HeroBackground />
        <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_50%_0%,_#D1D0D0_0%,_transparent_60%)]" />
        <div className="relative z-10">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center justify-center gap-1.5 text-xs text-cream/50">
            <Link to={ROUTES.HOME} className="hover:text-cream transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className={activeCategoryName ? 'hover:text-cream cursor-pointer' : 'text-cream/80'} onClick={() => selectCategory('')}>
              All Products
            </span>
            {activeCategoryName && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="text-gold font-semibold">{activeCategoryName}</span>
              </>
            )}
            {activeSubcategoryObj && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="text-gold/80">{activeSubcategoryObj.name}</span>
              </>
            )}
          </nav>

          <span className="section-tag animate-fade-in-up">The Collection</span>
          <h1 className="mt-3 text-4xl font-display font-semibold tracking-tight text-white sm:text-5xl animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            {activeSubcategoryObj?.name ?? activeCategoryName ?? 'All Products'}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm font-light text-cream/70 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            {activeCategoryName
              ? `Browse our full range of ${activeCategoryName}${activeSubcategoryObj ? ` › ${activeSubcategoryObj.name}` : ''} — premium quality.`
              : 'Cosmetics · Jewellery · Suits · Baby Clothes — premium quality, nationwide delivery.'}
          </p>
          {products && (
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              {products.total} products
            </span>
          )}
        </div>
      </section>

      {/* ── MAIN LAYOUT: sidebar + products ── */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex gap-8 items-start">

          {/* ── SIDEBAR FILTER ── */}
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-navy/50 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <aside className={`
            fixed inset-y-0 left-0 z-50 rounded-lg w-72 overflow-y-auto bg-white shadow-2xl transition-transform duration-300 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:z-auto lg:w-64 lg:shrink-0 lg:translate-x-0 lg:shadow-none lg:overflow-y-auto
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            {/* Sidebar header (mobile) */}
            <div className="flex items-center justify-between border-b border-navy/10 p-5 lg:hidden">
              <span className="font-display text-base font-bold text-navy">Filters</span>
              <button onClick={() => setSidebarOpen(false)} className="text-navy-soft hover:text-navy">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 lg:p-3   ">
              {/* Search */}
              <div className="mb-6">
                <p className="mb-2.5 text-[11px] font-black uppercase tracking-widest text-navy/40">Search</p>
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-navy-soft" />
                    <input
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search products…"
                      className="w-full rounded-xl border border-navy/15 bg-cream/60 py-2 pl-9 pr-3 text-sm focus:border-pink-deep focus:outline-none focus:ring-2 focus:ring-pink-deep/20"
                    />
                  </div>
                  <button type="submit" className="rounded-xl bg-navy px-3 py-2 text-xs font-bold text-white hover:bg-pink-deep transition-colors">
                    Go
                  </button>
                </form>
                {search && (
                  <button onClick={() => { setSearch(''); setSearchInput(''); }} className="mt-1.5 flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-700">
                    <X className="h-3 w-3" /> Clear search
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-6">
                <p className="mb-2.5 text-[11px] font-black uppercase tracking-widest text-navy/40">Categories</p>
                <div className="space-y-0.5">
                  {/* All */}
                  <button
                    onClick={() => selectCategory('')}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 ${!activeCategory
                      ? 'bg-navy text-white shadow-sm'
                      : 'text-navy-soft hover:bg-cream hover:text-navy'
                      }`}
                  >
                    <LayoutGrid className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">All Products</span>
                    {products && !activeCategory && (
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-extrabold">{products.total}</span>
                    )}
                  </button>

                  {categories?.map((cat) => {
                    const Icon = resolveIcon(cat.icon);
                    const isCatActive = activeCategory === cat.slug;
                    const isExpanded = expandedCat === cat.slug;
                    const hasSubcats = (cat.subcategories?.length ?? 0) > 0;

                    return (
                      <div key={cat.id}>
                        <button
                          onClick={() => {
                            if (hasSubcats && !isCatActive) {
                              setExpandedCat(isExpanded ? '' : cat.slug);
                            }
                            selectCategory(cat.slug);
                          }}
                          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 ${isCatActive
                            ? 'bg-pink-deep text-white shadow-sm'
                            : 'text-navy-soft hover:bg-pink-pale/40 hover:text-navy'
                            }`}
                        >
                          {cat.image_url ? (
                            <img src={cat.image_url} alt={cat.name} className="h-4 w-4 shrink-0 rounded-full object-cover" />
                          ) : (
                            <Icon className="h-4 w-4 shrink-0" />
                          )}
                          <span className="flex-1 text-left">{cat.name}</span>
                          {isCatActive && cat.product_count > 0 && (
                            <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-extrabold">{cat.product_count}</span>
                          )}
                          {hasSubcats && (
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''} ${isCatActive ? 'text-white/70' : 'text-navy/30'}`} />
                          )}
                        </button>

                        {/* Subcategories accordion */}
                        {hasSubcats && isExpanded && (
                          <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-pink-deep/20 pl-3">
                            <button
                              onClick={() => selectSubcategory(null)}
                              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all ${activeSubcategoryId === null && isCatActive
                                ? 'bg-navy/10 text-navy font-bold'
                                : 'text-navy-soft hover:bg-navy/5 hover:text-navy'
                                }`}
                            >
                              <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
                              All {cat.name}
                            </button>
                            {cat.subcategories?.map((sub) => {
                              const SubIcon = resolveIcon(sub.icon);
                              const isSubActive = activeSubcategoryId === sub.id;
                              return (
                                <button
                                  key={sub.id}
                                  onClick={() => selectSubcategory(sub.id)}
                                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all ${isSubActive
                                    ? 'bg-pink-deep/10 text-pink-deep font-bold'
                                    : 'text-navy-soft hover:bg-pink-pale/40 hover:text-pink-deep'
                                    }`}
                                >
                                  {sub.image_url ? (
                                    <img src={sub.image_url} alt={sub.name} className="h-3.5 w-3.5 rounded-full object-cover" />
                                  ) : (
                                    <SubIcon className="h-3.5 w-3.5 shrink-0" />
                                  )}
                                  {sub.name}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Clear all */}
              {hasActiveFilters && (
                <button
                  onClick={clearAll}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors"
                >
                  <X className="h-3.5 w-3.5" /> Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* ── PRODUCT AREA ── */}
          <div className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-xs font-bold text-navy shadow-sm hover:bg-cream transition-colors lg:hidden"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                  {hasActiveFilters && <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-pink-deep text-[9px] font-extrabold text-white">!</span>}
                </button>

                {/* Active filter pills */}
                <div className="flex flex-wrap items-center gap-2">
                  {activeCategoryName && (
                    <span className="flex items-center gap-1.5 rounded-full bg-pink-deep/10 px-3 py-1 text-[11px] font-bold text-pink-deep">
                      {activeCategoryName}
                      <button onClick={() => selectCategory('')} className="hover:text-rose-600"><X className="h-3 w-3" /></button>
                    </span>
                  )}
                  {activeSubcategoryObj && (
                    <span className="flex items-center gap-1.5 rounded-full bg-navy/10 px-3 py-1 text-[11px] font-bold text-navy">
                      {activeSubcategoryObj.name}
                      <button onClick={() => selectSubcategory(null)} className="hover:text-rose-600"><X className="h-3 w-3" /></button>
                    </span>
                  )}
                  {search && (
                    <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-800">
                      "{search}"
                      <button onClick={() => { setSearch(''); setSearchInput(''); }} className="hover:text-rose-600"><X className="h-3 w-3" /></button>
                    </span>
                  )}
                </div>
              </div>

              {/* Result count */}
              {!isLoading && products && products.total > 0 && (
                <p className="shrink-0 text-xs text-navy-soft">
                  <span className="font-semibold text-navy">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, products.total)}</span>
                  {' '}of{' '}
                  <span className="font-semibold text-navy">{products.total}</span>
                </p>
              )}
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-navy/10 bg-white">
                    <div className="aspect-[4/5] w-full bg-slate-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 w-1/3 rounded-full bg-slate-200" />
                      <div className="h-4 w-3/4 rounded bg-slate-200" />
                      <div className="h-3 w-full rounded bg-slate-200" />
                      <div className="mt-3 flex items-center justify-between">
                        <div className="h-5 w-1/3 rounded bg-slate-200" />
                        <div className="h-7 w-16 rounded-full bg-slate-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products && products.items.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                  {products.items.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      categoryName={activeSubcategoryObj?.name ?? activeCategoryName ?? categories?.find(c => c.id === product.category_id)?.name}
                    />
                  ))}
                </div>
                <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
              </>
            ) : (
              <EmptyState
                title="No products found"
                description={search ? `No results for "${search}". Try a different term.` : 'Try a different category or filter.'}
                action={hasActiveFilters ? (
                  <button onClick={clearAll} className="mt-4 rounded-full bg-navy px-6 py-2.5 text-sm font-bold text-white hover:bg-pink-deep transition-colors">
                    Clear Filters
                  </button>
                ) : undefined}
              />
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
