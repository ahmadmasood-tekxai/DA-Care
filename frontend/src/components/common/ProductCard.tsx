import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Plus } from 'lucide-react';
import clsx from 'clsx';

import { ProductImage } from '@/components/common/ProductImage';
import { WishlistButton } from '@/components/common/WishlistButton';
import { PRODUCT_BADGE_LABELS, ROUTES } from '@/constants';
import { ProductBadge, type Product } from '@/types';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, getDiscountPercent, getProductImages } from '@/utils/format';

interface ProductCardProps {
  product: Product;
  categoryName?: string;
  /** Load the image eagerly (first row above the fold). */
  priority?: boolean;
}

const BADGE_STYLES: Partial<Record<ProductBadge, string>> = {
  [ProductBadge.BESTSELLER]: 'bg-gold text-navy',
  [ProductBadge.NEW]: 'bg-navy text-white',
  [ProductBadge.FAVOURITE]: 'bg-pink-deep text-white',
  [ProductBadge.STUDIO_PICK]: 'bg-white text-navy ring-1 ring-navy/10',
};

const LOW_STOCK_THRESHOLD = 5;

function ProductCardBase({ product, categoryName, priority }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [justAdded, setJustAdded] = useState(false);

  const href = ROUTES.PRODUCT_DETAIL(product.slug);
  const [primaryImage, hoverImage] = getProductImages(product);
  const discount = getDiscountPercent(product);
  const soldOut = product.stock <= 0;
  const lowStock = !soldOut && product.stock <= LOW_STOCK_THRESHOLD;

  const handleAdd = () => {
    addItem(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
    toast({ title: 'Added to your cart', description: product.name, action: { label: 'View cart', to: ROUTES.CART } });
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-navy/[.07] bg-white transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:border-gold/30 hover:shadow-card">
      {/* Image */}
      <Link to={href} className="relative block aspect-[4/5] overflow-hidden bg-cream-2" aria-label={product.name} tabIndex={-1}>
        <ProductImage
          imageUrl={primaryImage}
          imageColor={product.image_color}
          alt={product.name}
          priority={priority}
          className={clsx(
            'transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]',
            soldOut && 'opacity-60 grayscale'
          )}
        />
        {hoverImage && !soldOut && (
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 max-md:hidden">
            <ProductImage imageUrl={hoverImage} imageColor={product.image_color} alt="" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5 sm:left-3 sm:top-3">
          {soldOut ? (
            <span className="rounded-full bg-navy/85 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white backdrop-blur-sm sm:text-[10px]">
              Sold out
            </span>
          ) : (
            product.badge !== ProductBadge.NONE && (
              <span
                className={clsx(
                  'rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest shadow-sm sm:text-[10px]',
                  BADGE_STYLES[product.badge] ?? 'bg-navy text-white'
                )}
              >
                {PRODUCT_BADGE_LABELS[product.badge]}
              </span>
            )
          )}
          {discount > 0 && !soldOut && (
            <span className="rounded-full bg-sale px-2 py-1 text-[10px] font-bold text-white shadow-sm sm:text-[11px]">
              -{discount}%
            </span>
          )}
        </div>
      </Link>
      <WishlistButton product={product} className="absolute right-2.5 top-2.5 sm:right-3 sm:top-3" />

      {/* Info */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {categoryName && (
          <p className="mb-1 truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-dark">{categoryName}</p>
        )}
        <h3 className="font-body text-[13px] font-semibold leading-snug text-navy sm:text-[15px]">
          <Link to={href} className="line-clamp-2 transition-colors after:absolute after:inset-0 hover:text-pink-deep">
            {product.name}
          </Link>
        </h3>
        {lowStock && (
          <p className="mt-1.5 text-[11px] font-semibold text-sale">Only {product.stock} left</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="min-w-0">
            <p className="text-[15px] font-bold leading-none text-navy sm:text-base">{formatCurrency(product.price)}</p>
            {discount > 0 && (
              <p className="mt-1 text-[11px] leading-none text-navy-soft/60 line-through sm:text-xs">
                {formatCurrency(product.old_price!)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut}
            aria-label={soldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`}
            className={clsx(
              'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-30 sm:h-11 sm:w-11',
              justAdded ? 'bg-emerald-500 text-white' : 'bg-navy text-white hover:bg-gold hover:text-navy active:scale-90'
            )}
          >
            {justAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </article>
  );
}

export const ProductCard = memo(ProductCardBase);

/** Matching placeholder while products load — same footprint, no layout shift. */
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-navy/[.07] bg-white">
      <div className="skeleton aspect-[4/5] rounded-none" />
      <div className="space-y-2 p-3 sm:p-4">
        <div className="skeleton h-2.5 w-1/3" />
        <div className="skeleton h-3.5 w-4/5" />
        <div className="flex items-end justify-between pt-3">
          <div className="skeleton h-4 w-1/3" />
          <div className="skeleton h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
