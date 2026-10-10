import { useId } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

import { ROUTES, STORE_NAME, STORE_TAGLINE } from '@/constants';

/** Brand mark — matches the favicon. Gradient ids are unique per instance. */
export function LogoMark({ size = 40 }: { size?: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#241a1a" />
          <stop offset="100%" stopColor="#0d0a0a" />
        </linearGradient>
        <linearGradient id={`${id}-line`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C9A84C" stopOpacity="0" />
          <stop offset="50%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="44" height="44" rx="12" fill={`url(#${id}-bg)`} />
      <rect x="0.5" y="0.5" width="43" height="43" rx="11.5" stroke="#C9A84C" strokeOpacity="0.45" />
      <rect x="8" y="8" width="28" height="1" rx="0.5" fill={`url(#${id}-line)`} />
      <text x="22" y="27.5" fontFamily="Georgia, 'Times New Roman', serif" fontSize="14" fontWeight="700" fill="#E8C96D" textAnchor="middle" letterSpacing="2">
        OQ
      </text>
      <rect x="8" y="35" width="28" height="1" rx="0.5" fill={`url(#${id}-line)`} />
    </svg>
  );
}

export function Logo({ tone = 'dark', className }: { tone?: 'dark' | 'light'; className?: string }) {
  return (
    <Link to={ROUTES.HOME} className={clsx('group flex items-center gap-2.5', className)} aria-label={`${STORE_NAME} — home`}>
      <LogoMark />
      <span className="select-none leading-none">
        <span
          className={clsx(
            'block font-display text-lg font-bold tracking-[0.08em] transition-colors sm:text-xl',
            tone === 'dark' ? 'text-navy group-hover:text-pink-deep' : 'text-white'
          )}
        >
          {STORE_NAME}
        </span>
        <span className="mt-1 hidden text-[8.5px] font-bold uppercase tracking-[0.22em] text-gold-dark sm:block">
          {STORE_TAGLINE}
        </span>
      </span>
    </Link>
  );
}
