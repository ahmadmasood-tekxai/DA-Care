import { useState } from 'react';
import { Heart } from 'lucide-react';
import clsx from 'clsx';

import { ROUTES } from '@/constants';
import { useToast } from '@/hooks/useToast';
import { useWishlist } from '@/hooks/useWishlist';
import type { Product } from '@/types';

interface WishlistButtonProps {
  product: Product;
  /** 'overlay' sits on a product image; 'outline' matches the buy-box buttons. */
  variant?: 'overlay' | 'outline';
  className?: string;
}

export function WishlistButton({ product, variant = 'overlay', className }: WishlistButtonProps) {
  const { has, toggle } = useWishlist();
  const { toast } = useToast();
  const [pop, setPop] = useState(false);
  const saved = has(product.id);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = toggle(product);
    if (nowSaved) {
      setPop(true);
      window.setTimeout(() => setPop(false), 350);
      toast({ title: 'Saved to your wishlist', description: product.name, action: { label: 'View wishlist', to: ROUTES.WISHLIST } });
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
      className={clsx(
        'z-10 flex shrink-0 items-center justify-center rounded-full transition-all duration-200 active:scale-90',
        variant === 'overlay'
          ? 'h-9 w-9 bg-white/90 shadow-soft backdrop-blur hover:bg-white'
          : 'w-[52px] self-stretch border border-navy/15 bg-white hover:border-navy/40',
        className
      )}
    >
      <Heart
        className={clsx(
          'transition-all duration-300',
          variant === 'overlay' ? 'h-4 w-4' : 'h-5 w-5',
          saved ? 'fill-rose-500 text-rose-500' : 'text-navy',
          pop && 'scale-125'
        )}
      />
    </button>
  );
}
