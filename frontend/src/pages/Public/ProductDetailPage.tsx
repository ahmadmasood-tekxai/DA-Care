import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Check, Minus, Plus, ShieldCheck, ShoppingBag, Truck, Wallet } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { productsApi } from '@/api/products';
import { Button } from '@/components/common/Button';
import { Loader } from '@/components/common/Loader';
import { ProductImage } from '@/components/common/ProductImage';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { PRODUCT_BADGE_LABELS, ROUTES, resolveIcon } from '@/constants';
import { ProductBadge } from '@/types';
import { useCart } from '@/hooks/useCart';
import { useSEO } from '@/hooks/useSEO';
import { formatCurrency } from '@/utils/format';


export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getBySlug(slug!),
    enabled: !!slug,
  });

  useSEO({
    title: product ? `${product.name} — ${product.category?.name || 'OQIRA'}` : 'Product Detail',
    description: product
      ? `${product.name} by OQIRA — ${product.short_description || ''} Available for Rs. ${product.price}. Buy online in Pakistan with nationwide delivery.`
      : 'Discover premium products at OQIRA. Nationwide delivery in Pakistan.',
    keywords: product ? `${product.name}, OQIRA, ${product.category?.name || ''}, buy online Pakistan` : 'OQIRA',
  });

  function handleAddToCart() {
    if (!product) return;
    addItem(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  if (isLoading || !product) {
    return (
      <PublicLayout>
        <Loader />
      </PublicLayout>
    );
  }

  const CategoryIcon = resolveIcon(product.category.icon);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <button
          onClick={() => navigate(ROUTES.PRODUCTS)}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-navy-soft hover:text-pink-deep"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </button>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-4xl border border-navy/10 bg-cream-2">
            {product.stock <= 0 ? (
              <span className="absolute left-4 top-4 z-10 rounded-full bg-slate-800 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-widest text-white shadow-lg">
                Out of Stock
              </span>
            ) : product.badge !== ProductBadge.NONE ? (
              <span className="absolute left-4 top-4 z-10 rounded-full bg-pink-deep px-3.5 py-1.5 text-xs font-extrabold text-white">
                {PRODUCT_BADGE_LABELS[product.badge]}
              </span>
            ) : null}
            <ProductImage
              imageUrl={product.image_url}
              imageColor={product.image_color}
              alt={product.name}
              className={product.stock <= 0 ? 'opacity-60 grayscale' : ''}
            />
          </div>

          {/* Info */}
          <div>
            <Link
              to={`${ROUTES.PRODUCTS}?category=${product.category.slug}`}
              className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-pink-pale px-3.5 py-1.5 text-xs font-bold text-pink-deep hover:bg-pink"
            >
              <CategoryIcon className="h-3.5 w-3.5" /> {product.category.name}
            </Link>

            <h1 className="text-3xl sm:text-4xl font-display font-semibold text-navy">{product.name}</h1>
            <p className="mt-3 text-navy-soft">{product.short_description}</p>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-3xl font-semibold text-navy">{formatCurrency(product.price)}</span>
              {product.old_price && (
                <span className="text-lg text-slate-400 line-through">{formatCurrency(product.old_price)}</span>
              )}
            </div>

            {product.description && <p className="mt-5 text-sm leading-relaxed text-navy-soft">{product.description}</p>}

            <div className="mt-6 flex items-center gap-2 text-sm font-semibold">
              {product.stock > 0 ? (
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <Check className="h-4 w-4" /> In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-rose-600">Currently Out of Stock</span>
              )}
            </div>

            {/* Quantity + Add to Cart */}
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <div className={`flex items-center rounded-full border border-navy/15 bg-white ${product.stock <= 0 ? 'opacity-50' : ''}`}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-navy hover:bg-pink-pale disabled:opacity-50"
                  aria-label="Decrease quantity"
                  disabled={product.stock <= 0}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-bold text-navy">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-navy hover:bg-pink-pale disabled:opacity-50"
                  aria-label="Increase quantity"
                  disabled={product.stock <= 0}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button size="lg" onClick={handleAddToCart} disabled={product.stock <= 0} className="flex-1 sm:flex-none">
                <ShoppingBag className="h-5 w-5" /> {product.stock <= 0 ? 'Out of Stock' : justAdded ? 'Added to Cart!' : 'Add to Cart'}
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 border-t border-navy/10 pt-6 sm:grid-cols-3">
              {[
                { icon: Truck, label: 'Free Delivery' },
                { icon: Wallet, label: 'Cash on Delivery' },
                { icon: ShieldCheck, label: '7-Day Exchange' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs font-bold text-navy-soft">
                  <Icon className="h-4 w-4 text-pink-deep" /> {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
