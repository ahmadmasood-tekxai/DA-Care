import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, Heart, LogOut, Menu, MessageCircle, Package, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import clsx from 'clsx';

import { AccountMenu, Avatar } from '@/components/layout/public/AccountMenu';
import { Logo } from '@/components/layout/public/Logo';
import { ROUTES, WHATSAPP_NUMBER_1, resolveIcon } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useCategories } from '@/hooks/useCatalog';
import { useOverlay } from '@/hooks/useOverlay';
import { useWishlist } from '@/hooks/useWishlist';
import { buildWhatsAppLink } from '@/utils/format';
import type { CategoryWithCount } from '@/types';

const NAV_LINKS = [
  { to: ROUTES.HOME, label: 'Home', end: true },
  { to: ROUTES.PRODUCTS, label: 'Shop All', end: true },
  { to: `${ROUTES.PRODUCTS}?deals=1`, label: 'Deals', end: false },
  { to: ROUTES.ABOUT, label: 'About', end: true },
];

function CategoryThumb({ category, size = 'h-9 w-9' }: { category: CategoryWithCount; size?: string }) {
  const Icon = resolveIcon(category.icon);
  return (
    <span className={clsx('flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cream-2 text-pink-deep', size)}>
      {category.image_url ? (
        <img src={category.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
    </span>
  );
}

function SearchForm({ autoFocus, onDone, className }: { autoFocus?: boolean; onDone?: () => void; className?: string }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const urlQuery = params.get('search') ?? '';
  const [value, setValue] = useState(urlQuery);
  const inputId = useId();

  // Mirror the URL so clearing a search elsewhere clears the box too.
  useEffect(() => setValue(urlQuery), [urlQuery]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    navigate(q ? `${ROUTES.PRODUCTS}?search=${encodeURIComponent(q)}` : ROUTES.PRODUCTS);
    onDone?.();
  };

  return (
    <form role="search" onSubmit={submit} className={clsx('relative', className)}>
      <label htmlFor={inputId} className="sr-only">Search products</label>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-soft/60" />
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search products…"
        autoFocus={autoFocus}
        enterKeyHint="search"
        className="h-10 w-full rounded-full border border-navy/10 bg-cream/70 pl-10 pr-4 text-sm text-navy placeholder:text-navy-soft/50 transition-colors focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/20"
      />
    </form>
  );
}

export function PublicHeader() {
  const { itemCount, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, logout } = useAuth();
  const { data: categories } = useCategories();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const catsRef = useRef<HTMLDivElement>(null);

  useOverlay(menuOpen, () => setMenuOpen(false));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close every popover on navigation.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setCatsOpen(false);
  }, [location.pathname, location.search]);

  // Close the categories menu on outside click / Escape.
  useEffect(() => {
    if (!catsOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!catsRef.current?.contains(e.target as Node)) setCatsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setCatsOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [catsOpen]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    clsx(
      'relative py-2 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-gold after:transition-transform',
      isActive ? 'text-navy after:scale-x-100' : 'text-navy-soft/80 after:scale-x-0 hover:text-navy hover:after:scale-x-100'
    );

  const isDealsActive = location.pathname === ROUTES.PRODUCTS && new URLSearchParams(location.search).has('deals');

  return (
    <header
      className={clsx(
        'border-b bg-white/90 backdrop-blur-xl transition-shadow duration-300 supports-[backdrop-filter]:bg-white/80',
        scrolled ? 'border-navy/10 shadow-soft' : 'border-transparent'
      )}
    >
      <div className="container-page flex h-16 items-center gap-3 lg:h-[72px] lg:gap-8">
        <button className="icon-btn -ml-2 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}>
          <Menu className="h-5 w-5" />
        </button>

        <Logo className="max-lg:flex-1 max-lg:justify-center lg:shrink-0" />

        {/* Desktop navigation */}
        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.slice(0, 2).map((l) => (
            <NavLink key={l.label} to={l.to} end={l.end} className={navLinkClass}>
              {l.label}
            </NavLink>
          ))}

          {categories && categories.length > 0 && (
            <div ref={catsRef} className="relative">
              <button
                type="button"
                onClick={() => setCatsOpen((v) => !v)}
                aria-expanded={catsOpen}
                aria-haspopup="true"
                className={clsx(
                  'flex items-center gap-1 py-2 text-sm font-medium transition-colors',
                  catsOpen || location.pathname.startsWith('/categories/') ? 'text-navy' : 'text-navy-soft/80 hover:text-navy'
                )}
              >
                Categories <ChevronDown className={clsx('h-4 w-4 transition-transform', catsOpen && 'rotate-180')} />
              </button>
              {catsOpen && (
                <div className="absolute left-1/2 top-full z-50 mt-3 w-[min(560px,80vw)] -translate-x-1/2 animate-scale-in rounded-2xl border border-navy/10 bg-white p-3 shadow-lift">
                  <ul className="grid grid-cols-2 gap-x-2 gap-y-3">
                    {categories.map((cat) => (
                      <li key={cat.id} className={clsx(categories.length === 1 && 'col-span-2')}>
                        <Link
                          to={ROUTES.CATEGORY_PAGE(cat.slug)}
                          className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-cream"
                        >
                          <CategoryThumb category={cat} />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-navy">{cat.name}</span>
                            <span className="block text-xs text-navy-soft/70">{cat.product_count} products</span>
                          </span>
                        </Link>
                        {cat.subcategories?.length > 0 && (
                          <ul className={clsx('mt-1 grid gap-0.5 pl-14', categories.length === 1 && 'grid-cols-2')}>
                            {cat.subcategories.map((sub) => (
                              <li key={sub.id}>
                                <Link
                                  to={`${ROUTES.CATEGORY_PAGE(cat.slug)}?sub=${sub.id}`}
                                  className="block truncate rounded-lg px-2 py-1.5 text-[13px] text-navy-soft transition-colors hover:bg-cream hover:text-navy"
                                >
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={ROUTES.PRODUCTS}
                    className="mt-2 flex items-center justify-center rounded-xl bg-cream py-2.5 text-xs font-bold uppercase tracking-wider text-navy transition-colors hover:bg-cream-2"
                  >
                    Browse all products
                  </Link>
                </div>
              )}
            </div>
          )}

          <NavLink to={NAV_LINKS[2].to} className={() => navLinkClass({ isActive: isDealsActive })}>
            <span className="text-sale">Deals</span>
          </NavLink>
          <NavLink to={ROUTES.ABOUT} end className={navLinkClass}>
            About
          </NavLink>
        </nav>

        <div className="flex items-center gap-1 lg:ml-auto lg:gap-3">
          <SearchForm className="hidden w-56 xl:block xl:w-72" />
          <button
            className="icon-btn xl:hidden"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label={searchOpen ? 'Close search' : 'Search'}
            aria-expanded={searchOpen}
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>
          <Link to={ROUTES.WISHLIST} className="icon-btn relative max-sm:hidden" aria-label={`Wishlist, ${wishlistCount} items`}>
            <Heart className={clsx('h-5 w-5', wishlistCount > 0 && 'fill-rose-500 text-rose-500')} />
            {wishlistCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-navy px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </Link>
          <AccountMenu />
          <button onClick={openCart} className="icon-btn relative -mr-2 lg:mr-0" aria-label={`Open cart, ${itemCount} items`}>
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-navy ring-2 ring-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search row (mobile / tablet) */}
      {searchOpen && (
        <div className="container-page animate-fade-in pb-3 xl:hidden">
          <SearchForm autoFocus onDone={() => setSearchOpen(false)} />
        </div>
      )}

      {/* Mobile drawer — portalled: the header's backdrop-filter would otherwise trap `fixed` children */}
      {menuOpen && createPortal(
        <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 animate-fade-in bg-navy/50 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm animate-slide-in-left flex-col bg-white shadow-lift">
            <div className="flex h-16 items-center justify-between border-b border-navy/10 px-4">
              <Logo />
              <button className="icon-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-3 py-4">
              {user ? (
                <div className="mb-4 rounded-2xl bg-cream p-3">
                  <div className="flex items-center gap-3 px-1">
                    <Avatar user={user} size="h-10 w-10 text-sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-navy">{user.full_name || user.username}</p>
                      <p className="truncate text-xs text-navy-soft">{user.email}</p>
                    </div>
                    <button onClick={logout} className="icon-btn h-9 w-9 text-rose-600 hover:bg-rose-50" aria-label="Sign out">
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link to={ROUTES.ACCOUNT} className="flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-medium text-navy">
                      <Package className="h-4 w-4" /> Orders
                    </Link>
                    <Link to={ROUTES.WISHLIST} className="flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-medium text-navy">
                      <Heart className="h-4 w-4" /> Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mb-4 rounded-2xl bg-navy p-4 text-white">
                  <p className="flex items-center gap-2 font-display text-lg"><UserRound className="h-5 w-5 text-gold" /> Your account</p>
                  <p className="mt-1 text-xs text-white/60">Track orders, save favourites and check out faster.</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link to={ROUTES.LOGIN} className="btn btn-gold btn-sm">Sign in</Link>
                    <Link to={ROUTES.SIGNUP} className="btn btn-outline-light btn-sm">Join free</Link>
                  </div>
                </div>
              )}
              <ul className="space-y-0.5">
                {NAV_LINKS.map((l) => (
                  <li key={l.label}>
                    <NavLink
                      to={l.to}
                      end={l.end}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center rounded-xl px-3 py-3 text-[15px] font-medium transition-colors',
                          (l.label === 'Deals' ? isDealsActive : isActive) ? 'bg-cream text-navy' : 'text-navy-soft hover:bg-cream',
                          l.label === 'Deals' && 'text-sale'
                        )
                      }
                    >
                      {l.label}
                    </NavLink>
                  </li>
                ))}
                {!user && (
                  <li>
                    <NavLink to={ROUTES.WISHLIST} className={({ isActive }) => clsx('flex items-center gap-2 rounded-xl px-3 py-3 text-[15px] font-medium transition-colors', isActive ? 'bg-cream text-navy' : 'text-navy-soft hover:bg-cream')}>
                      Wishlist{wishlistCount > 0 && <span className="rounded-full bg-cream-3 px-2 text-xs font-bold text-navy">{wishlistCount}</span>}
                    </NavLink>
                  </li>
                )}
              </ul>

              {categories && categories.length > 0 && (
                <>
                  <p className="eyebrow mb-2 mt-6 px-3">Categories</p>
                  <ul className="space-y-0.5">
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <Link to={ROUTES.CATEGORY_PAGE(cat.slug)} className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-cream">
                          <CategoryThumb category={cat} size="h-8 w-8" />
                          <span className="flex-1 text-sm font-medium text-navy">{cat.name}</span>
                          <span className="text-xs text-navy-soft/60">{cat.product_count}</span>
                        </Link>
                        {cat.subcategories?.length > 0 && (
                          <ul className="mb-1 ml-7 border-l border-navy/10 pl-4">
                            {cat.subcategories.map((sub) => (
                              <li key={sub.id}>
                                <Link
                                  to={`${ROUTES.CATEGORY_PAGE(cat.slug)}?sub=${sub.id}`}
                                  className="block rounded-lg px-2 py-2 text-sm text-navy-soft transition-colors hover:bg-cream hover:text-navy"
                                >
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </nav>

            <div className="pb-safe border-t border-navy/10 p-4">
              <a href={buildWhatsAppLink(WHATSAPP_NUMBER_1)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp w-full">
                <MessageCircle className="h-4 w-4" /> Order on WhatsApp
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
