import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, ShoppingBag, X } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { ROUTES, STORE_NAME, STORE_TAGLINE } from '@/constants';
import { useCart } from '@/hooks/useCart';

const navLinks = [
  { to: ROUTES.HOME, label: 'Home' },
  { to: ROUTES.ABOUT, label: 'About' },
  { to: ROUTES.PRODUCTS, label: 'Products' },
];

export function PublicHeader() {
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/40 bg-white/70 backdrop-blur-xl shadow-lg shadow-navy/5">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to={ROUTES.HOME} className="flex items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-pink-deep to-navy text-white">
            <span className="font-display text-sm font-bold">OQ</span>
          </div>
          <div className="leading-tight">
            <p className="font-display text-lg font-bold text-navy">{STORE_NAME}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-deep to-navy">{STORE_TAGLINE}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-bold text-navy-soft md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) => (isActive ? 'text-pink-deep' : 'hover:text-pink-deep transition-colors')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to={ROUTES.CART}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-navy hover:bg-pink-pale"
            aria-label="View cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-pink-deep text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
          <Link to={ROUTES.CART} className="hidden sm:block">
            <Button size="sm" variant="navy">
              <ShoppingBag className="h-4 w-4" /> Shop Now
            </Button>
          </Link>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-navy hover:bg-pink-pale md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-navy/10 bg-cream px-6 py-4 md:hidden">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-bold text-navy-soft hover:bg-pink-pale"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
