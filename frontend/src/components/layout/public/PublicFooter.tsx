import { Link } from 'react-router-dom';
import { Heart, Mail, MapPin, Phone } from 'lucide-react';

import { ROUTES, STORE_NAME, STORE_TAGLINE, WHATSAPP_NUMBER_1, WHATSAPP_NUMBER_2 } from '@/constants';
import { HeroBackground } from '@/components/common/HeroBackground';

export function PublicFooter() {
  return (
    <footer className="relative overflow-hidden bg-navy px-6 py-16 text-white/70">
      <HeroBackground />
      <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_50%_100%,_#D1D0D0_0%,_transparent_60%)]" />
      
      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-deep to-navy-soft text-white">
              <span className="font-display text-sm font-bold">OQ</span>
            </div>
            <div>
              <p className="font-display text-lg font-bold text-white leading-none">{STORE_NAME}</p>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-pink">{STORE_TAGLINE}</p>
            </div>
          </div>
          <p className="max-w-xs text-sm text-white/60">
            Premium occasion wear for little gentlemen parties, weddings, photoshoots, and every special day in between.
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-extrabold uppercase tracking-wide text-white/50">Shop</h4>
          <div className="flex flex-col gap-2.5 text-sm">
            <Link to={ROUTES.PRODUCTS} className="hover:text-pink">Products</Link>
            <Link to={ROUTES.ABOUT} className="hover:text-pink">About Us</Link>
            <Link to={ROUTES.HOME} className="hover:text-pink">Home</Link>
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-extrabold uppercase tracking-wide text-white/50">Support</h4>
          <div className="flex flex-col gap-2.5 text-sm">
            <Link to={ROUTES.CART} className="hover:text-pink">Your Cart</Link>
            <a href={`https://wa.me/${WHATSAPP_NUMBER_1}`} target="_blank" rel="noreferrer" className="hover:text-pink">
              Order on WhatsApp
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-extrabold uppercase tracking-wide text-white/50">Contact</h4>
          <div className="flex flex-col gap-3 text-sm">
            <a href={`https://wa.me/${WHATSAPP_NUMBER_1}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-pink">
              <Phone className="h-3.5 w-3.5 shrink-0" /> +{WHATSAPP_NUMBER_1}
            </a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER_2}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-pink">
              <Phone className="h-3.5 w-3.5 shrink-0" /> +{WHATSAPP_NUMBER_2}
            </a>
            <a href="mailto:contact@oqira.com" className="flex items-center gap-2 hover:text-pink">
              <Mail className="h-3.5 w-3.5 shrink-0" /> contact@oqira.com
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0" /> Lahore Pakistan
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-6 flex max-w-6xl flex-wrap items-center justify-between gap-2 text-xs text-white/50">
        <span>&copy; {new Date().getFullYear()} {STORE_NAME}. Quality Today, Happy Tomorrow.</span>
        <span className="flex items-center gap-1.5">
          Made with <Heart className="h-3.5 w-3.5 fill-pink text-pink" /> for little gentlemen
        </span>
      </div>
    </footer>
  );
}
