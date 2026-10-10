import { useCallback, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Sparkles, Star, Truck, Wallet } from 'lucide-react';
import clsx from 'clsx';

import { HeroBackground } from '@/components/common/HeroBackground';
import { ProductImage } from '@/components/common/ProductImage';
import { PRODUCT_BADGE_LABELS, ROUTES } from '@/constants';
import { ProductBadge, type Product } from '@/types';
import { formatCurrency, getDiscountPercent, getProductImages } from '@/utils/format';

const AUTOPLAY_MS = 7000;
const SWIPE_THRESHOLD = 50;
const REVIEWERS = ['AM', 'SR', 'ZK', 'FN'];

interface HeroCarouselProps {
  /** Featured products with images become extra slides after the brand slide. */
  products: Product[];
}

/** Staggered entrance for the active slide's text — each line rises in after the last. */
function rise(active: boolean, step: number): { className?: string; style?: CSSProperties } {
  return active ? { className: 'animate-fade-in-up', style: { animationDelay: `${80 + step * 110}ms` } } : {};
}

function TrustChip({ icon: Icon, title, text, className }: { icon: typeof Wallet; title: string; text: string; className?: string }) {
  return (
    <div className={clsx('glass-dark flex items-center gap-3 rounded-2xl px-4 py-3', className)}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold"><Icon className="h-4 w-4" /></span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-white">{title}</span>
        <span className="block text-[11px] text-white/55">{text}</span>
      </span>
    </div>
  );
}

