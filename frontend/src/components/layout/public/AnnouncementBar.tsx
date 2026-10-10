import { useEffect, useState } from 'react';
import { BadgeCheck, MessageCircle, RefreshCcw, Truck, Wallet, type LucideIcon } from 'lucide-react';

import { STORE_PROMISES, WHATSAPP_NUMBER_1 } from '@/constants';
import { buildWhatsAppLink } from '@/utils/format';

const MESSAGES: { icon: LucideIcon; text: string; href?: string }[] = [
  { icon: Wallet, text: STORE_PROMISES.cod },
  { icon: Truck, text: `Free delivery · ${STORE_PROMISES.delivery.toLowerCase()}` },
  { icon: RefreshCcw, text: STORE_PROMISES.exchange },
  { icon: MessageCircle, text: 'Questions? Chat with us on WhatsApp', href: buildWhatsAppLink(WHATSAPP_NUMBER_1) },
];

/** Thin top bar: all promises side by side on desktop, rotating one-at-a-time on mobile. */
export function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 4000);
    return () => window.clearInterval(id);
  }, []);

  const current = MESSAGES[index];
  const CurrentIcon = current.icon;

  return (
    <div className="bg-navy text-white/80">
      <div className="container-page flex h-9 items-center justify-center text-[11px] font-medium tracking-wide sm:text-xs">
        {/* Mobile: one rotating message */}
        <p key={index} className="flex animate-fade-in items-center gap-2 lg:hidden">
          <CurrentIcon className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
          {current.href ? (
            <a href={current.href} target="_blank" rel="noopener noreferrer" className="hover:text-gold-light">
              {current.text}
            </a>
          ) : (
            current.text
          )}
        </p>

        {/* Desktop: all at once */}
        <ul className="hidden w-full items-center justify-between lg:flex">
          {MESSAGES.map(({ icon: Icon, text, href }) => (
            <li key={text} className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
              {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-gold-light">
                  {text}
                </a>
              ) : (
                text
              )}
            </li>
          ))}
          <li className="flex items-center gap-2">
            <BadgeCheck className="h-3.5 w-3.5 text-gold" aria-hidden="true" /> 100% original products
          </li>
        </ul>
      </div>
    </div>
  );
}
