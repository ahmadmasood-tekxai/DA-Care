import { NavLink } from 'react-router-dom';
import { Boxes, ExternalLink, LayoutDashboard, Package, ShoppingCart, Users, X } from 'lucide-react';
import clsx from 'clsx';

import { LogoMark } from '@/components/layout/public/Logo';
import { ROUTES, STORE_NAME } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

const navItems = [
  { to: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: ROUTES.ADMIN_ORDERS, label: 'Orders & Revenue', icon: ShoppingCart },
  { to: ROUTES.ADMIN_PRODUCTS, label: 'Products', icon: Package },
  { to: ROUTES.ADMIN_CATEGORIES, label: 'Categories', icon: Boxes },
  { to: ROUTES.ADMIN_USERS, label: 'Customers & Staff', icon: Users, adminOnly: true },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const { user } = useAuth();
  const visible = navItems.filter((item) => !item.adminOnly || user?.role === UserRole.ADMIN);

  const sidebarContent = (
    <aside className="relative flex h-full w-64 shrink-0 flex-col overflow-hidden bg-navy text-white">
      <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />

      <div className="relative flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <LogoMark size={38} />
          <div>
            <p className="font-display text-base font-bold leading-none tracking-[0.08em] text-white">{STORE_NAME}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Admin panel</p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white md:hidden" aria-label="Close sidebar">
          <X className="h-5 w-5" />
        </button>
      </div>

      <p className="relative px-6 pb-2 pt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Manage</p>
      <nav className="relative flex-1 space-y-1 px-3">
        {visible.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              clsx(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-white/[.08] text-white' : 'text-white/60 hover:bg-white/[.05] hover:text-white'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={clsx('absolute inset-y-2 left-0 w-[3px] rounded-full bg-gold transition-opacity', isActive ? 'opacity-100' : 'opacity-0')} />
                <Icon className={clsx('h-[18px] w-[18px]', isActive ? 'text-gold' : 'text-white/50 group-hover:text-white/80')} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className="relative m-3 flex items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2.5 text-xs font-semibold text-white/70 transition-colors hover:border-gold/50 hover:text-gold-light"
      >
        <ExternalLink className="h-3.5 w-3.5" /> View storefront
      </a>
    </aside>
  );

  return (
    <>
      {/* Desktop: always-visible sidebar */}
      <div className="hidden md:flex">{sidebarContent}</div>

      {/* Mobile: overlay drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 animate-fade-in bg-navy/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <div className="relative z-10 flex h-full animate-slide-in-left">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
