import { NavLink } from 'react-router-dom';
import { Boxes, ExternalLink, LayoutDashboard, Package, ShoppingCart, X } from 'lucide-react';
import clsx from 'clsx';

import { ROUTES, STORE_NAME } from '@/constants';

const navItems = [
  { to: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: ROUTES.ADMIN_CATEGORIES, label: 'Categories', icon: Boxes },
  { to: ROUTES.ADMIN_PRODUCTS, label: 'Products', icon: Package },
  { to: ROUTES.ADMIN_ORDERS, label: 'Orders & Revenue', icon: ShoppingCart },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const sidebarContent = (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-navy/10 bg-white">
      <div className="flex items-center justify-between border-b border-navy/10 px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-deep to-navy text-white">
            <span className="font-display text-xs font-bold">OQ</span>
          </div>
          <div>
            <p className="font-display text-sm font-bold leading-none text-navy">{STORE_NAME}</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-pink-deep">Admin Panel</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-navy-soft hover:bg-cream-2 md:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors',
                isActive ? 'bg-pink-pale text-pink-deep' : 'text-navy-soft hover:bg-cream-2 hover:text-navy'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className="m-3 flex items-center justify-center gap-2 rounded-lg border border-navy/15 px-3 py-2.5 text-xs font-bold text-navy-soft hover:bg-cream-2"
      >
        <ExternalLink className="h-3.5 w-3.5" /> View Storefront
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
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="relative z-10 flex h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
