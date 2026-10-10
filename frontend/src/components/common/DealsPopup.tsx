import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag, X } from 'lucide-react';

import { HeroBackground } from '@/components/common/HeroBackground';
import { ProductImage } from '@/components/common/ProductImage';
import { ROUTES } from '@/constants';
import { STOREFRONT_QUERIES, useProducts } from '@/hooks/useCatalog';
import { useOverlay } from '@/hooks/useOverlay';
import { formatCurrency, getDiscountPercent, getProductImages } from '@/utils/format';

const STORAGE_KEY = 'oqira_deals_popup_seen_at';
const SHOW_AFTER_MS = 9000;
const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000; // once every 3 days

function recentlySeen(): boolean {
  try {
    const seenAt = Number(localStorage.getItem(STORAGE_KEY));
    return !!seenAt && Date.now() - seenAt < SNOOZE_MS;
  } catch {
    return false;
  }
}

/**
 * Promotes products that are genuinely on sale (old_price > price). It only
 * appears when such deals exist, at most once every few days — after a short
 * delay or when a desktop visitor moves to leave the page.
 */
export function DealsPopup() {
  const [open, setOpen] = useState(false);
  const { data } = useProducts(STOREFRONT_QUERIES.deals);

  const deals = (data?.items ?? []).filter((p) => p.stock > 0 && getDiscountPercent(p) > 0);
  const hasDeals = deals.length > 0;
  const maxDiscount = Math.max(0, ...deals.map(getDiscountPercent));

  const close = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  }, []);

  useOverlay(open, close);

  useEffect(() => {
    if (!hasDeals || recentlySeen()) return;
    const show = () => setOpen(true);
    const timer = window.setTimeout(show, SHOW_AFTER_MS);
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      window.clearTimeout(timer);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, [hasDeals]);

  if (!open || !hasDeals) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="deals-title">
      <div className="absolute inset-0 animate-fade-in bg-navy/60 backdrop-blur-sm" onClick={close} />

      <div className="relative grid max-h-[92vh] w-full max-w-3xl animate-slide-up overflow-hidden rounded-t-3xl bg-white shadow-lift sm:animate-scale-in sm:grid-cols-[1fr_1.15fr] sm:rounded-3xl">
        <button
          onClick={close}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy shadow-soft transition-colors hover:bg-white sm:bg-cream"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Offer panel */}
        <div className="relative overflow-hidden bg-navy px-6 py-8 text-white sm:px-8 sm:py-10">
          <HeroBackground />
          <div className="relative">
            <p className="eyebrow-light"><Tag className="h-3.5 w-3.5" /> Limited-time deals</p>
            <h2 id="deals-title" className="mt-3 font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Save up to <span className="text-gold-light">{maxDiscount}%</span> on selected favourites
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              Handpicked pieces at reduced prices — with free delivery and cash on delivery across Pakistan.
            </p>
            <Link to={`${ROUTES.PRODUCTS}?deals=1`} onClick={close} className="btn btn-gold mt-6 w-full sm:w-auto">
              Shop all deals <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Deal list */}
        <ul className="divide-y divide-navy/[.07] overflow-y-auto px-5 py-2 sm:px-6 sm:py-4">
          {deals.slice(0, 3).map((p) => (
            <li key={p.id}>
              <Link to={ROUTES.PRODUCT_DETAIL(p.slug)} onClick={close} className="group flex items-center gap-4 py-3">
                <span className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-cream-2">
                  <ProductImage imageUrl={getProductImages(p)[0]} imageColor={p.image_color} alt={p.name} width={160} sizes="64px" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-sm font-semibold text-navy group-hover:text-pink-deep">{p.name}</span>
                  <span className="mt-1 flex items-baseline gap-2">
                    <span className="text-sm font-bold text-navy">{formatCurrency(p.price)}</span>
                    <span className="text-xs text-navy-soft/60 line-through">{formatCurrency(p.old_price!)}</span>
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-sale/10 px-2.5 py-1 text-xs font-bold text-sale">
                  -{getDiscountPercent(p)}%
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body
  );
}
