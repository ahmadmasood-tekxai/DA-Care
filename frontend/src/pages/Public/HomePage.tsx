import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Camera,
  ChevronDown,
  Crown,
  Gift,
  MessageCircle,
  PartyPopper,
  PiggyBank,
  ShieldCheck,
  Shirt,
  Sparkles,
  Star,
  Truck,
  Wallet,
} from 'lucide-react';

import { categoriesApi } from '@/api/categories';
import { productsApi } from '@/api/products';
import { Button } from '@/components/common/Button';
import { Loader } from '@/components/common/Loader';
import { ProductCard } from '@/components/common/ProductCard';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { ROUTES, WHATSAPP_NUMBER_1, resolveIcon } from '@/constants';

const occasions = [
  { icon: PartyPopper, title: 'Parties & Birthdays', desc: 'Outfits that shine as bright as the birthday candles.' },
  { icon: Crown, title: 'Weddings & Family Events', desc: 'Coordinated, elegant, and ready for the family photos.' },
  { icon: Camera, title: 'Photoshoots', desc: 'Styled sets that look just as good in print as on screen.' },
  { icon: Gift, title: 'Special Occasions', desc: "For the days you'll want to remember — and dress up for." },
];

const whyUs = [
  { icon: Crown, title: 'Premium Quality Fabric', desc: 'Chosen for how it looks in photos and how it feels on skin.' },
  { icon: Sparkles, title: 'Soft & Comfortable', desc: 'No stiff collars or scratchy seams — made for little ones who move.' },
  { icon: Shirt, title: 'Stylish & Elegant Design', desc: 'Tailored details that make a one-year-old look sharp.' },
  { icon: ShieldCheck, title: 'Durable & Long Lasting', desc: 'Stitched to survive more than one event — and one wash.' },
  { icon: Star, title: 'Perfect Fit for Little Gentlemen', desc: 'Sized carefully so nothing swims or pinches on the big day.' },
  { icon: Truck, title: 'Free Delivery Available', desc: 'Ordered today, delivered to your door — no extra charge.' },
  { icon: Wallet, title: 'Cash on Delivery Available', desc: 'Pay when it arrives, so you can check the fit first.' },
  { icon: MessageCircle, title: 'Real Support, Real Fast', desc: 'Message us anytime for sizing help — a real person replies.' },
];

const testimonials = [
  { name: 'Sara Ahmed', role: 'Mother of 2, Lahore', quote: 'The waistcoat set arrived exactly like the pictures, and it fit my son perfectly for our family wedding.' },
  { name: 'Faiza Khan', role: 'Aunt, Karachi', quote: "Ordered for my nephew's first birthday shoot — the fabric felt premium and he was comfortable all session." },
  { name: 'Hina Raza', role: 'Mother, Islamabad', quote: 'Cash on delivery made it easy to trust a new shop, and the outfit exceeded what I expected for the price.' },
];

const faqs = [
  { q: 'What sizes do you offer?', a: "Our sets are available from 0–3 months up to 4 years. Message us your baby's age and we'll help you pick the right size." },
  { q: 'Is Cash on Delivery really available?', a: 'Yes — Cash on Delivery is available across Pakistan, so you can check the fit and fabric before you pay.' },
  { q: 'How long does delivery take?', a: 'Most orders arrive within 3–5 working days. Free delivery is available on all standard orders.' },
  { q: "Can I exchange the size if it doesn't fit?", a: 'Yes, unworn items in original condition can be exchanged for a different size within 7 days of delivery.' },
];

