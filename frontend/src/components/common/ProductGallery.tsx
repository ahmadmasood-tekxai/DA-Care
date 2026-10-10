import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

import { ProductImage } from '@/components/common/ProductImage';
import { buildSrcSet, optimizeImageUrl, resolveImageUrl } from '@/utils/format';

interface ProductGalleryProps {
  images: string[];
  alt: string;
  imageColor?: string;
  dimmed?: boolean;
  /** Overlay content (badges) for the main image. */
  overlay?: ReactNode;
}

/**
 * Swipeable product gallery: native scroll-snap on touch devices, arrows +
 * thumbnails on desktop. The first image is the page's LCP, so it loads eagerly.
 */
export function ProductGallery({ images, alt, imageColor, dimmed, overlay }: ProductGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const slides = images.length > 0 ? images : [null];

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => setActive(Math.round(el.scrollLeft / Math.max(el.clientWidth, 1)));
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const next = (i + slides.length) % slides.length;
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className="lg:sticky lg:top-28 lg:flex lg:flex-row-reverse lg:items-start lg:gap-4 lg:self-start">
      <div className="group relative min-w-0 flex-1 overflow-hidden rounded-3xl bg-cream-2 ring-1 ring-navy/[.06]">
        <div ref={trackRef} className="snap-track aspect-[4/5] scroll-auto sm:aspect-square" aria-live="polite">
          {slides.map((url, i) => (
            <div key={url ?? i} className="relative h-full w-full shrink-0">
              <ProductImage
                imageUrl={url}
                imageColor={imageColor}
                alt={slides.length > 1 ? `${alt} — image ${i + 1} of ${slides.length}` : alt}
                priority={i === 0}
                width={1100}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className={clsx(dimmed && 'opacity-60 grayscale')}
              />
            </div>
          ))}
        </div>

        {overlay}

        {slides.length > 1 && (
          <>
            <button
              onClick={() => goTo(active - 1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy opacity-0 shadow-card transition-opacity hover:bg-white group-hover:opacity-100 md:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => goTo(active + 1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy opacity-0 shadow-card transition-opacity hover:bg-white group-hover:opacity-100 md:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 lg:hidden">
              {slides.map((_, i) => (
                <span key={i} className={clsx('h-1.5 rounded-full transition-all', i === active ? 'w-5 bg-navy' : 'w-1.5 bg-navy/25')} />
              ))}
            </div>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto lg:mt-0 lg:max-h-[600px] lg:w-20 lg:flex-col lg:overflow-y-auto">
          {images.map((url, i) => {
            const resolved = resolveImageUrl(url);
            return (
              <button
                key={url}
                onClick={() => goTo(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === active}
                className={clsx(
                  'h-20 w-16 shrink-0 overflow-hidden rounded-xl ring-2 transition-all lg:h-24 lg:w-20',
                  i === active ? 'ring-navy' : 'opacity-60 ring-transparent hover:opacity-100'
                )}
              >
                <img
                  src={optimizeImageUrl(resolved, 200) ?? undefined}
                  srcSet={buildSrcSet(resolved, [160, 240])}
                  sizes="80px"
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
