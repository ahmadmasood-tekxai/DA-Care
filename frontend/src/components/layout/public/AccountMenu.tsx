import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, LayoutDashboard, LogOut, Package, UserRound } from 'lucide-react';
import clsx from 'clsx';

import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { useWishlist } from '@/hooks/useWishlist';
import type { User } from '@/types';
import { initials } from '@/utils/format';

export function Avatar({ user, size = 'h-8 w-8 text-xs' }: { user: User; size?: string }) {
  return user.profile_image ? (
    <img src={user.profile_image} alt="" referrerPolicy="no-referrer" className={clsx('shrink-0 rounded-full object-cover', size)} />
  ) : (
    <span className={clsx('flex shrink-0 items-center justify-center rounded-full bg-navy font-semibold text-gold-light', size)}>
      {initials(user.full_name || user.username)}
    </span>
  );
}

export function AccountMenu() {
  const { user, isStaff, logout } = useAuth();
  const { count } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [location.pathname, location.search]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) {
    return (
      <Link
        to={`${ROUTES.LOGIN}?next=${encodeURIComponent(location.pathname === ROUTES.HOME ? ROUTES.ACCOUNT : location.pathname)}`}
        className="icon-btn xl:w-auto xl:gap-2 xl:px-3"
        aria-label="Sign in"
      >
        <UserRound className="h-5 w-5" />
        <span className="hidden text-sm font-medium xl:inline">Sign in</span>
      </Link>
    );
  }

  const items = [
    { to: ROUTES.ACCOUNT, label: 'My orders', icon: Package },
    { to: ROUTES.WISHLIST, label: 'Wishlist', icon: Heart, badge: count || undefined },
    { to: `${ROUTES.ACCOUNT}?tab=profile`, label: 'Profile & password', icon: UserRound },
    ...(isStaff ? [{ to: ROUTES.ADMIN_DASHBOARD, label: 'Admin panel', icon: LayoutDashboard }] : []),
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="flex h-10 items-center gap-2 rounded-full p-1 transition-colors hover:bg-cream-2 xl:pr-3"
      >
        <Avatar user={user} />
        <span className="hidden max-w-[96px] truncate text-sm font-medium text-navy xl:inline">
          {user.full_name?.split(' ')[0] || user.username}
        </span>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 animate-scale-in overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-lift">
          <div className="flex items-center gap-3 border-b border-navy/[.07] bg-cream/60 px-4 py-4">
            <Avatar user={user} size="h-10 w-10 text-sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-navy">{user.full_name || user.username}</p>
              <p className="truncate text-xs text-navy-soft">{user.email}</p>
            </div>
          </div>
          <ul className="p-1.5">
            {items.map(({ to, label, icon: Icon, badge }) => (
              <li key={label}>
                <Link role="menuitem" to={to} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-navy transition-colors hover:bg-cream">
                  <Icon className="h-4 w-4 text-navy-soft" /> {label}
                  {badge && <span className="ml-auto rounded-full bg-cream-3 px-2 text-xs font-bold">{badge}</span>}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-navy/[.07] p-1.5">
            <button
              role="menuitem"
              onClick={() => {
                logout();
                setOpen(false);
                if (location.pathname.startsWith(ROUTES.ACCOUNT)) navigate(ROUTES.HOME);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rose-600 transition-colors hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
