import { useState } from 'react';
import { Shirt, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { resolveImageUrl } from '@/utils/format';

export interface ProductImage {
  id: number;
  url: string;
}

interface ProductGalleryProps {
  images: ProductImage[];
  primaryImageUrl?: string | null;
  imageColor?: string;
  alt: string;
  className?: string;
}

/**
 * A beautiful gallery component that handles multiple images for a product.
 * It combines the primary legacy image (if any) with the new multiple images.
 */
export function ProductGallery({ images, primaryImageUrl, imageColor = '#22304F', alt, className }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Combine primary image (from legacy setup) with the new images array, avoiding duplicates
  const allImageUrls = [
    ...(primaryImageUrl ? [primaryImageUrl] : []),
    ...images.map(img => img.url)
  ].filter((url, index, self) => self.indexOf(url) === index); // Deduplicate

  const hasImages = allImageUrls.length > 0;

  if (!hasImages) {
    return (
      <div
        className={clsx('flex h-full w-full items-center justify-center rounded-xl overflow-hidden relative', className)}
        style={{
          background: `radial-gradient(circle at 40% 30%, ${imageColor}22, #FFF1E7 70%)`,
        }}
      >
        <Shirt className="h-1/3 w-1/3 opacity-40" style={{ color: imageColor }} strokeWidth={1.5} />
      </div>
    );
  }

  const currentImageUrl = resolveImageUrl(allImageUrls[currentIndex]);

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasError(false);
    setCurrentIndex((prev) => (prev === allImageUrls.length - 1 ? 0 : prev + 1));
  };

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasError(false);
    setCurrentIndex((prev) => (prev === 0 ? allImageUrls.length - 1 : prev - 1));
  };

  return (
    <div className={clsx('relative group w-full h-full rounded-xl overflow-hidden bg-gray-50', className)}>
      {!hasError ? (
        <img
          key={currentImageUrl}
          src={currentImageUrl || ""}
          alt={`${alt} - view ${currentIndex + 1}`}
          className="h-full w-full object-cover transition-opacity duration-300"
          loading="lazy"
          onError={() => setHasError(true)}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{ background: `radial-gradient(circle at 40% 30%, ${imageColor}22, #FFF1E7 70%)` }}
        >
          <Shirt className="h-1/3 w-1/3 opacity-40" style={{ color: imageColor }} strokeWidth={1.5} />
        </div>
      )}

      {/* Navigation Arrows (Only show if multiple images exist) */}
      {allImageUrls.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/70 hover:bg-white text-gray-800 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/70 hover:bg-white text-gray-800 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {allImageUrls.map((_, idx) => (
              <div
                key={idx}
                className={clsx(
                  "h-1.5 rounded-full transition-all duration-300 shadow-sm",
                  idx === currentIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
