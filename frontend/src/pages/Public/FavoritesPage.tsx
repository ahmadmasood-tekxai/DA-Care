import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { SEO } from '@/components/common/SEO';
import { HeroBackground } from '@/components/common/HeroBackground';
import { ProductCard } from '@/components/common/ProductCard';
import { useFavorites } from '@/hooks/useFavorites';
import { ROUTES } from '@/constants';
import { Button } from '@/components/common/Button';

export function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites();

  return (
    <PublicLayout>
      <SEO
        title="My Favourites — OQIRA"
        description="Your saved favourite products from OQIRA."
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0d0a0a] px-6 pb-16 pt-28 text-center">
        <HeroBackground />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(201,168,76,0.08),transparent)]" />
        <div className="relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-5 py-2">
            <Heart className="h-4 w-4 fill-rose-400 text-rose-400" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#E8C96D]">
              {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            My Favourites
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-white/50">
            Products you've saved — ready to add to your cart whenever you are.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        {favorites.length === 0 ? (
          <div className="mx-auto max-w-md text-center py-16">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-rose-50">
              <Heart className="h-12 w-12 text-rose-300" strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-2xl font-semibold text-navy">No favourites yet</h2>
            <p className="mt-3 text-navy-soft">
              Browse our collections and tap the heart icon to save products you love.
            </p>
            <Link to={ROUTES.PRODUCTS} className="mt-8 inline-block">
              <Button>
                <ShoppingBag className="h-4 w-4" /> Browse Collection
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mx-auto mb-6 flex max-w-7xl items-center justify-between">
              <p className="text-sm font-semibold text-navy-soft">
                {favorites.length} saved {favorites.length === 1 ? 'product' : 'products'}
              </p>
              <button
                onClick={() => favorites.forEach((p) => removeFavorite(p.id))}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-rose-400 hover:text-rose-600 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear All
              </button>
            </div>

            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {favorites.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </section>
    </PublicLayout>
  );
}