export function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });
  const { data: featured, isLoading: loadingFeatured } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsApi.list({ is_featured: true, page_size: 4 }),
  });

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_1000px_600px_at_50%_0%,#FFF1E7,#FFF9F4_70%)] px-6 pb-16 pt-20 text-center">
        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-navy/10 bg-white px-5 py-2 text-sm font-bold text-pink-deep shadow-md shadow-pink-deep/10">
            <Sparkles className="h-4 w-4" /> Premium Quality For Your Little One
          </div>
          <h1 className="text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Dress your little<br />
            <span className="text-pink-deep">gentleman</span> in style
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg font-semibold text-navy-soft">
            Premium waistcoat sets, made for the moments you'll photograph forever — birthdays, weddings, and everything in between.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link to={ROUTES.PRODUCTS}>
              <Button size="lg">
                <Shirt className="h-5 w-5" /> Shop the Collection
              </Button>
            </Link>
            <a href={`https://wa.me/${WHATSAPP_NUMBER_1}`} target="_blank" rel="noreferrer">
              <Button size="lg" variant="secondary">
                <MessageCircle className="h-5 w-5" /> Order on WhatsApp
              </Button>
            </a>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-8">
            {[
              { icon: Truck, label: 'Free Delivery Available' },
              { icon: PiggyBank, label: 'Cash on Delivery' },
              { icon: Sparkles, label: 'Premium Soft Fabric' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm font-bold text-navy-soft">
                <Icon className="h-4 w-4 text-pink-deep" /> {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OCCASIONS */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto mb-13 max-w-xl text-center">
          <span className="section-tag">Made For The Moment</span>
          <h2 className="text-3xl sm:text-4xl">Perfect for every little occasion</h2>
          <p className="mt-3 mb-5 text-navy-soft">From first birthdays to family weddings, we've got the outfit already picked out.</p>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {occasions.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-3xl border border-navy/10 bg-cream p-8 text-center transition-transform hover:-translate-y-1.5 hover:shadow-lg">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-pale text-pink-deep">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg">{title}</h3>
              <p className="mt-2 text-sm text-navy-soft">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-gradient-to-b from-cream to-pink-pale px-6 py-24">
        <div className="mx-auto mb-13 max-w-xl text-center">
          <span className="section-tag">Why Parents Love It</span>
          <h2 className="text-3xl mb-5 sm:text-4xl">Made to be worn, loved, and worn again</h2>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl bg-white p-6 shadow-md shadow-navy/5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-pink-pale text-pink-deep">
                <Icon className="h-5 w-5" />
              </div>
              <h4 className="text-base">{title}</h4>
              <p className="mt-1.5 text-xs text-navy-soft">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      {categories && categories.length > 0 && (
        <section className="bg-white px-6 py-24">
          <div className="mx-auto mb-13 max-w-xl text-center">
            <span className="section-tag">Shop By Category</span>
            <h2 className="text-3xl sm:text-4xl mb-5">Find the perfect set</h2>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat) => {
              const Icon = resolveIcon(cat.icon);
              return (
                <Link
                  key={cat.id}
                  to={`${ROUTES.PRODUCTS}?category=${cat.slug}`}
                  className="group rounded-2xl border border-navy/10 bg-cream p-6 text-center transition-all hover:-translate-y-1 hover:border-pink-deep hover:shadow-lg"
                >
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-pink-pale text-pink-deep transition-colors group-hover:bg-pink-deep group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-navy">{cat.name}</h4>
                  <p className="mt-0.5 text-xs text-navy-soft">{cat.product_count} products</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS */}
      <section className="bg-cream-2 px-6 py-24">
        <div className="mx-auto mb-13 max-w-xl text-center">
          <span className="section-tag">The Collection</span>
          <h2 className="text-3xl sm:text-4xl mb-5">Waistcoat sets for little gentlemen</h2>
        </div>
        {loadingFeatured ? (
          <Loader />
        ) : featured && featured.items.length > 0 ? (
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-navy-soft">New sets coming soon — check back shortly!</p>
        )}
        <div className="mt-10 text-center">
          <Link to={ROUTES.PRODUCTS}>
            <Button variant="secondary">View All Products</Button>
          </Link>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-gradient-to-b from-pink-pale to-cream px-6 py-24">
        <div className="mx-auto mb-13 max-w-xl text-center">
          <span className="section-tag">Parent Reviews</span>
          <h2 className="text-3xl sm:text-4xl mb-5">Loved by parents everywhere</h2>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="flex flex-col rounded-3xl bg-white p-7 shadow-md shadow-navy/5">
              <div className="mb-4 flex gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold" />
                ))}
              </div>
              <p className="flex-1 text-sm font-semibold text-navy-soft">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3 border-t border-navy/10 pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-pale font-display font-semibold text-pink-deep">
                  {t.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-extrabold text-navy">{t.name}</p>
                  <p className="text-xs text-navy-soft">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto mb-13 max-w-xl text-center">
          <span className="section-tag">Questions</span>
          <h2 className="text-3xl sm:text-4xl mb-5">Frequently asked questions</h2>
        </div>
        <div className="mx-auto max-w-2xl divide-y divide-navy/10 border-y border-navy/10">
          {faqs.map((faq, i) => (
            <div key={faq.q}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left font-display text-lg font-semibold text-navy"
              >
                {faq.q}
                <ChevronDown className={`h-5 w-5 shrink-0 text-pink-deep transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && <p className="pb-5 text-sm text-navy-soft">{faq.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy px-6 py-24 text-center text-white">
        <span className="mb-3 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-extrabold text-pink">Ready When You Are</span>
        <h2 className="mx-auto max-w-lg text-3xl text-white sm:text-4xl">Let's get your little gentleman dressed</h2>
        <p className="mx-auto mt-4 max-w-md text-white/70">
          Send us the occasion and your baby's age we'll help you choose the perfect set.
        </p>
        <div className="mt-9">
          <a href={`https://wa.me/${WHATSAPP_NUMBER_1}`} target="_blank" rel="noreferrer">
            <Button size="lg">
              <MessageCircle className="h-5 w-5" /> Order on WhatsApp
            </Button>
          </a>
        </div>
      </section>
    </PublicLayout>
  );
}
