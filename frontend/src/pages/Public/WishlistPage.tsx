import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';

import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { ProductCard } from '@/components/common/ProductCard';
import { SEO } from '@/components/common/SEO';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useCategories } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/useToast';
import { useWishlist } from '@/hooks/useWishlist';

export function WishlistPage() {
  const { items } = useWishlist();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { data: categories } = useCategories();
  const categoryName = (id: number) => categories?.find((c) => c.id === id)?.name;
  const inStock = items.filter((p) => p.stock > 0);

  const addAll = () => {
    inStock.forEach((p) => addItem(p));
    toast({ title: `${inStock.length} item${inStock.length === 1 ? '' : 's'} added to your cart`, action: { label: 'View cart', to: ROUTES.CART } });
  };

  return (
    <PublicLayout>
      <SEO title="My wishlist" noIndex />
      <PageHeader
        eyebrow={<><Heart className="h-3.5 w-3.5" /> Saved for later</>}
        title="My wishlist"
        breadcrumbs={[{ label: 'Home', to: ROUTES.HOME }, { label: 'Wishlist' }]}
        description={items.length ? `${items.length} saved piece${items.length === 1 ? '' : 's'} — they'll be here whenever you're ready.` : undefined}
      />

      <section className="container-page pb-16 pt-8 sm:pb-24 sm:pt-12">
        {items.length === 0 ? (
          <EmptyState
            icon={<Heart className="h-6 w-6" />}
            title="Your wishlist is empty"
            description="Tap the heart on any product to save it here."
            action={<Link to={ROUTES.PRODUCTS} className="btn btn-primary mt-2">Discover products</Link>}
          />
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              {!isAuthenticated ? (
                <p className="text-sm text-navy-soft">
                  <Link to={`${ROUTES.SIGNUP}?next=${ROUTES.WISHLIST}`} className="font-semibold text-navy underline-offset-4 hover:underline">Create an account</Link>{' '}
                  to track your orders and get updates by email.
                </p>
              ) : <span />}
              {inStock.length > 0 && (
                <button onClick={addAll} className="btn btn-primary btn-sm">
                  <ShoppingBag className="h-4 w-4" /> Add all to cart
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {items.map((p) => <ProductCard key={p.id} product={p} categoryName={categoryName(p.category_id)} />)}
            </div>
          </>
        )}
      </section>
    </PublicLayout>
  );
}
