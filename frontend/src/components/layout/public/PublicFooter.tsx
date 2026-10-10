import { Link } from 'react-router-dom';
import { Building2, Mail, MessageCircle, Phone, RefreshCcw, ShieldCheck, Truck, Wallet } from 'lucide-react';

import { HeroBackground } from '@/components/common/HeroBackground';
import { Logo } from '@/components/layout/public/Logo';
import { ROUTES, STORE_NAME, STORE_PROMISES, SUPPORT_EMAIL, WHATSAPP_NUMBER_1, WHATSAPP_NUMBER_2 } from '@/constants';
import { useCategories } from '@/hooks/useCatalog';
import { buildWhatsAppLink } from '@/utils/format';

const PROMISES = [
  { icon: Truck, title: 'Free delivery', text: STORE_PROMISES.delivery },
  { icon: Wallet, title: 'Cash on delivery', text: 'Pay when it arrives' },
  { icon: RefreshCcw, title: 'Easy exchange', text: 'Within 7 days of delivery' },
  { icon: ShieldCheck, title: 'Secure checkout', text: 'COD or bank transfer' },
];

const FOUNDERS = [
  { name: 'Daud Ansari', role: 'Co-Founder & CEO' },
  { name: 'Ahmad Rajpoot', role: 'Co-Founder & CEO' },
];

const formatPhone = (n: string) => `+${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5)}`;

function FooterHeading({ children }: { children: string }) {
  return <h2 className="mb-4 font-body text-xs font-bold uppercase tracking-[0.2em] text-white/40">{children}</h2>;
}

const linkClass = 'text-sm text-white/65 transition-colors hover:text-gold-light';

export function PublicFooter() {
  const { data: categories } = useCategories();

  return (
    <footer className="relative overflow-hidden bg-navy text-white">
      <HeroBackground className="opacity-60" />

      {/* Promise strip */}
      <div className="relative border-b border-white/10">
        <ul className="container-page grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 py-8 lg:grid-cols-4">
          {PROMISES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-white">{title}</span>
                <span className="block text-xs text-white/50">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="container-page relative grid grid-cols-2 gap-x-6 gap-y-10 py-14 md:grid-cols-4 lg:grid-cols-12">
        <div className="col-span-2 md:col-span-4 lg:col-span-4">
          <Logo tone="light" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/55">
            Pakistan's trusted premium store for cosmetics, skin care, jewellery, apparel and baby essentials — carefully
            curated and delivered to your door.
          </p>
          <a href={buildWhatsAppLink(WHATSAPP_NUMBER_1)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm mt-6">
            <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
          </a>
        </div>

        <div className="lg:col-span-2">
          <FooterHeading>Shop</FooterHeading>
          <ul className="space-y-2.5">
            <li><Link to={ROUTES.PRODUCTS} className={linkClass}>All products</Link></li>
            <li><Link to={`${ROUTES.PRODUCTS}?deals=1`} className={linkClass}>Deals</Link></li>
            {categories?.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link to={ROUTES.CATEGORY_PAGE(c.slug)} className={linkClass}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <FooterHeading>Help</FooterHeading>
          <ul className="space-y-2.5">
            <li><Link to={ROUTES.ACCOUNT} className={linkClass}>Track your order</Link></li>
            <li><Link to={ROUTES.WISHLIST} className={linkClass}>Wishlist</Link></li>
            <li><Link to={ROUTES.CART} className={linkClass}>Your cart</Link></li>
            <li><Link to={`${ROUTES.HOME}#faq`} className={linkClass}>FAQs</Link></li>
            <li><Link to={ROUTES.ABOUT} className={linkClass}>About us</Link></li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <FooterHeading>Contact</FooterHeading>
          <ul className="space-y-2.5">
            {[WHATSAPP_NUMBER_1, WHATSAPP_NUMBER_2].map((n) => (
              <li key={n}>
                <a href={buildWhatsAppLink(n)} target="_blank" rel="noopener noreferrer" className={`${linkClass} inline-flex items-center gap-2`}>
                  <Phone className="h-3.5 w-3.5 text-gold" /> {formatPhone(n)}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${SUPPORT_EMAIL}`} className={`${linkClass} inline-flex items-start gap-2`}>
                <Mail className="mt-1 h-3.5 w-3.5 shrink-0 text-gold" />
                {/* Let long addresses wrap after the @, never mid-word. */}
                <span>{SUPPORT_EMAIL.split('@')[0]}@<wbr />{SUPPORT_EMAIL.split('@')[1]}</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <FooterHeading>Founders</FooterHeading>
          <ul className="space-y-3">
            {FOUNDERS.map((f) => (
              <li key={f.name}>
                <p className="text-sm font-semibold text-white">{f.name}</p>
                <p className="text-xs text-white/45">{f.role}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-6 text-xs text-white/40 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} {STORE_NAME} Pakistan. All rights reserved.</p>
          <ul className="flex items-center gap-2" aria-label="Payment methods">
            <li className="flex items-center gap-1.5 rounded-md border border-white/15 px-2.5 py-1 text-white/60">
              <Wallet className="h-3.5 w-3.5" /> Cash on delivery
            </li>
            <li className="flex items-center gap-1.5 rounded-md border border-white/15 px-2.5 py-1 text-white/60">
              <Building2 className="h-3.5 w-3.5" /> Bank transfer
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
