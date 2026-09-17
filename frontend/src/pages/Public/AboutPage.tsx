import { Link } from 'react-router-dom';
import { Award, Heart, MessageCircle, Recycle, Ruler, Sparkles } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { ROUTES, STORE_NAME, WHATSAPP_NUMBER_1 } from '@/constants';
import { SEO } from '@/components/common/SEO';

const values = [
  { icon: Sparkles, title: 'Premium Fabric', desc: 'Every set is cut from a soft, breathable blend chosen for comfort, not just looks.' },
  { icon: Ruler, title: 'Careful Sizing', desc: 'From 0–3 months to 4 years — sized so nothing swims or pinches on the big day.' },
  { icon: Award, title: 'Built to Last', desc: "Stitched to survive more than one event, and more than one wash — genuinely durable." },
  { icon: Recycle, title: 'Worn Again & Again', desc: 'Made for real toddlers who move, sit, and crawl — not just for photos.' },
];

export function AboutPage() {
  return (
    <PublicLayout>
      <SEO
        title="About Us"
        description="Learn more about OQIRA, our mission, and our commitment to providing premium skin care, jewellery, and luxury apparel."
        keywords="about OQIRA, luxury brand Pakistan, premium quality, mission, values"
      />
      <section className="bg-gradient-to-b from-cream-2 to-cream px-6 pb-20 pt-24 text-center">
        <span className="section-tag">Our Story</span>
        <h1 className="mx-auto max-w-2xl text-4xl sm:text-5xl">Little gentlemen deserve great style too</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-navy-soft">
          {STORE_NAME} started with a simple idea: baby occasion wear should feel as good as it looks. No stiff
          collars, no scratchy seams — just premium waistcoat sets made for the moments parents photograph forever.
        </p>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="aspect-square rounded-4xl bg-gradient-to-br from-pink-pale to-cream-2 p-10">
            <div className="flex h-full w-full items-center justify-center rounded-3xl border border-navy/10 bg-white/60">
              <Heart className="h-24 w-24 text-pink-deep" strokeWidth={1.2} />
            </div>
          </div>
          <div>
            <span className="section-tag">Why We Started</span>
            <h2 className="text-3xl sm:text-4xl">Made by parents, for parents</h2>
            <p className="mt-4 text-navy-soft">
              We noticed that baby "formal wear" was either uncomfortable, poorly stitched, or absurdly expensive
              for something worn once. So we built sets that are soft enough for a toddler to nap in, sharp enough
              for a wedding, and affordable enough to buy for every occasion that comes up.
            </p>
            <p className="mt-4 text-navy-soft">
              Every set ships with Cash on Delivery and free delivery across Pakistan, because we want you to see
              and feel the quality before you commit.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto mb-13 max-w-xl text-center">
          <span className="section-tag">What We Stand For</span>
          <h2 className="text-3xl sm:text-4xl">Quality today, happy tomorrow</h2>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-3xl border border-navy/10 bg-cream p-7 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-pale text-pink-deep">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="text-base">{title}</h3>
              <p className="mt-2 text-sm text-navy-soft">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy px-6 py-20 text-center text-white">
        <h2 className="mx-auto max-w-lg text-3xl text-white sm:text-4xl">Have a question before you order?</h2>
        <p className="mx-auto mt-4 max-w-md text-white/70">We're a real team — message us anytime for sizing help or styling advice.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a href={`https://wa.me/${WHATSAPP_NUMBER_1}`} target="_blank" rel="noreferrer">
            <Button size="lg">
              <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
            </Button>
          </a>
          <Link to={ROUTES.PRODUCTS}>
            <Button size="lg" variant="secondary" className="!border-white !text-white hover:!bg-white/10">
              Browse Products
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
