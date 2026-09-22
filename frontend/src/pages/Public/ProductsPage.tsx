import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { categoriesApi } from '@/api/categories';
import { productsApi } from '@/api/products';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { ProductCard } from '@/components/common/ProductCard';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { HeroBackground } from '@/components/common/HeroBackground';
import { resolveIcon } from '@/constants';
import { SEO } from '@/components/common/SEO';

const PAGE_SIZE = 12;

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', activeCategory, search, page],
    queryFn: () =>
      productsApi.list({
        category_slug: activeCategory || undefined,
        search: search || undefined,
        page,
        page_size: PAGE_SIZE,
      }),
  });

  const activeCategoryName = useMemo(
    () => categories?.find((c) => c.slug === activeCategory)?.name,
    [categories, activeCategory]
  );

  function selectCategory(slug: string) {
    if (slug === activeCategory) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setPage(1);
    setSearchParams(searchParams);
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const totalPages = products?.total_pages ?? 1;

  return (
    <PublicLayout>
      <SEO
        title={activeCategoryName ? `${activeCategoryName} — Buy Online in Pakistan` : 'Shop All Products — Cosmetics, Jewellery, Suits & Baby Clothes'}
        description={activeCategoryName
          ? `OQIRA par ${activeCategoryName} khareeden — premium quality, fast delivery, COD available. Pakistan ke sabse behtareen products sirf OQIRA par!`
          : 'OQIRA par shop karein — cosmetics, skin care, jewellery, luxury suits, baby garments. 1000+ products. Cash on delivery + bank transfer. Poori Pakistan delivery.'}
        keywords={`OQIRA, ${activeCategoryName ? activeCategoryName + ' Pakistan, ' : ''}online shopping Pakistan, buy ${activeCategoryName || 'products'} online, cosmetics Pakistan, jewellery online, baby clothes, luxury suits, COD Pakistan, skin care products Pakistan`}
        url={`https://okira.vercel.app/products${activeCategory ? '?category=' + activeCategory : ''}`}
        schema={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://okira.vercel.app/" },
            { "@type": "ListItem", "position": 2, "name": activeCategoryName || "All Products", "item": `https://okira.vercel.app/products${activeCategory ? '?category=' + activeCategory : ''}` }
          ]
        }}
      />
      {/* DARK HERO */}
      <section className="relative overflow-hidden bg-navy px-6 pb-16 pt-28 text-center">
        <HeroBackground />
        <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_50%_0%,_#D1D0D0_0%,_transparent_60%)]" />
        <div className="relative z-10">
          <span className="section-tag animate-fade-in-up">The Collection</span>
          <h1 className="mt-3 text-4xl font-display font-semibold tracking-tight text-white sm:text-6xl animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            {activeCategoryName || 'All Products'}
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base font-light text-cream/70 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            {activeCategoryName
              ? `Browse our full range of ${activeCategoryName} — premium quality for every occasion.`
              : 'Cosmetics · Jewellery · Suits · Baby Clothes — premium quality, nationwide delivery.'}
          </p>
          {products && (
            <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2 text-xs font-bold uppercase tracking-widest text-gold backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              {products.total} products available
            </span>
          )}
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-6xl">
          {/* Filters */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-xs">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-soft" />
              <input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full rounded-full border border-navy/15 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-pink-deep focus:outline-none focus:ring-2 focus:ring-pink-deep/30"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
              {/* <SlidersHorizontal className="h-4 w-4 text-navy-soft" /> */}
              <button
                onClick={() => selectCategory('')}
                className={`rounded-full px-4 py-2  text-xs font-bold transition-colors ${!activeCategory
                  ? 'bg-navy text-white'
                  : 'bg-white text-navy-soft border border-navy/15 hover:bg-pink-pale'
                  }`}
              >
                All
              </button>
              {categories?.map((cat) => {
                const Icon = resolveIcon(cat.icon);
                const isActive = activeCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => selectCategory(cat.slug)}
                    className={`flex items-center gap-1.5 justify-center rounded-full px-4 py-2 text-xs font-bold transition-colors ${isActive
                      ? 'bg-navy text-white'
                      : 'bg-white text-navy-soft border border-navy/15 hover:bg-pink-pale'
                      }`}
                  >
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} className="h-3.5 w-3.5 rounded-full object-cover" />
                    ) : (
                      <Icon className="h-3.5 w-3.5" />
                    )}
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results count */}
          {!isLoading && products && products.total > 0 && (
            <p className="mb-5 text-xs text-navy-soft">
              Showing{' '}
              <span className="font-semibold text-navy">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, products.total)}
              </span>{' '}
              of <span className="font-semibold text-navy">{products.total}</span> products
            </p>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-3xl border border-navy/10 bg-white">
                  <div className="aspect-square w-full bg-slate-200"></div>
                  <div className="p-5">
                    <div className="h-6 w-3/4 rounded bg-slate-200"></div>
                    <div className="mt-2 h-4 w-full rounded bg-slate-200"></div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="h-6 w-1/3 rounded bg-slate-200"></div>
                      <div className="h-8 w-20 rounded-full bg-slate-200"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products && products.items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {products.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <EmptyState title="No products found" description="Try a different category or search term." />
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
