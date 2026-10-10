import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { Loader } from '@/components/common/Loader';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';

/** Admin panel — staff only. Signed-in customers are sent to their account. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isStaff, isLoading } = useAuth();
  const { pathname } = useLocation();

  if (isLoading) return <Loader label="Checking session…" />;
  if (!isAuthenticated) return <Navigate to={`${ROUTES.ADMIN_LOGIN}?next=${encodeURIComponent(pathname)}`} replace />;
  if (!isStaff) return <Navigate to={ROUTES.ACCOUNT} replace />;

  return <>{children}</>;
}

/** Storefront account pages — any signed-in user. */
export function RequireAccount({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { pathname, search } = useLocation();

  if (isLoading) return <Loader label="Loading your account…" />;
  if (!isAuthenticated) return <Navigate to={`${ROUTES.LOGIN}?next=${encodeURIComponent(pathname + search)}`} replace />;

  return <>{children}</>;
}
