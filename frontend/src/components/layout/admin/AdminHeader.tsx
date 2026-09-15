import { LogOut, Menu, User as UserIcon } from 'lucide-react';

import { USER_ROLE_LABELS } from '@/constants';
import { useAuth } from '@/hooks/useAuth';

interface AdminHeaderProps {
  pageTitle: string;
  onMenuClick: () => void;
}

export function AdminHeader({ pageTitle, onMenuClick }: AdminHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-navy/10 bg-white px-4 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-navy-soft hover:bg-pink-pale hover:text-pink-deep md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-display text-lg font-semibold text-navy">{pageTitle}</h1>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold leading-none text-navy">{user.full_name || user.username}</p>
            <p className="mt-0.5 text-xs text-navy-soft">{USER_ROLE_LABELS[user.role]}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-pale text-pink-deep">
            <UserIcon className="h-4 w-4" />
          </div>
          <button
            onClick={logout}
            className="rounded-lg p-2 text-navy-soft hover:bg-pink-pale hover:text-pink-deep"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}
    </header>
  );
}
