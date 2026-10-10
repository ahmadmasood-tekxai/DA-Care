import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, PackageCheck, ShieldCheck, Star, Zap, type LucideIcon } from 'lucide-react';

import { HeroBackground } from '@/components/common/HeroBackground';
import { ProductImage } from '@/components/common/ProductImage';
import { SEO } from '@/components/common/SEO';
import { Logo, LogoMark } from '@/components/layout/public/Logo';
import { ROUTES, STORE_NAME } from '@/constants';
import { STOREFRONT_QUERIES, useProducts } from '@/hooks/useCatalog';
import { getProductImages } from '@/utils/format';

const CUSTOMER_PERKS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: PackageCheck, title: 'Track every order', text: 'Live status from confirmed to delivered, plus email updates.' },
  { icon: Heart, title: 'Save your favourites', text: 'Build a wishlist and come back to it on any visit.' },
  { icon: Zap, title: 'Check out in seconds', text: 'Your details are filled in for you next time.' },
];

/** A few product photos for the brand panel — falls back to pure typography. */
function Collage() {
  const { data } = useProducts(STOREFRONT_QUERIES.bestsellers);
  const photos = (data?.items ?? []).map((p) => ({ p, url: getProductImages(p)[0] })).filter((x) => x.url).slice(0, 3);
  if (photos.length < 3) return null;
  return (
    <div className="mt-10 grid max-w-md grid-cols-3 gap-3">
      {photos.map(({ p, url }, i) => (
        <div
          key={p.id}
          className="aspect-[3/4] animate-fade-in-up overflow-hidden rounded-2xl bg-navy-3 ring-1 ring-white/10"
          style={{ animationDelay: `${i * 120}ms` }}
        >
          <ProductImage imageUrl={url} imageColor={p.image_color} alt="" width={320} sizes="12vw" />
        </div>
      ))}
    </div>
  );
}

interface AuthShellProps {
  title: string;
  subtitle: ReactNode;
  seoTitle: string;
  children: ReactNode;
  /** Admin login gets a quieter brand panel without shopper perks. */
  variant?: 'customer' | 'admin';
}

export function AuthShell({ title, subtitle, seoTitle, children, variant = 'customer' }: AuthShellProps) {
  const isAdmin = variant === 'admin';
  return (
    <div className="flex min-h-screen bg-cream">
      <SEO title={seoTitle} noIndex />

      {/* Brand panel */}
      <aside className="relative hidden w-[46%] max-w-[680px] flex-col justify-between overflow-hidden bg-navy p-12 text-white lg:flex xl:p-16">
        <HeroBackground />
        <Logo tone="light" className="relative" />

        <div className="relative">
          {isAdmin ? (
            <>
              <p className="eyebrow-light"><ShieldCheck className="h-3.5 w-3.5" /> Store management</p>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-tight text-white xl:text-5xl">
                Everything your store needs, <span className="italic text-gold-light">in one place</span>
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-white/60">
                Manage products and categories, verify payments, follow orders from placed to delivered and keep customers
                informed automatically by email.
              </p>
            </>
          ) : (
            <>
              <p className="eyebrow-light"><Star className="h-3.5 w-3.5" /> The {STORE_NAME} account</p>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-tight text-white xl:text-5xl">
                Premium shopping, <span className="italic text-gold-light">made personal</span>
              </h2>
              <ul className="mt-8 space-y-5">
                {CUSTOMER_PERKS.map(({ icon: Icon, title: t, text }) => (
                  <li key={t} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/25 bg-gold/10 text-gold">
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span>
                      <span className="block font-semibold text-white">{t}</span>
                      <span className="block text-sm text-white/55">{text}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <Collage />
            </>
          )}
        </div>

        <p className="relative text-xs text-white/35">
          &copy; {new Date().getFullYear()} {STORE_NAME} Pakistan · Secure sign-in
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 flex-col">
        <div className="flex items-center justify-between px-5 py-5 sm:px-10">
          <Link to={ROUTES.HOME} className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-soft transition-colors hover:text-navy">
            <ArrowLeft className="h-4 w-4" /> Back to store
          </Link>
          <span className="lg:hidden"><LogoMark size={36} /></span>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-16 sm:px-10">
          <div className="w-full max-w-[420px] animate-fade-in-up">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{title}</h1>
            <p className="mt-2 text-navy-soft">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

/** Labelled input with optional trailing slot (e.g. show-password toggle). */
export function AuthField({
  id,
  label,
  error,
  trailing,
  hint,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; error?: string; hint?: ReactNode; trailing?: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-navy">{label}</label>
        {hint}
      </div>
      <div className="relative">
        <input
          id={id}
          className={`field h-12 ${trailing ? 'pr-12' : ''} ${error ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-200' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...input}
        />
        {trailing && <span className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</span>}
      </div>
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
