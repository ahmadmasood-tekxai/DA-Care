import { Link } from 'react-router-dom';
import { ShoppingBag, Link2, Check, Tag, Star, Heart } from 'lucide-react';
import { useState } from 'react';

import { ProductImage } from '@/components/common/ProductImage';
import { PRODUCT_BADGE_LABELS, ROUTES } from '@/constants';
import { ProductBadge, type Product } from '@/types';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { formatCurrency } from '@/utils/format';

interface ProductCardProps {
  product: Product;
  categoryName?: string;
}

const BADGE_STYLES: Partial<Record<ProductBadge, string>> = {
  [ProductBadge.BESTSELLER]:
    'bg-gradient-to-r from-[#C9A84C] to-[#a07830] text-[#0d0a0a]',
  [ProductBadge.NEW]:
    'bg-gradient-to-r from-[#7a4f4f] to-[#5C3838] text-white',
  [ProductBadge.FAVOURITE]:
    'bg-gradient-to-r from-rose-500 to-rose-700 text-white',
  [ProductBadge.STUDIO_PICK]:
    'bg-gradient-to-r from-[#0d0a0a] to-[#1a0f0f] text-[#C9A84C]',
};

export function ProductCard({ product, categoryName }: ProductCardProps) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [copied, setCopied] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);
  const favorited = isFavorite(product.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}${ROUTES.PRODUCT_DETAIL(product.slug)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  const displayImageUrl =
    product.image_url || (product.images && product.images.length > 0 ? product.images[0].url : '');

  const discountPct =
    product.old_price && product.old_price > product.price
      ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
      : 0;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-navy/8 bg-white shadow-sm shadow-navy/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(13,10,10,0.12)] hover:border-[#C9A84C]/30">
      {/* Shimmer sweep on hover */}
      <div className="pointer-events-none absolute inset-0 z-10 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />

      {/* Image */}
      <Link
        to={ROUTES.PRODUCT_DETAIL(product.slug)}
        className="relative block aspect-[4/5] overflow-hidden bg-gradient-to-br from-[#fdf8f5] to-[#f5ede8]"
      >
        {/* Out of Stock */}
        {product.stock <= 0 && (
          <span className="absolute left-3 top-3 z-20 rounded-full bg-[#0d0a0a]/85 px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest text-white backdrop-blur-sm">
            Sold Out
          </span>
        )}

        {/* Badge */}
        {product.stock > 0 && product.badge !== ProductBadge.NONE && (
          <span
            className={`absolute left-3 top-3 z-20 rounded-full px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest shadow-sm ${
              BADGE_STYLES[product.badge] ?? 'bg-[#7a4f4f] text-white'
            }`}
          >
            {PRODUCT_BADGE_LABELS[product.badge]}
          </span>
        )}

        {/* Discount pill */}
        {discountPct > 0 && (
          <span className="absolute right-3 top-3 z-20 rounded-full bg-rose-500 px-2.5 py-1 text-[9px] font-extrabold text-white shadow-sm">
            -{discountPct}%
          </span>
        )}

        <ProductImage
          imageUrl={displayImageUrl}
          imageColor={product.image_color}
          alt={product.name}
          className={`transition-all duration-700 ease-out group-hover:scale-108 ${
            product.stock <= 0 ? 'opacity-50 grayscale' : ''
          }`}
        />

        {/* Favorite button */}
        <button
          onClick={handleFavorite}
          className={`absolute bottom-3 left-3 z-20 flex h-8 w-8 items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all hover:scale-110 sm:opacity-0 opacity-100 sm:group-hover:opacity-100 ${
            favorited
              ? 'bg-rose-500 text-white opacity-100'
              : 'bg-white/90 text-[#0d0a0a] hover:bg-rose-500 hover:text-white'
          }`}
          title={favorited ? 'Remove from Favourites' : 'Add to Favourites'}
        >
          <Heart className={`h-3.5 w-3.5 transition-all ${favorited ? 'fill-white' : ''}`} />
        </button>

        {/* Copy link button */}
        <button
          onClick={handleCopyLink}
          className="absolute bottom-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#0d0a0a] shadow-md backdrop-blur-sm transition-all hover:bg-[#C9A84C] hover:text-[#0d0a0a] hover:scale-110 opacity-0 group-hover:opacity-100"
          title="Copy Link"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Link2 className="h-3.5 w-3.5" />}
        </button>
      </Link>

      {/* Info */}
      <div className="p-4">
        {categoryName && (
          <div className="mb-2 flex items-center gap-1.5">
            <Tag className="h-2.5 w-2.5 text-[#C9A84C]" />
            <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#C9A84C]">
              {categoryName}
            </span>
          </div>
        )}

        <Link to={ROUTES.PRODUCT_DETAIL(product.slug)}>
          <h3 className="font-display text-[15px] font-semibold leading-snug text-[#0d0a0a] line-clamp-1 hover:text-[#7a4f4f] transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[#3a2e2e]/65">
          {product.short_description}
        </p>

        {/* Price + CTA */}
        <div className="mt-3.5 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="font-display text-base font-bold text-[#0d0a0a]">
              {formatCurrency(product.price)}
            </span>
            {product.old_price && (
              <span className="text-[10px] text-slate-400 line-through leading-tight">
                {formatCurrency(product.old_price)}
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wide shadow-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
              addedAnim
                ? 'bg-emerald-500 text-white scale-95'
                : 'bg-gradient-to-r from-[#0d0a0a] to-[#1a0f0f] text-white hover:from-[#C9A84C] hover:to-[#a07830] hover:text-[#0d0a0a] hover:scale-105 hover:shadow-[0_4px_16px_rgba(201,168,76,0.35)]'
            }`}
          >
            {addedAnim ? (
              <><Star className="h-3 w-3 fill-white" /> Added!</>
            ) : (
              <><ShoppingBag className="h-3 w-3" /> {product.stock <= 0 ? 'Sold Out' : 'Add'}</>
            )}
          </button>
        </div>
      </div>

      {/* Gold bottom accent */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#C9A84C]/0 to-transparent transition-all duration-500 group-hover:via-[#C9A84C]/40" />
    </div>
  );
}
