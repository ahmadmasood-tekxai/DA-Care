import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import clsx from 'clsx';

import { buildSrcSet, optimizeImageUrl, resolveImageUrl } from '@/utils/format';

interface ProductImageProps {
  imageUrl?: string | null;
  imageColor?: string;
  alt: string;
  className?: string;
  /** Rendered width hint (px) for Cloudinary resizing. */
  width?: number;
  /** `sizes` attribute so the browser picks the right srcset candidate. */
  sizes?: string;
  /** Above-the-fold images: load eagerly with high fetch priority (LCP). */
  priority?: boolean;
}

const SRCSET_WIDTHS = [320, 480, 640, 960, 1280];

/**
 * Renders a product's photo everywhere a product appears. Cloudinary images are
 * served resized + in modern formats. If no image exists (or it fails to load),
 * shows a soft tinted placeholder — never a broken <img>.
 */
export function ProductImage({
  imageUrl,
  imageColor = '#7a4f4f',
  alt,
  className,
  width = 640,
  sizes = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw',
  priority = false,
}: ProductImageProps) {
  const resolvedUrl = resolveImageUrl(imageUrl);
  // Keyed on the URL so the error state resets when the image changes.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  if (resolvedUrl && failedUrl !== resolvedUrl) {
    return (
      <img
        src={optimizeImageUrl(resolvedUrl, width) ?? resolvedUrl}
        srcSet={buildSrcSet(resolvedUrl, SRCSET_WIDTHS)}
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        // React 18 only forwards the lowercase attribute.
        {...({ fetchpriority: priority ? 'high' : 'auto' } as Record<string, string>)}
        onLoad={() => setLoaded(true)}
        onError={() => setFailedUrl(resolvedUrl)}
        className={clsx(
          'h-full w-full object-cover transition-opacity duration-500',
          loaded || priority ? 'opacity-100' : 'opacity-0',
          className
        )}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={clsx('flex h-full w-full items-center justify-center', className)}
      style={{ background: `radial-gradient(circle at 40% 30%, ${imageColor}26, #f5ede8 72%)` }}
    >
      <ImageIcon className="h-1/4 w-1/4 opacity-30" style={{ color: imageColor }} strokeWidth={1.25} />
    </div>
  );
}
