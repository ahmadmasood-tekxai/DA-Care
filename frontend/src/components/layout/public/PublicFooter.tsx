import { Link } from 'react-router-dom';
import { Heart, MapPin, Phone, Users, ShoppingBag } from 'lucide-react';

import { ROUTES, STORE_NAME, STORE_TAGLINE, WHATSAPP_NUMBER_1, WHATSAPP_NUMBER_2 } from '@/constants';
import { HeroBackground } from '@/components/common/HeroBackground';

const founders = [
  { name: 'Daud Ansari', role: 'Co-Founder & CEO', initials: 'DA' },
  { name: 'Ahmad Rajpoot', role: 'Co-Founder & COO', initials: 'AR' },
];

/** Inline SVG logo for footer (white version) */
function OqiraLogoMark() {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="ftr-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2a1818" />
          <stop offset="100%" stopColor="#0d0a0a" />
        </linearGradient>
        <linearGradient id="ftr-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
        <linearGradient id="ftr-border" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#7a4f4f" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <rect width="46" height="46" rx="12" fill="url(#ftr-bg)" />
      <rect x="0.5" y="0.5" width="45" height="45" rx="11.5" stroke="url(#ftr-border)" strokeWidth="1" />
      <rect x="9" y="9" width="28" height="1" rx="0.5" fill="url(#ftr-gold)" />
      <text x="23" y="28.5" fontFamily="Georgia,'Times New Roman',serif" fontSize="14" fontWeight="700" fill="#E8C96D" textAnchor="middle" letterSpacing="2">OQ</text>
      <rect x="9" y="36" width="28" height="1" rx="0.5" fill="url(#ftr-gold)" />
    </svg>
  );
}

export function PublicFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#0d0a0a] px-6 py-20 text-white/65">
      <HeroBackground />

      {/* Subtle radial highlight */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(201,168,76,0.06),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(122,79,79,0.08),transparent)]" />

      {/* Top gold accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-12 border-b border-white/8 pb-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* ── Brand Column ── */}
          <div className="lg:col-span-1">
            <div className="mb-5 flex items-center gap-3">
              <OqiraLogoMark />
              <div>
                <p className="font-display text-[18px] font-bold tracking-wide text-white">{STORE_NAME}</p>
                <p className="mt-0.5 text-[8.5px] font-bold uppercase tracking-[0.22em] text-[#C9A84C]">{STORE_TAGLINE}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/55 max-w-[220px]">
              Pakistan's trusted premium online store — cosmetics, jewellery, designer purses, &amp; baby garments.
            </p>
            {/* Pakistan badge */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/8 px-3.5 py-1.5">
              <MapPin className="h-3 w-3 text-[#C9A84C]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A84C]">Pakistan</span>
            </div>
          </div>

          {/* ── Shop Column ── */}
          <div>
            <h4 className="mb-5 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/35">
              <ShoppingBag className="h-3.5 w-3.5" /> Shop
            </h4>
            <div className="flex flex-col gap-3 text-sm">
              <Link to={ROUTES.PRODUCTS} className="group flex items-center gap-2 text-white/55 transition-colors hover:text-[#C9A84C]">
                <span className="h-px w-3 bg-[#C9A84C]/0 transition-all group-hover:w-5 group-hover:bg-[#C9A84C]" />
                Products
              </Link>
              <Link to={ROUTES.ABOUT} className="group flex items-center gap-2 text-white/55 transition-colors hover:text-[#C9A84C]">
                <span className="h-px w-3 bg-[#C9A84C]/0 transition-all group-hover:w-5 group-hover:bg-[#C9A84C]" />
                About Us
              </Link>
              <Link to={ROUTES.HOME} className="group flex items-center gap-2 text-white/55 transition-colors hover:text-[#C9A84C]">
                <span className="h-px w-3 bg-[#C9A84C]/0 transition-all group-hover:w-5 group-hover:bg-[#C9A84C]" />
                Home
              </Link>
              <Link to={ROUTES.CART} className="group flex items-center gap-2 text-white/55 transition-colors hover:text-[#C9A84C]">
                <span className="h-px w-3 bg-[#C9A84C]/0 transition-all group-hover:w-5 group-hover:bg-[#C9A84C]" />
                Your Cart
              </Link>
            </div>
          </div>

          {/* ── Founders Column ── */}
          <div>
            <h4 className="mb-5 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/35">
              <Users className="h-3.5 w-3.5" /> Founders
            </h4>
            <div className="flex flex-col gap-5">
              {founders.map((f) => (
                <div key={f.name} className="flex items-center gap-3.5">
                  <div className="founder-avatar relative">
                    <span>{f.initials}</span>
                    {/* Pulse ring */}
                    <div className="absolute inset-0 rounded-full border border-[#C9A84C]/40 animate-ping opacity-30" style={{ animationDuration: '3s' }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">{f.name}</p>
                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#C9A84C]/70">{f.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Contact Column ── */}
          <div>
            <h4 className="mb-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/35">Contact</h4>
            <div className="flex flex-col gap-3.5 text-sm">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER_1}`}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 text-white/55 transition-all hover:text-[#C9A84C]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 group-hover:border-[#C9A84C]/40 group-hover:bg-[#C9A84C]/10 transition-all">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                </div>
                +{WHATSAPP_NUMBER_1}
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER_2}`}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 text-white/55 transition-all hover:text-[#C9A84C]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 group-hover:border-[#C9A84C]/40 group-hover:bg-[#C9A84C]/10 transition-all">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                </div>
                +{WHATSAPP_NUMBER_2}
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER_1}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#C9A84C] to-[#a07830] px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-[#0d0a0a] shadow-gold-sm transition-all hover:shadow-gold hover:scale-105"
              >
                Order on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-[11px] text-white/30">
          <span>&copy; {new Date().getFullYear()} {STORE_NAME} Pakistan. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            Made with <Heart className="h-3 w-3 fill-[#C9A84C] text-[#C9A84C]" /> by Daud Ansari &amp; Ahmad Rajpoot
          </span>
        </div>
      </div>
    </footer>
  );
}
