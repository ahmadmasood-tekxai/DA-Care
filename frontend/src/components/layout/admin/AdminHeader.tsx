import { useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';

import { Avatar } from '@/components/layout/public/AccountMenu';
import { ROUTES, USER_ROLE_LABELS } from '@/constants';
import { useAuth } from '@/hooks/useAuth';

interface AdminHeaderProps {
  pageTitle: string;
  onMenuClick: () => void;
}

export function AdminHeader({ pageTitle, onMenuClick }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <header className="flex items-center justify-between gap-4 border-b border-navy/10 bg-white/90 px-4 py-3.5 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button onClick={onMenuClick} className="icon-btn -ml-2 md:hidden" aria-label="Open navigation menu">
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate font-display text-xl font-semibold text-navy">{pageTitle}</h1>
          <p className="hidden text-xs text-navy-soft sm:block">{today}</p>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold leading-none text-navy">{user.full_name || user.username}</p>
            <p className="mt-1 text-xs text-navy-soft">{USER_ROLE_LABELS[user.role]}</p>
          </div>
          <Avatar user={user} size="h-9 w-9 text-xs" />
          <button
            onClick={() => {
              logout();
              navigate(ROUTES.ADMIN_LOGIN, { replace: true });
            }}
            className="icon-btn hover:bg-rose-50 hover:text-rose-600"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}
    </header>
  );
}
