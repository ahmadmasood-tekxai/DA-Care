import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface CarouselProps {
  children: ReactNode[];
  /** Tailwind width classes applied to every slide, e.g. "w-[70%] sm:w-1/3 lg:w-1/4". */
  slideClassName?: string;
  /** Gap between slides (Tailwind gap + matching padding handled by the track). */
  gapClassName?: string;
  /** Auto-advance interval in ms. Pauses on hover/focus, off-screen, and for reduced motion. */
  autoPlayMs?: number;
  showArrows?: boolean;
  showDots?: boolean;
  /** Arrow colour scheme for light or dark sections. */
  tone?: 'light' | 'dark';
  ariaLabel: string;
  className?: string;
}

/**
 * Lightweight, dependency-free carousel built on native CSS scroll-snap:
 * touch swipe, trackpad and keyboard scrolling work out of the box,
 * and it costs nothing when idle.
 */
export function Carousel({
  children,
  slideClassName = 'w-[78%] sm:w-[45%] lg:w-[31%]',
  gapClassName = 'gap-4 sm:gap-5',
  autoPlayMs,
  showArrows = true,
  showDots = false,
  tone = 'light',
  ariaLabel,
  className,
}: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);

  const updateState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    const first = el.children[0] as HTMLElement | undefined;
    if (first) {
      const step = first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || '0');
      setActiveIndex(Math.round(el.scrollLeft / Math.max(step, 1)));
    }
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateState();
    el.addEventListener('scroll', updateState, { passive: true });
    const ro = new ResizeObserver(updateState);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateState);
      ro.disconnect();
    };
  }, [updateState, children.length]);

  // Only auto-play while the carousel is actually on screen.
  useEffect(() => {
    const el = trackRef.current;
    if (!el || !autoPlayMs) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [autoPlayMs]);

  const scrollByPage = useCallback((direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    if (direction === 1 && atEnd) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' });
  }, []);

  const scrollToIndex = (index: number) => {
    const el = trackRef.current;
    const slide = el?.children[index] as HTMLElement | undefined;
    if (el && slide) el.scrollTo({ left: slide.offsetLeft - el.offsetLeft, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!autoPlayMs || paused || !visible) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => scrollByPage(1), autoPlayMs);
    return () => window.clearInterval(id);
  }, [autoPlayMs, paused, visible, scrollByPage]);

  const arrowClass =
    tone === 'dark'
      ? 'border-white/15 bg-white/10 text-white hover:bg-white hover:text-navy'
      : 'border-navy/10 bg-white text-navy shadow-card hover:bg-navy hover:text-white';

  return (
    <div
      className={clsx('group/carousel relative', className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div ref={trackRef} className={clsx('snap-track pb-2', gapClassName)}>
        {children.map((child, i) => (
          <div
            key={i}
            className={clsx('shrink-0', slideClassName)}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${children.length}`}
          >
            {child}
          </div>
        ))}
      </div>

      {showArrows && (canPrev || canNext) && (
        <>
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            disabled={!canPrev}
            aria-label="Previous slides"
            className={clsx(
              'absolute -left-3 top-[40%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border transition-all duration-200 disabled:pointer-events-none disabled:opacity-0 md:flex lg:-left-5',
              arrowClass
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            aria-label="Next slides"
            className={clsx(
              'absolute -right-3 top-[40%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border transition-all duration-200 md:flex lg:-right-5',
              arrowClass
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {showDots && children.length > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {children.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === activeIndex}
              className={clsx(
                'h-1.5 rounded-full transition-all duration-300',
                i === activeIndex
                  ? 'w-7 bg-gold'
                  : tone === 'dark' ? 'w-1.5 bg-white/30 hover:bg-white/60' : 'w-1.5 bg-navy/20 hover:bg-navy/40'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
