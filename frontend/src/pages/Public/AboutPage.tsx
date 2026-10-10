import { Link } from 'react-router-dom';
import { ArrowRight, Award, Heart, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';

import { HeroBackground } from '@/components/common/HeroBackground';
import { PageHeader } from '@/components/common/PageHeader';
import { SEO, breadcrumbSchema } from '@/components/common/SEO';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { ROUTES, STORE_NAME, WHATSAPP_NUMBER_1 } from '@/constants';
import { buildWhatsAppLink } from '@/utils/format';

const VALUES = [
  { icon: Sparkles, title: 'Premium sourcing', desc: 'From pure cosmetic formulations to durable accessories, we only stock what we would buy ourselves.' },
  { icon: Heart, title: 'Hand-picked curation', desc: 'Every product — a statement purse or a soft baby romper — is checked for quality before it is listed.' },
  { icon: Award, title: 'Honest value', desc: 'Fair prices, clear policies and real deals. No hidden charges at checkout.' },
  { icon: ShieldCheck, title: 'Total trust', desc: 'Cash on delivery nationwide, verified bank transfers and a 7-day exchange on unused items.' },
];

const FOUNDERS = [
  { name: 'Daud Ansari', role: 'Co-Founder & CEO', initials: 'DA' },
  { name: 'Ahmad Rajpoot', role: 'Co-Founder & CEO', initials: 'AR' },
];

export function AboutPage() {
  return (
    <PublicLayout>
      <SEO
        title={`About ${STORE_NAME} — Pakistan's Trusted Premium Online Store`}
        description={`The story behind ${STORE_NAME}: premium cosmetics, jewellery, apparel and baby essentials, delivered across Pakistan with cash on delivery.`}
        canonical={ROUTES.ABOUT}
        schema={breadcrumbSchema([['Home', '/'], ['About', ROUTES.ABOUT]])}
      />

      <PageHeader
        eyebrow="Our story"
        title="Premium quality shouldn't be out of reach"
        description={`${STORE_NAME} began with a simple idea: everyone in Pakistan deserves access to genuinely premium products — and an online store they can trust.`}
        breadcrumbs={[{ label: 'Home', to: ROUTES.HOME }, { label: 'About' }]}
      />

      <section className="section bg-white">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-navy lg:aspect-square">
            <HeroBackground />
            <div className="relative flex h-full flex-col justify-end p-8 sm:p-10">
              <p className="font-display text-5xl font-semibold text-gold-light sm:text-6xl">5,000+</p>
              <p className="mt-2 max-w-xs text-white/70">customers across Pakistan who trust us with the things they love.</p>
            </div>
          </div>
          <div>
            <p className="eyebrow mb-3">Why we started</p>
            <h2 className="heading-lg">Redefining premium online shopping</h2>
            <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-navy-soft">
              <p>
                We kept seeing the same problem: finding high-quality products online in Pakistan was frustrating and inconsistent.
                Photos rarely matched reality, and trust was hard to come by.
              </p>
              <p>
                So we built a single destination — for the perfect statement necklace, a skin care routine that works, an elegant
                handbag or soft, breathable clothes for your little ones — where every product is checked before it ships.
              </p>
              <p className="font-medium text-navy">
                Every order comes with cash on delivery or verified bank transfer, so you can shop with complete peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-page">
          <div className="mx-auto mb-12 max-w-xl text-center">
            <p className="eyebrow mb-2">What we stand for</p>
            <h2 className="heading-lg">Quality today, trust tomorrow</h2>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-cream-2 text-pink-deep">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="font-body text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-soft">{desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-page">
          <div className="mx-auto mb-10 max-w-xl text-center">
            <p className="eyebrow mb-2">The people behind {STORE_NAME}</p>
            <h2 className="heading-lg">Meet the founders</h2>
          </div>
          <ul className="mx-auto grid max-w-2xl gap-5 sm:grid-cols-2">
            {FOUNDERS.map((f) => (
              <li key={f.name} className="card flex items-center gap-4 p-6">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy font-display text-lg font-semibold text-gold-light ring-2 ring-gold/30">
                  {f.initials}
                </span>
                <span>
                  <span className="block font-semibold text-navy">{f.name}</span>
                  <span className="block text-sm text-navy-soft">{f.role}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white pb-16 sm:pb-24">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[2rem] bg-navy px-6 py-14 text-center sm:px-12">
            <HeroBackground />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold text-white sm:text-5xl">Have a question before you order?</h2>
              <p className="mx-auto mt-4 max-w-lg text-white/65">
                We're a real team — message us any time for product details, sizing help or styling advice.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <a href={buildWhatsAppLink(WHATSAPP_NUMBER_1)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg">
                  <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
                </a>
                <Link to={ROUTES.PRODUCTS} className="btn btn-outline-light btn-lg">
                  Browse products <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
