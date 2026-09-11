import { Shirt } from 'lucide-react';
import clsx from 'clsx';

import { resolveImageUrl } from '@/utils/format';

interface ProductImageProps {
  imageUrl?: string | null;
  imageColor?: string;
  alt: string;
  className?: string;
}

/**
 * Renders a product's uploaded photo everywhere a product appears (cards,
 * detail page, cart, admin table). If no image has been uploaded yet, falls
 * back to a soft radial placeholder tinted with the product's accent color
 * and a Lucide icon — never a broken <img> or an emoji.
 */
export function ProductImage({ imageUrl, imageColor = '#22304F', alt, className }: ProductImageProps) {
  const resolvedUrl = resolveImageUrl(imageUrl);

  if (resolvedUrl) {
    return (
      <img
        src={resolvedUrl}
        alt={alt}
        className={clsx('h-full w-full object-cover', className)}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={clsx('flex h-full w-full items-center justify-center', className)}
      style={{
        background: `radial-gradient(circle at 40% 30%, ${imageColor}22, #FFF1E7 70%)`,
      }}
    >
      <Shirt className="h-1/3 w-1/3 opacity-40" style={{ color: imageColor }} strokeWidth={1.5} />
    </div>
  );
}
