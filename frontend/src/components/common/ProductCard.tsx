import { Link } from 'react-router-dom';
import { ShoppingBag, Link2, Check, Tag } from 'lucide-react';
import { useState } from 'react';

import { ProductImage } from '@/components/common/ProductImage';
import { PRODUCT_BADGE_LABELS, ROUTES } from '@/constants';
import { ProductBadge, type Product } from '@/types';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/utils/format';

interface ProductCardProps {
  product: Product;
  categoryName?: string;
}

export function ProductCard({ product, categoryName }: ProductCardProps) {
  const { addItem } = useCart();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}${ROUTES.PRODUCT_DETAIL(product.slug)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayImageUrl = product.image_url || (product.images && product.images.length > 0 ? product.images[0].url : '');

  return (
    <div className="group overflow-hidden rounded-2xl border border-white/60 bg-white shadow-md shadow-navy/5 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-pink-deep/10">
      <Link to={ROUTES.PRODUCT_DETAIL(product.slug)} className="relative block aspect-[4/5] overflow-hidden bg-cream-2">
        {product.stock <= 0 ? (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-white">
            Out of Stock
          </span>
        ) : product.badge !== ProductBadge.NONE ? (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-pink-deep px-2.5 py-0.5 text-[10px] font-extrabold text-white">
            {PRODUCT_BADGE_LABELS[product.badge]}
          </span>
        ) : null}
        <ProductImage
          imageUrl={displayImageUrl}
          imageColor={product.image_color}
          alt={product.name}
          className={`transition-all duration-700 ease-out group-hover:scale-110 ${product.stock <= 0 ? 'opacity-60 grayscale' : ''}`}
        />
        <button
          onClick={handleCopyLink}
          className="absolute bottom-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-navy shadow-sm backdrop-blur-sm transition-all hover:bg-navy hover:text-white"
          title="Copy Link"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Link2 className="h-3.5 w-3.5" />}
        </button>
        {copied && (
          <span className="absolute bottom-11 right-2.5 z-10 animate-fade-in-up rounded-md bg-navy px-2 py-1 text-[10px] font-bold text-white shadow-md">
            Copied!
          </span>
        )}
      </Link>

      <div className="p-4">
        {categoryName && (
          <div className="mb-1.5 flex items-center gap-1">
            <Tag className="h-3 w-3 text-pink-deep/70" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-pink-deep/70">{categoryName}</span>
          </div>
        )}
        <Link to={ROUTES.PRODUCT_DETAIL(product.slug)}>
          <h3 className="font-display text-base font-semibold text-navy leading-snug hover:text-pink-deep line-clamp-1">{product.name}</h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-xs text-navy-soft/80 leading-relaxed">{product.short_description}</p>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-base font-semibold text-navy">{formatCurrency(product.price)}</span>
            {product.old_price && (
              <span className="text-xs text-slate-400 line-through">{formatCurrency(product.old_price)}</span>
            )}
          </div>
          <button
            onClick={() => addItem(product)}
            disabled={product.stock <= 0}
            className="flex items-center gap-1 rounded-full bg-navy px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-pink-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingBag className="h-3 w-3" />
            {product.stock <= 0 ? 'Sold Out' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