function BrandSlide({ products, active }: { products: Product[]; active: boolean }) {
  const collage = products.filter((p) => getProductImages(p).length > 0).slice(0, 3);
  return (
    <div className="container-page grid items-center gap-10 pb-16 pt-12 sm:pb-20 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-24 lg:pt-20">
      <div>
        <p {...rise(active, 0)}>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-light">
            <Sparkles className="h-3.5 w-3.5" /> New season · Free delivery
          </span>
        </p>
        <h1
          className={clsx('mt-5 font-display text-[2.7rem] font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-[4.6rem]', rise(active, 1).className)}
          style={rise(active, 1).style}
        >
          Everyday luxury, <span className="italic text-gold-light">delivered</span> to your door
        </h1>
        <p className={clsx('mt-6 max-w-lg text-base leading-relaxed text-white/65 sm:text-lg', rise(active, 2).className)} style={rise(active, 2).style}>
          Cosmetics, skin care, jewellery, apparel and baby essentials — handpicked for quality, with cash on delivery across
          Pakistan.
        </p>
        <div className={clsx('mt-8 flex flex-col gap-3 sm:flex-row', rise(active, 3).className)} style={rise(active, 3).style}>
          <Link to={ROUTES.PRODUCTS} className="btn btn-gold btn-lg group">
            Shop the collection <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link to={`${ROUTES.PRODUCTS}?deals=1`} className="btn btn-outline-light btn-lg">
            Today's deals
          </Link>
        </div>
        <div className={clsx('mt-10 flex items-center gap-4', rise(active, 4).className)} style={rise(active, 4).style}>
          <span className="flex -space-x-2.5" aria-hidden="true">
            {REVIEWERS.map((r, i) => (
              <span
                key={r}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-navy text-[11px] font-bold text-navy"
                style={{ background: ['#E8C96D', '#f0e8e8', '#C9A84C', '#efe3dc'][i] }}
              >
                {r}
              </span>
            ))}
          </span>
          <span className="text-sm leading-tight text-white/70">
            <span className="flex items-center gap-0.5 text-gold">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
              <span className="ml-1.5 font-semibold text-white">4.9/5</span>
            </span>
            Loved by 5,000+ customers nationwide
          </span>
        </div>
      </div>

      {collage.length === 3 ? (
        <div className="relative mx-auto w-full max-w-[520px]">
          <div className="grid grid-cols-[1.15fr_1fr] gap-3 sm:gap-4">
            {collage.map((p, i) => (
              <Link
                key={p.id}
                to={ROUTES.PRODUCT_DETAIL(p.slug)}
                className={clsx(
                  'group relative overflow-hidden bg-navy-3 ring-1 ring-white/10',
                  i === 0 ? 'row-span-2 min-h-full rounded-[50%_50%_2rem_2rem/28%_28%_2rem_2rem]' : 'aspect-square rounded-[1.75rem]',
                  active && 'animate-fade-in-up'
                )}
                style={{ animationDelay: `${200 + i * 140}ms` }}
              >
                <ProductImage
                  imageUrl={getProductImages(p)[0]}
                  imageColor={p.image_color}
                  alt={p.name}
                  priority={i === 0}
                  width={i === 0 ? 720 : 480}
                  sizes="(min-width: 1024px) 22vw, 45vw"
                  className="transition-transform duration-700 ease-out-expo group-hover:scale-105"
                />
                <span className="absolute inset-x-3 bottom-3 translate-y-2 rounded-xl bg-white/95 px-3 py-2 text-navy opacity-0 shadow-lift backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="block truncate text-xs font-semibold">{p.name}</span>
                  <span className="text-xs font-bold text-pink-deep">{formatCurrency(p.price)}</span>
                </span>
              </Link>
            ))}
          </div>
          <TrustChip
            icon={Wallet}
            title="Cash on delivery"
            text="Pay at your door"
            className={clsx('absolute -left-4 top-10 hidden sm:flex lg:-left-10', active && 'animate-fade-in-up')}
          />
          <TrustChip
            icon={ShieldCheck}
            title="100% authentic"
            text="Quality-checked by hand"
            className={clsx('absolute -right-3 bottom-8 hidden sm:flex lg:-right-8', active && 'animate-fade-in-up')}
          />
        </div>
      ) : (
        <div className="hidden lg:block" aria-hidden="true">
          <div className="mx-auto flex aspect-square max-w-md items-center justify-center rounded-full border border-gold/20">
            <div className="flex aspect-square w-3/4 items-center justify-center rounded-full border border-gold/30 bg-gold/[.04]">
              <span className="font-display text-7xl italic text-gold-light/80">OQ</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductSlide({ product, active }: { product: Product; active: boolean }) {
  const discount = getDiscountPercent(product);
  const badge = product.badge !== ProductBadge.NONE ? PRODUCT_BADGE_LABELS[product.badge] : 'Featured';
  const href = ROUTES.PRODUCT_DETAIL(product.slug);
  return (
    <div className="container-page grid items-center gap-8 pb-16 pt-10 sm:pb-20 sm:pt-14 lg:grid-cols-2 lg:gap-16 lg:pb-24 lg:pt-20">
      <div className="order-2 lg:order-1">
        <p {...rise(active, 0)}>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-light">
            <Sparkles className="h-3.5 w-3.5" /> {badge}
          </span>
        </p>
        <h2
          className={clsx('mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl', rise(active, 1).className)}
          style={rise(active, 1).style}
        >
          {product.name}
        </h2>
        {product.short_description && (
          <p className={clsx('mt-5 max-w-lg text-base leading-relaxed text-white/65 sm:text-lg', rise(active, 2).className)} style={rise(active, 2).style}>
            {product.short_description}
          </p>
        )}
        <div className={clsx('mt-7 flex items-baseline gap-3', rise(active, 3).className)} style={rise(active, 3).style}>
          <span className="font-display text-4xl font-semibold text-gold-light">{formatCurrency(product.price)}</span>
          {discount > 0 && <span className="text-lg text-white/40 line-through">{formatCurrency(product.old_price!)}</span>}
        </div>
        <div className={clsx('mt-8 flex flex-col gap-3 sm:flex-row', rise(active, 4).className)} style={rise(active, 4).style}>
          <Link to={href} className="btn btn-gold btn-lg group">
            Shop now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link to={ROUTES.PRODUCTS} className="btn btn-outline-light btn-lg">Explore more</Link>
        </div>
        <p className={clsx('mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-white/55', rise(active, 5).className)} style={rise(active, 5).style}>
          <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-gold" /> Free delivery in 3–5 days</span>
          <span className="flex items-center gap-2"><Wallet className="h-4 w-4 text-gold" /> Cash on delivery</span>
        </p>
      </div>

      <div className="relative order-1 mx-auto w-full max-w-[300px] sm:max-w-sm lg:order-2 lg:max-w-[440px]">
        <div className="absolute -inset-4 rounded-[50%_50%_2.5rem_2.5rem/40%_40%_2.5rem_2.5rem] border border-gold/20 sm:-inset-6" aria-hidden="true" />
        <Link to={href} tabIndex={-1} className="relative block aspect-[4/5] overflow-hidden rounded-[50%_50%_2rem_2rem/40%_40%_2rem_2rem] bg-navy-3 ring-1 ring-white/10">
          <ProductImage
            imageUrl={getProductImages(product)[0]}
            imageColor={product.image_color}
            alt={product.name}
            width={960}
            sizes="(min-width: 1024px) 36vw, 80vw"
            className={clsx(active && 'animate-ken-burns')}
          />
        </Link>
        {discount > 0 && (
          <span
            className={clsx(
              'absolute -right-2 top-[18%] flex h-20 w-20 rotate-12 flex-col items-center justify-center rounded-full bg-sale text-white shadow-lift sm:-right-5 sm:h-24 sm:w-24',
              active && 'animate-scale-in'
            )}
            style={{ animationDelay: '450ms' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">Save</span>
            <span className="font-display text-2xl font-semibold leading-none sm:text-3xl">{discount}%</span>
          </span>
        )}
        <div
          className={clsx('glass-dark absolute -left-3 bottom-8 max-w-[230px] rounded-2xl p-3.5 sm:-left-8', active && 'animate-fade-in-up')}
          style={{ animationDelay: '550ms' }}
        >
          <p className="flex items-center gap-1 text-gold">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-white">{product.name}</p>
          <p className="text-xs text-white/55">{product.stock > 0 ? (product.stock <= 5 ? `Only ${product.stock} left` : 'In stock · ready to ship') : 'Back soon'}</p>
        </div>
      </div>
    </div>
  );
}

export function HeroCarousel({ products }: HeroCarouselProps) {
  const slideProducts = products.filter((p) => getProductImages(p).length > 0).slice(0, 3);
  const slides = [{ key: 'brand', label: 'The collection', product: null as Product | null }].concat(
    slideProducts.map((p) => ({ key: String(p.id), label: p.name, product: p }))
  );
  const total = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const go = useCallback((next: number) => setIndex((next + total) % total), [total]);
  const current = Math.min(index, total - 1);

  // The active progress bar's CSS animation *is* the autoplay timer: pausing it
  // (hover/focus) pauses both, and its end advances the slide.
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const autoplay = total > 1 && !reducedMotion;

  return (
    <section
      className="relative overflow-hidden bg-navy"
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > SWIPE_THRESHOLD) go(current + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      <HeroBackground />
      {/* Oversized watermark for depth */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 right-0 select-none font-display text-[22vw] font-semibold italic leading-none text-white/[.025] lg:text-[16rem]"
      >
        OQIRA
      </span>

      {/* All slides share one grid cell, so the section is as tall as the tallest slide (no layout jump). */}
      <div className="relative grid">
        {slides.map((s, i) => (
          <div
            key={s.key}
            className={clsx(
              'col-start-1 row-start-1 transition-[opacity,transform] duration-700 ease-out-expo',
              i === current ? 'translate-y-0 opacity-100' : 'pointer-events-none invisible translate-y-3 opacity-0'
            )}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${total}: ${s.label}`}
            aria-hidden={i !== current}
          >
            {s.product ? <ProductSlide product={s.product} active={i === current} /> : <BrandSlide products={products} active={i === current} />}
          </div>
        ))}
      </div>

      {total > 1 && (
        <div className="relative border-t border-white/10">
          <div className="container-page flex items-center gap-4 py-4 sm:gap-8 sm:py-5">
            <p className="shrink-0 font-display text-sm text-white/50" aria-live="polite">
              <span className="text-lg font-semibold text-white">{String(current + 1).padStart(2, '0')}</span> / {String(total).padStart(2, '0')}
            </p>
            <div className="flex flex-1 gap-3 sm:gap-6">
              {slides.map((s, i) => (
                <button
                  key={s.key}
                  onClick={() => go(i)}
                  aria-label={`Show slide ${i + 1}: ${s.label}`}
                  aria-current={i === current}
                  className="group min-w-0 flex-1 text-left"
                >
                  <span className="relative block h-[3px] overflow-hidden rounded-full bg-white/15">
                    {i === current && autoplay ? (
                      <span
                        key={current}
                        className="absolute inset-0 origin-left animate-progress rounded-full bg-gold"
                        style={{ animationDuration: `${AUTOPLAY_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }}
                        onAnimationEnd={() => go(current + 1)}
                      />
                    ) : (
                      <span className={clsx('absolute inset-0 rounded-full bg-gold transition-opacity', i === current ? 'opacity-100' : 'opacity-0 group-hover:opacity-40')} />
                    )}
                  </span>
                  <span
                    className={clsx(
                      'mt-2.5 hidden truncate text-xs font-medium transition-colors md:block',
                      i === current ? 'text-white' : 'text-white/45 group-hover:text-white/75'
                    )}
                  >
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
            <div className="hidden shrink-0 gap-2 sm:flex">
              <button onClick={() => go(current - 1)} aria-label="Previous slide" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-gold hover:bg-gold hover:text-navy">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => go(current + 1)} aria-label="Next slide" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-gold hover:bg-gold hover:text-navy">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
