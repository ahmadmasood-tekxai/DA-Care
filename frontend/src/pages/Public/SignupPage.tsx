import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import clsx from 'clsx';

import { getApiErrorMessage } from '@/api/client';
import { AuthField, AuthShell } from '@/components/auth/AuthShell';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { ROUTES, STORE_NAME } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { User } from '@/types';
import { safeNext } from '@/utils/format';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Field = 'name' | 'email' | 'password';

function validate(v: Record<Field, string>): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};
  if (v.name.trim().length < 2) errors.name = 'Please enter your name.';
  if (!EMAIL_RE.test(v.email.trim())) errors.email = 'Enter a valid email address.';
  if (v.password.length < 8) errors.password = 'Use at least 8 characters.';
  return errors;
}

/** 0–4 — length, mixed case, digits, symbols. */
function strength(pw: string): number {
  if (!pw) return 0;
  let score = pw.length >= 8 ? 1 : 0;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  else if (/\d/.test(pw)) score += 0.5;
  return Math.min(4, Math.floor(score));
}

const STRENGTH_LABELS = ['Too short', 'Fair', 'Good', 'Strong', 'Excellent'];
const STRENGTH_COLORS = ['bg-rose-400', 'bg-amber-400', 'bg-gold', 'bg-emerald-500', 'bg-emerald-600'];

export function SignupPage() {
  const { register, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'), ROUTES.ACCOUNT);

  const [values, setValues] = useState<Record<Field, string>>({ name: '', email: '', password: '' });
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated && !submitting) return <Navigate to={next} replace />;

  const errors = touched ? validate(values) : {};
  const score = strength(values.password);
  const set = (field: Field) => (e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const done = (user: User, isNew = true) => {
    const first = user.full_name?.split(' ')[0];
    toast({
      title: isNew ? `Welcome to ${STORE_NAME}${first ? `, ${first}` : ''}!` : 'Signed in',
      description: isNew ? 'Your account is ready — we sent you a welcome email.' : undefined,
    });
    navigate(next, { replace: true });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setServerError('');
    const found = validate(values);
    if (Object.keys(found).length) {
      document.getElementById(`signup-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setSubmitting(true);
    try {
      done(await register({ full_name: values.name.trim(), email: values.email.trim(), password: values.password }));
    } catch (err) {
      setServerError(getApiErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      seoTitle="Create your account"
      title="Create your account"
      subtitle={<>Join {STORE_NAME} for order tracking, a personal wishlist and faster checkout.</>}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthField id="signup-name" label="Full name" autoComplete="name" autoFocus value={values.name} onChange={set('name')} placeholder="e.g. Sara Ahmed" error={errors.name} />
        <AuthField id="signup-email" label="Email" type="email" inputMode="email" autoComplete="email" value={values.email} onChange={set('email')} placeholder="you@example.com" error={errors.email} />
        <div>
          <AuthField
            id="signup-password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={values.password}
            onChange={set('password')}
            placeholder="At least 8 characters"
            error={errors.password}
            trailing={
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="icon-btn h-9 w-9" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          {values.password && (
            <div className="mt-2.5 flex items-center gap-3" aria-live="polite">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={clsx('h-1 flex-1 rounded-full transition-colors', i < Math.max(1, score) ? STRENGTH_COLORS[score] : 'bg-navy/10')} />
                ))}
              </div>
              <span className="w-20 text-right text-xs font-medium text-navy-soft">{STRENGTH_LABELS[score]}</span>
            </div>
          )}
        </div>

        {serverError && (
          <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {serverError}{' '}
            {serverError.toLowerCase().includes('already exists') && (
              <Link to={ROUTES.LOGIN} className="font-semibold underline">Sign in instead</Link>
            )}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn btn-primary btn-lg w-full">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitting ? 'Creating account…' : <>Create account <ArrowRight className="h-4 w-4" /></>}
        </button>

        <ul className="grid gap-1.5 text-xs text-navy-soft sm:grid-cols-2">
          {['Free to join', 'Order updates by email', 'Save your favourites', 'Faster checkout'].map((perk) => (
            <li key={perk} className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> {perk}</li>
          ))}
        </ul>
      </form>

      <GoogleSignInButton text="signup_with" onSuccess={(u) => done(u, Date.now() - new Date(u.created_at).getTime() < 60_000)} />

      <p className="mt-8 text-center text-sm text-navy-soft">
        Already have an account?{' '}
        <Link to={`${ROUTES.LOGIN}${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-semibold text-navy underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
