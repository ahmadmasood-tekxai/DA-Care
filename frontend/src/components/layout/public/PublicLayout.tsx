import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

import { CartDrawer } from '@/components/cart/CartDrawer';
import { TrendingNudge } from '@/components/common/TrendingNudge';
import { AnnouncementBar } from '@/components/layout/public/AnnouncementBar';
import { PublicFooter } from '@/components/layout/public/PublicFooter';
import { PublicHeader } from '@/components/layout/public/PublicHeader';
import { ROUTES } from '@/constants';
import { useCart } from '@/hooks/useCart';

export function PublicLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { closeCart } = useCart();

  // The mini cart lives in context; don't let it follow the user to a new page.
  useEffect(() => closeCart(), [pathname, closeCart]);

  // Keep the corner nudge away from the product page's sticky buy bar and from checkout.
  const showNudge = pathname === ROUTES.HOME || pathname === ROUTES.PRODUCTS || pathname.startsWith('/categories/');

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-navy focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <AnnouncementBar />

      <div className="sticky top-0 z-50">
        <PublicHeader />
      </div>

      <main id="main" className="flex-1">
        {children}
      </main>

      <PublicFooter />
      <CartDrawer />
      {showNudge && <TrendingNudge />}
    </div>
  );
}
