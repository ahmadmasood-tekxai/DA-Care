import { Link } from 'react-router-dom';
import { ArrowRight, Bell, Heart, PackageCheck, Zap, type LucideIcon } from 'lucide-react';

import { ROUTES, STORE_NAME } from '@/constants';
import { useAuth } from '@/hooks/useAuth';

const PERKS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: PackageCheck, title: 'Live order tracking', text: 'From confirmed to delivered' },
  { icon: Bell, title: 'Email updates', text: 'Know the moment it ships' },
  { icon: Heart, title: 'Your wishlist', text: 'Saved on every visit' },
  { icon: Zap, title: '1-tap checkout', text: 'Details filled in for you' },
];

/** Account sign-up prompt — only shown to guests. */
export function MemberCta() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return null;

  return (
    <section className="bg-cream pb-6 pt-14 sm:pt-20">
      <div className="container-page">
        <div className="grid items-center gap-8 rounded-[2rem] border border-gold/25 bg-white p-6 shadow-soft sm:p-10 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
          <div>
            <p className="eyebrow mb-2">The {STORE_NAME} account</p>
            <h2 className="heading-lg">Shop smarter with a free account</h2>
            <p className="mt-3 max-w-md text-navy-soft">
              Join in seconds with your email or Google — and never wonder where your order is again.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to={ROUTES.SIGNUP} className="btn btn-primary group">
                Create free account <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to={ROUTES.LOGIN} className="btn btn-outline">I already have one</Link>
            </div>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {PERKS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-center gap-3 rounded-2xl bg-cream p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy text-gold"><Icon className="h-5 w-5" /></span>
                <span>
                  <span className="block text-sm font-semibold text-navy">{title}</span>
                  <span className="block text-xs text-navy-soft">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
