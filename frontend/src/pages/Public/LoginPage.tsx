import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';

import { getApiErrorMessage } from '@/api/client';
import { AuthField, AuthShell } from '@/components/auth/AuthShell';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { ROUTES, STORE_NAME, WHATSAPP_NUMBER_1, isStaffRole } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { User } from '@/types';
import { buildWhatsAppLink, safeNext } from '@/utils/format';

export function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'), ROUTES.ACCOUNT);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated && !submitting) {
    return <Navigate to={isStaffRole(user?.role) && next === ROUTES.ACCOUNT ? ROUTES.ADMIN_DASHBOARD : next} replace />;
  }

  const done = (signedIn: User) => {
    toast({ title: `Welcome back${signedIn.full_name ? `, ${signedIn.full_name.split(' ')[0]}` : ''}!` });
    navigate(isStaffRole(signedIn.role) && next === ROUTES.ACCOUNT ? ROUTES.ADMIN_DASHBOARD : next, { replace: true });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setSubmitting(true);
    try {
      done(await login({ username: identifier.trim(), password }));
    } catch (err) {
      setError(getApiErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      seoTitle="Sign in"
      title="Welcome back"
      subtitle={<>Sign in to track orders, see your wishlist and check out faster.</>}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthField
          id="login-identifier"
          label="Email or username"
          type="text"
          inputMode="email"
          autoComplete="username"
          autoFocus
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="you@example.com"
        />
        <AuthField
          id="login-password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          hint={
            <a
              href={buildWhatsAppLink(WHATSAPP_NUMBER_1, `Hi ${STORE_NAME}, I forgot the password for my account.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-gold-dark hover:underline"
            >
              Forgot password?
            </a>
          }
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="icon-btn h-9 w-9"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        <button type="submit" disabled={submitting} className="btn btn-primary btn-lg w-full">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitting ? 'Signing in…' : <>Sign in <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <GoogleSignInButton onSuccess={done} />

      <p className="mt-8 text-center text-sm text-navy-soft">
        New to {STORE_NAME}?{' '}
        <Link to={`${ROUTES.SIGNUP}${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-semibold text-navy underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
