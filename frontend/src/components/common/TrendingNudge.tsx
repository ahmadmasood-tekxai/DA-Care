import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, X } from 'lucide-react';

import { ProductImage } from '@/components/common/ProductImage';
import { ROUTES } from '@/constants';
import { STOREFRONT_QUERIES, useProducts } from '@/hooks/useCatalog';
import { formatCurrency, getProductImages } from '@/utils/format';

const START_DELAY_MS = 15000;
const VISIBLE_MS = 6000;
const GAP_MS = 14000;
const MAX_SHOWS = 4;
const DISMISS_KEY = 'oqira_trending_dismissed';

/**
 * Small corner card that surfaces real bestsellers ("Trending now"), a few
 * times per visit. Dismissing it hides it for the rest of the session.
 */
export function TrendingNudge() {
  const { data } = useProducts(STOREFRONT_QUERIES.bestsellers);
  const products = (data?.items ?? []).filter((p) => p.stock > 0);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  const count = products.length;

  useEffect(() => {
    if (dismissed || count === 0) return;
    const timers: number[] = [];
    let shows = 0;

    const cycle = (i: number) => {
      if (shows >= MAX_SHOWS) return;
      // Wait while a popup, drawer or menu has the page locked.
      if (document.body.style.overflow === 'hidden') {
        timers.push(window.setTimeout(() => cycle(i), 3000));
        return;
      }
      shows += 1;
      setIndex(i % count);
      setVisible(true);
      timers.push(
        window.setTimeout(() => {
          setVisible(false);
          timers.push(window.setTimeout(() => cycle(i + 1), GAP_MS));
        }, VISIBLE_MS)
      );
    };

    timers.push(window.setTimeout(() => cycle(0), START_DELAY_MS));
    return () => timers.forEach(window.clearTimeout);
  }, [count, dismissed]);

  if (dismissed || count === 0) return null;
  const product = products[index];

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className={`fixed bottom-4 left-4 z-[70] w-[min(300px,calc(100vw-6rem))] transition-all duration-500 ease-out-expo ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
      aria-hidden={!visible}
    >
      <div className="relative flex items-center gap-3 rounded-2xl border border-navy/10 bg-white p-2.5 pr-8 shadow-lift">
        <Link to={ROUTES.PRODUCT_DETAIL(product.slug)} tabIndex={visible ? 0 : -1} className="flex min-w-0 flex-1 items-center gap-3">
          <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-cream-2">
            <ProductImage imageUrl={getProductImages(product)[0]} imageColor={product.image_color} alt="" width={120} sizes="56px" />
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-sale">
              <Flame className="h-3 w-3" /> Trending now
            </span>
            <span className="mt-0.5 block truncate text-sm font-semibold text-navy">{product.name}</span>
            <span className="block text-xs font-medium text-navy-soft">{formatCurrency(product.price)}</span>
          </span>
        </Link>
        <button
          onClick={dismiss}
          tabIndex={visible ? 0 : -1}
          className="absolute right-1.5 top-1.5 rounded-full p-1 text-navy-soft/50 transition-colors hover:bg-cream-2 hover:text-navy"
          aria-label="Hide trending products"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
