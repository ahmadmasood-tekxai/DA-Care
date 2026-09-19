import { Link } from 'react-router-dom';
import { Award, Heart, MessageCircle, ShieldCheck, Sparkles, Star } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { ROUTES, STORE_NAME, WHATSAPP_NUMBER_1 } from '@/constants';
import { SEO } from '@/components/common/SEO';

const values = [
  { icon: Sparkles, title: 'Premium Sourcing', desc: 'From pure cosmetic ingredients to durable electronics, we only source the absolute best.' },
  { icon: Heart, title: 'Hand-Picked Curation', desc: 'Every product, whether a luxury purse or baby garment, is rigorously vetted for quality.' },
  { icon: Award, title: 'Unmatched Excellence', desc: 'We deliver award-winning standards of craftsmanship across all our lifestyle collections.' },
  { icon: ShieldCheck, title: 'Total Trust', desc: 'Secure payments, transparent policies, and nationwide cash on delivery for your peace of mind.' },
];

export function AboutPage() {
  return (
    <PublicLayout>
      <SEO
        title="About OQIRA — Premium Lifestyle Brand"
        description="Learn more about OQIRA. We provide premium cosmetics, luxury purses, fine jewellery, smart electronics, and baby garments across Pakistan."
        keywords="about OQIRA, luxury brand Pakistan, premium cosmetics, fine jewellery, smart electronics, baby clothes"
      />
      <section className="bg-gradient-to-b from-cream-2 to-cream px-6 pb-20 pt-24 text-center">
        <span className="section-tag">Our Story</span>
        <h1 className="mx-auto text-base/8 max-w-3xl text-[30px] sm:text-4xl lg:text-5xl font-display font-semibold text-navy">
          Elevating your everyday lifestyle
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-navy-soft leading-relaxed">
          {STORE_NAME} started with a simple idea: true premium quality shouldn't be out of reach. From flawless cosmetics and designer-inspired hand purses, to exquisite jewellery, smart electronics, and comfortable baby garments — we curate products that bring elegance and utility to your daily life.
        </p>
      </section>

      <section className="px-6 py-20 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="aspect-square rounded-4xl bg-gradient-to-br from-pink-pale to-cream-2 p-10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-navy/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex h-full w-full items-center justify-center rounded-3xl border border-navy/10 bg-white/60 backdrop-blur-sm shadow-xl transition-transform duration-500 group-hover:scale-[1.02]">
              <Star className="h-28 w-28 text-pink-deep drop-shadow-sm" strokeWidth={1} />
            </div>
          </div>
          <div>
            <span className="section-tag">Why We Started</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold text-navy">
              Redefining premium online shopping
            </h2>
            <p className="mt-6 text-lg text-navy-soft leading-relaxed">
              We noticed a massive gap in the market for a truly premium, yet accessible online shopping experience in Pakistan. Finding high-quality products across different niches was often frustrating and inconsistent.
            </p>
            <p className="mt-4 text-lg text-navy-soft leading-relaxed">
              Whether you're looking for that perfect statement necklace, a high-end handbag, cutting-edge electronics, or soft, breathable clothes for your little ones, we wanted to build a single destination you could trust blindly.
            </p>
            <p className="mt-4 text-lg font-medium text-navy">
              Every order ships with Cash on Delivery and secure bank transfer options, ensuring you get exactly what you expect with complete peace of mind.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-cream-2 px-6 py-24 border-t border-navy/5">
        <div className="mx-auto mb-16 max-w-xl text-center">
          <span className="section-tag">What We Stand For</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold text-navy">
            Quality today, trust tomorrow
          </h2>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-3xl border border-navy/10 bg-white p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-pink-deep/10">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-pale text-pink-deep">
                <Icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-display font-semibold text-navy">{title}</h3>
              <p className="mt-3 text-sm text-navy-soft leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy px-6 py-24 text-center text-white border-t-8 border-gold relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="relative z-10">
          <h2 className="mx-auto max-w-2xl text-4xl font-display font-semibold text-white sm:text-5xl">
            Have a question before you order?
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-lg text-white/70 font-light">
            We're a real team — message us anytime for styling advice, product specs, or sizing help. We love talking to our customers.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-5">
            <a href={`https://wa.me/${WHATSAPP_NUMBER_1}`} target="_blank" rel="noreferrer">
              <Button size="lg" className="shadow-lg shadow-pink-deep/20">
                <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
              </Button>
            </a>
            <Link to={ROUTES.PRODUCTS}>
              <Button size="lg" variant="secondary" className="!border-white hover:!text-white  hover:!bg-white/10 backdrop-blur-sm">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
