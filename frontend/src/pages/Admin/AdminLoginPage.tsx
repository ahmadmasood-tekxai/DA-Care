import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, LockKeyhole } from 'lucide-react';

import { getApiErrorMessage } from '@/api/client';
import { AuthField, AuthShell } from '@/components/auth/AuthShell';
import { ROUTES, STORE_NAME, isStaffRole } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { safeNext } from '@/utils/format';

export function AdminLoginPage() {
  const { login, logout, isAuthenticated, isStaff } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'), ROUTES.ADMIN_DASHBOARD);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated && isStaff && !isSubmitting) return <Navigate to={next} replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const user = await login({ username: username.trim(), password });
      if (!isStaffRole(user.role)) {
        logout();
        setError("This account doesn't have admin access. Shoppers can sign in from the store.");
        setIsSubmitting(false);
        return;
      }
      navigate(next.startsWith('/admin') ? next : ROUTES.ADMIN_DASHBOARD, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      variant="admin"
      seoTitle="Admin sign in"
      title={`${STORE_NAME} Admin`}
      subtitle="Sign in to manage your store."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          id="admin-username"
          label="Username or email"
          autoComplete="username"
          autoFocus
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <AuthField
          id="admin-password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          trailing={
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="icon-btn h-9 w-9" aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />
        {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
        <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg w-full">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
          {isSubmitting ? 'Signing in…' : 'Sign in securely'}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-navy-soft">
        Shopping with us?{' '}
        <Link to={ROUTES.LOGIN} className="font-semibold text-navy underline-offset-4 hover:underline">Customer sign in</Link>
      </p>
    </AuthShell>
  );
}
