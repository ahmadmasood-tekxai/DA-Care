import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { ROUTES, STORE_NAME, STORE_TAGLINE } from '@/constants';
import { SEO } from '@/components/common/SEO';
import { authApi } from '@/api/auth';
import { GoogleSignInButton } from '@/components/common/GoogleSignInButton';

/** OQIRA Logo — light version */
function OqiraLogo() {
  return (
    <svg width="48" height="48" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="slogo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a0f0f" />
          <stop offset="100%" stopColor="#0d0a0a" />
        </linearGradient>
        <linearGradient id="slogo-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <rect width="44" height="44" rx="12" fill="url(#slogo-bg)" />
      <rect x="0.5" y="0.5" width="43" height="43" rx="11.5" stroke="#C9A84C" strokeOpacity="0.5" strokeWidth="1" />
      <rect x="8" y="8" width="28" height="1" rx="0.5" fill="url(#slogo-gold)" />
      <text x="22" y="27.5" fontFamily="Georgia, serif" fontSize="14" fontWeight="700" fill="#E8C96D" textAnchor="middle" letterSpacing="2">OQ</text>
      <rect x="8" y="35" width="28" height="1" rx="0.5" fill="url(#slogo-gold)" />
    </svg>
  );
}

export function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || name.trim().length < 3) {
      setError('Name must be at least 3 characters.');
      return;
    }
    if (!username.trim() || username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.register({ username: username.trim(), email, password, full_name: name.trim() });
      navigate(ROUTES.LOGIN);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Registration failed. Try a different email or username.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <SEO title="Create Account — OQIRA" description="Create your OQIRA account to save favourites and track orders." />

      {/* Left decorative panel */}
      <div className="hidden lg:flex w-1/2 relative bg-[#0d0a0a] flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(122,79,79,0.10),transparent_60%)]" />
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg,#C9A84C 0,#C9A84C 1px,transparent 0,transparent 50%)', backgroundSize: '30px 30px' }}
        />
        <div className="relative z-10 flex flex-col items-center gap-6 px-12 text-center">
          <OqiraLogo />
          <h1 className="font-display text-4xl font-bold text-white tracking-widest">{STORE_NAME}</h1>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#C9A84C]/80">{STORE_TAGLINE}</p>
          <div className="mt-6 h-px w-24 bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/40">
            Join thousands of happy customers and get exclusive access to new arrivals &amp; offers.
          </p>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
            <OqiraLogo />
            <p className="font-display text-xl font-bold text-[#0d0a0a] tracking-widest">{STORE_NAME}</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">Create an account</h2>
          <p className="mt-1 text-sm text-gray-500">Save favourites &amp; track your orders</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sara Ahmed"
                  minLength={3}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#C9A84C] focus:bg-white focus:ring-2 focus:ring-[#C9A84C]/20"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Username</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  placeholder="sara_ahmed"
                  minLength={3}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-8 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#C9A84C] focus:bg-white focus:ring-2 focus:ring-[#C9A84C]/20"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#C9A84C] focus:bg-white focus:ring-2 focus:ring-[#C9A84C]/20"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  minLength={6}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-12 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#C9A84C] focus:bg-white focus:ring-2 focus:ring-[#C9A84C]/20"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0d0a0a] py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#1a1010] hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account…' : <>Create Account <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Google - uses GIS popup, no redirect_uri needed */}
          <GoogleSignInButton width={384} />

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="font-semibold text-[#C9A84C] hover:text-[#a07830] transition-colors">
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center">
            <Link to={ROUTES.HOME} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">← Back to store</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
