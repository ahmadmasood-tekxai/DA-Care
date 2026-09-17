import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { categoriesApi } from '@/api/categories';
import { productsApi } from '@/api/products';
import { EmptyState } from '@/components/common/EmptyState';
import { ProductCard } from '@/components/common/ProductCard';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { resolveIcon } from '@/constants';
import { SEO } from '@/components/common/SEO';

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const [search, setSearch] = useState('');

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', activeCategory, search],
    queryFn: () => productsApi.list({ category_slug: activeCategory || undefined, search: search || undefined, page_size: 48 }),
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
    setSearchParams(searchParams);
  }

  return (
    <PublicLayout>
      <SEO
        title={activeCategoryName ? `${activeCategoryName} Collection` : 'Shop All Products'}
        description={activeCategoryName
          ? `Browse OQIRA's ${activeCategoryName} collection — premium quality products delivered nationwide across Pakistan.`
          : 'Shop OQIRA\'s complete collection of premium skin care, fine jewellery, luxury apparel, and baby essentials. Nationwide delivery in Pakistan.'}
        keywords={`OQIRA, ${activeCategoryName || 'products'} Pakistan, buy online Pakistan`}
      />
      <section className="bg-cream-2 px-6 pb-14 pt-16 text-center">
        <span className="section-tag">The Collection</span>
        <h1 className="text-4xl sm:text-5xl">{activeCategoryName || 'All Products'}</h1>
        <p className="mx-auto mt-3 max-w-md text-navy-soft">
          {activeCategoryName
            ? `Browse our full range of ${activeCategoryName} — premium quality for every occasion.`
            : 'Discover our premium skin care, jewellery, luxury apparel, and baby essentials.'}
        </p>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-6xl">
          {/* Filters */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-soft" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full rounded-full border border-navy/15 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-pink-deep focus:outline-none focus:ring-2 focus:ring-pink-deep/30"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-navy-soft" />
              <button
                onClick={() => selectCategory('')}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${!activeCategory ? 'bg-navy text-white' : 'bg-white text-navy-soft border border-navy/15 hover:bg-pink-pale'
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
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors ${isActive ? 'bg-navy text-white' : 'bg-white text-navy-soft border border-navy/15 hover:bg-pink-pale'
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

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState title="No products found" description="Try a different category or search term." />
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
