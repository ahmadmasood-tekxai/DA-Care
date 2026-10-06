import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { ROUTES, STORE_NAME, STORE_TAGLINE } from '@/constants';
import { useCart } from '@/hooks/useCart';

const navLinks = [
  { to: ROUTES.HOME, label: 'Home' },
  { to: ROUTES.ABOUT, label: 'About' },
  { to: ROUTES.PRODUCTS, label: 'Products' },
];

/** Premium OQIRA Logo Mark — matches favicon, scales cleanly */
function OqiraLogoMark({ size = 44 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="hdr-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a0f0f" />
          <stop offset="100%" stopColor="#0d0a0a" />
        </linearGradient>
        <linearGradient id="hdr-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
        <linearGradient id="hdr-border" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#7a4f4f" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {/* Background rounded square */}
      <rect width="44" height="44" rx="12" fill="url(#hdr-bg)" />
      {/* Border */}
      <rect x="0.5" y="0.5" width="43" height="43" rx="11.5" stroke="url(#hdr-border)" strokeWidth="1" />
      {/* Top gold accent line */}
      <rect x="8" y="8" width="28" height="1" rx="0.5" fill="url(#hdr-gold)" />
      {/* OQ Text */}
      <text
        x="22"
        y="27.5"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="14"
        fontWeight="700"
        fill="#E8C96D"
        textAnchor="middle"
        letterSpacing="2"
      >
        OQ
      </text>
      {/* Bottom gold accent line */}
      <rect x="8" y="35" width="28" height="1" rx="0.5" fill="url(#hdr-gold)" />
    </svg>
  );
}

export function PublicHeader() {
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={`w-full transition-all duration-500 ${
        scrolled
          ? 'border-b border-black/8 bg-white/95 backdrop-blur-2xl shadow-[0_4px_24px_rgba(13,10,10,0.08)]'
          : 'border-b border-black/5 bg-white/80 backdrop-blur-xl'
      }`}
    >
      {/* Gold top accent bar */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#C9A84C]/60 to-transparent" />

      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        {/* Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-3 group" aria-label="OQIRA Home">
          <OqiraLogoMark size={44} />
          <div className="leading-tight select-none">
            <p className="font-display text-[19px] font-bold tracking-[0.05em] text-[#0d0a0a] group-hover:text-[#7a4f4f] transition-colors duration-300">
              {STORE_NAME}
            </p>
            <p className="mt-0.5 text-[8.5px] font-bold uppercase tracking-[0.22em] text-[#C9A84C]">
              {STORE_TAGLINE}
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex" role="navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                `text-sm font-semibold tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'text-[#7a4f4f] relative after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-[#C9A84C]'
                    : 'text-[#3a2e2e]/70 hover:text-[#7a4f4f]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Cart icon */}
          <Link
            to={ROUTES.CART}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#3a2e2e] transition-all hover:bg-pink-pale hover:text-[#7a4f4f]"
            aria-label="View cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-[#C9A84C] to-[#a07830] text-[9px] font-bold text-[#0d0a0a] shadow-sm">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Shop Now CTA */}
          <Link to={ROUTES.CART} className="hidden sm:block">
            <button className="btn-gold flex items-center gap-2 !py-2.5 !px-5 !text-[11px]">
              <ShoppingBag className="h-3.5 w-3.5" />
              Shop Now
            </button>
          </Link>

          {/* Mobile hamburger */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#3a2e2e] transition-all hover:bg-pink-pale md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div
        className={`overflow-hidden transition-all duration-300 md:hidden ${
          mobileOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="gold-divider mx-6" />
        <nav className="flex flex-col gap-0.5 bg-white/95 px-4 py-3">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#C9A84C]/10 text-[#7a4f4f] border-l-2 border-[#C9A84C]'
                    : 'text-[#3a2e2e] hover:bg-cream-2 hover:text-[#7a4f4f]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
