import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Flame,
  Gem,
  Heart,
  MessageCircle,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Truck,
  Users,
} from 'lucide-react';

import { Carousel } from '@/components/common/Carousel';
import { DealsPopup } from '@/components/common/DealsPopup';
import { HeroBackground } from '@/components/common/HeroBackground';
import { ProductRail } from '@/components/common/ProductRail';
import { SEO } from '@/components/common/SEO';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { MarqueeBand } from '@/components/home/MarqueeBand';
import { MemberCta } from '@/components/home/MemberCta';
import { PromoBanners } from '@/components/home/PromoBanners';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { ROUTES, STORE_DESCRIPTION, STORE_NAME, WHATSAPP_NUMBER_1, resolveIcon } from '@/constants';
import { STOREFRONT_QUERIES, useCategories, useProducts } from '@/hooks/useCatalog';
import { ProductImage } from '@/components/common/ProductImage';
import type { Product } from '@/types';
import { buildWhatsAppLink, getProductImages } from '@/utils/format';

// ---------------------------------------------------------------------------
// Static content
// ---------------------------------------------------------------------------
const STATS = [
  { icon: Users, value: '5,000+', label: 'Happy customers' },
  { icon: Star, value: '4.9 / 5', label: 'Average rating' },
  { icon: BadgeCheck, value: '100%', label: 'Authentic products' },
  { icon: Truck, value: '3–5 days', label: 'Nationwide delivery' },
];

const WHY_US = [
  { icon: Gem, title: 'Uncompromising quality', desc: 'Every product is vetted for materials, finish and authenticity before it reaches you.' },
  { icon: Heart, title: 'Customer first', desc: 'A real team on WhatsApp — from choosing the right piece to tracking your parcel.' },
  { icon: ShieldCheck, title: 'Pay your way', desc: 'Cash on delivery nationwide, or bank transfer with quick verification.' },
  { icon: Truck, title: 'Delivered with care', desc: 'Gift-ready packaging, delivered to your door in 3–5 working days.' },
];

const TESTIMONIALS = [
  { name: 'Ayesha M.', location: 'Lahore', product: 'Gold Jewellery Set', quote: 'The jewellery set exceeded my expectations. Beautiful packaging and outstanding quality — I will definitely order again!' },
  { name: 'Sana R.', location: 'Karachi', product: 'Luxury Hand Purse', quote: 'Absolutely in love with the premium feel of my purse and cosmetics. Delivery was super fast too.' },
  { name: 'Zahra K.', location: 'Islamabad', product: 'Baby Garments', quote: 'The baby garments are so soft and beautifully stitched. My little one loves wearing them!' },
  { name: 'Fatima N.', location: 'Rawalpindi', product: 'Skin Care Set', quote: 'I was skeptical at first, but the products are genuinely premium. My skin has never looked better.' },
  { name: 'Hira A.', location: 'Faisalabad', product: 'Luxury Suit', quote: 'Ordered a suit for Eid — the fabric is top-notch and the stitching is perfect. So many compliments!' },
  { name: 'Maria T.', location: 'Peshawar', product: 'Earrings Set', quote: 'Support guided me through the bank transfer, and my earrings arrived exactly as shown. Gorgeous.' },
];

const FAQS = [
  { q: 'How do I pay using bank transfer?', a: 'Choose "Bank Transfer" at checkout and you will see our account details. Transfer the amount, then upload your receipt — we verify it and process your order right away.' },
  { q: 'Is cash on delivery available?', a: 'Yes. Cash on delivery is available across Pakistan — no advance payment needed, you pay when your order arrives.' },
  { q: 'How long does delivery take?', a: 'Delivery takes 3–5 working days nationwide. You will hear from us once your order is confirmed and dispatched.' },
  { q: 'What is your return policy?', a: 'Unused apparel, bags and jewellery can be exchanged within 7 days of delivery. Opened cosmetics and skin care cannot be returned for hygiene reasons.' },
  { q: 'Can I order on WhatsApp?', a: 'Of course. Every product page has an "Order on WhatsApp" button, or message us directly and our team will place the order for you.' },
];

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------
function StatsBar() {
  return (
    <section aria-label="Why customers trust us" className="border-b border-navy/[.07] bg-white">
      <ul className="container-page grid grid-cols-2 divide-navy/[.07] lg:grid-cols-4 lg:divide-x">
        {STATS.map(({ icon: Icon, value, label }) => (
          <li key={label} className="flex items-center justify-center gap-3 px-2 py-5 sm:py-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-2 text-pink-deep">
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <span>
              <span className="block font-display text-lg font-semibold leading-none text-navy sm:text-xl">{value}</span>
              <span className="mt-1 block text-[11px] font-medium uppercase tracking-wider text-navy-soft/70">{label}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

interface Tile {
  key: string;
  name: string;
  to: string;
  image?: string | null;
  icon: string;
  meta?: string;
}

/**
 * Category tiles. With only a few top-level categories, their subcategories are
 * shown too so the row stays useful; tiles without an uploaded image borrow a
 * photo from a product already loaded on the page.
 */
function CategoriesSection({ productPool }: { productPool: Product[] }) {
  const { data: categories, isLoading } = useCategories();
  if (!isLoading && !categories?.length) return null;

  const photoFor = (match: (p: Product) => boolean) => {
    const p = productPool.find(match);
    return p ? getProductImages(p)[0] : null;
  };

  const tiles: Tile[] = [];
  const expand = (categories?.length ?? 0) < 4;
  for (const cat of categories ?? []) {
    tiles.push({
      key: `c${cat.id}`,
      name: expand ? `All ${cat.name}` : cat.name,
      to: ROUTES.CATEGORY_PAGE(cat.slug),
      image: cat.image_url || photoFor((p) => p.category_id === cat.id),
      icon: cat.icon,
      meta: `${cat.product_count} items`,
    });
    if (expand) {
      for (const sub of cat.subcategories ?? []) {
        tiles.push({
          key: `s${sub.id}`,
          name: sub.name,
          to: `${ROUTES.CATEGORY_PAGE(cat.slug)}?sub=${sub.id}`,
          image: sub.image_url || photoFor((p) => p.subcategory_id === sub.id),
          icon: sub.icon,
        });
      }
    }
  }

  const slide = 'w-[42%] sm:w-[28%] md:w-[22%] lg:w-[15.8%]';

  return (
    <section className="section bg-cream">
      <div className="container-page">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">Shop by category</p>
            <h2 className="heading-lg">Find what you love</h2>
          </div>
          <Link to={ROUTES.PRODUCTS} className="group hidden items-center gap-1.5 text-sm font-semibold text-navy hover:text-pink-deep sm:inline-flex">
            All products <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`shrink-0 ${slide}`}>
                <div className="skeleton aspect-[4/5] rounded-2xl" />
                <div className="skeleton mx-auto mt-3 h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <Carousel ariaLabel="Categories" slideClassName={slide}>
            {tiles.map((tile) => {
              const Icon = resolveIcon(tile.icon);
              return (
                <Link key={tile.key} to={tile.to} className="group block text-center">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br from-cream-2 to-cream-3 ring-1 ring-navy/[.06] transition-all duration-300 group-hover:shadow-card group-hover:ring-gold/40">
                    {tile.image ? (
                      <ProductImage
                        imageUrl={tile.image}
                        alt=""
                        width={400}
                        sizes="(min-width: 1024px) 16vw, 42vw"
                        className="transition-transform duration-700 ease-out-expo group-hover:scale-105"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-pink-deep/70">
                        <Icon className="h-10 w-10" strokeWidth={1.25} />
                      </span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <h3 className="mt-3 font-body text-sm font-semibold text-navy group-hover:text-pink-deep">{tile.name}</h3>
                  {tile.meta && <p className="text-xs text-navy-soft/70">{tile.meta}</p>}
                </Link>
              );
            })}
          </Carousel>
        )}
      </div>
    </section>
  );
}

function WhyUsSection() {
  return (
    <section className="relative overflow-hidden bg-navy py-16 text-white sm:py-24">
      <HeroBackground />
      <div className="container-page relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="eyebrow-light mb-3"><ShieldCheck className="h-3.5 w-3.5" /> The {STORE_NAME} standard</p>
          <h2 className="font-display text-3xl font-semibold leading-tight text-white sm:text-5xl">
            Premium shopping, <span className="italic text-gold-light">without the guesswork</span>
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-white/60">
            We started {STORE_NAME} so that quality never has to be a gamble. Every order is checked, packed with care and
            backed by people you can actually talk to.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to={ROUTES.ABOUT} className="btn btn-outline-light">Our story</Link>
            <a href={buildWhatsAppLink(WHATSAPP_NUMBER_1)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
              <MessageCircle className="h-4 w-4" /> Talk to us
            </a>
          </div>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {WHY_US.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="rounded-2xl border border-white/10 bg-white/[.04] p-6 backdrop-blur-sm transition-colors hover:border-gold/30 hover:bg-white/[.06]">
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-gold/25 bg-gold/10 text-gold">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-body text-base font-semibold text-white">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/55">{desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="section bg-white">
      <div className="container-page">
        <div className="mx-auto mb-10 max-w-xl text-center">
          <p className="eyebrow mb-2">Customer love</p>
          <h2 className="heading-lg">What our customers say</h2>
          <p className="mt-3 flex items-center justify-center gap-2 text-sm text-navy-soft">
            <span className="flex">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}
            </span>
            Rated 4.9 out of 5 by customers across Pakistan
          </p>
        </div>
        <Carousel ariaLabel="Customer reviews" slideClassName="w-[88%] sm:w-[48%] lg:w-[32%]" autoPlayMs={6000} showDots>
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="flex h-full flex-col rounded-2xl border border-navy/[.07] bg-cream/60 p-6 sm:p-7">
              <Quote className="h-8 w-8 text-gold/50" strokeWidth={1.5} />
              <blockquote className="mt-4 flex-1 font-display text-lg leading-relaxed text-navy">“{t.quote}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-navy/[.07] pt-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy font-display text-sm font-semibold text-gold-light">
                  {t.name.split(' ').map((n) => n[0]).join('')}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-navy">{t.name}</span>
                  <span className="block text-xs text-navy-soft/70">{t.location} · {t.product}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section id="faq" className="section scroll-mt-24 bg-cream">
      <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow mb-2">Need to know</p>
          <h2 className="heading-lg">Frequently asked questions</h2>
          <p className="mt-4 max-w-sm text-navy-soft">Can't find your answer? Our team usually replies on WhatsApp within minutes.</p>
          <a href={buildWhatsAppLink(WHATSAPP_NUMBER_1)} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-6">
            <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
          </a>
        </div>
        <div className="divide-y divide-navy/10 border-y border-navy/10">
          {FAQS.map((faq, i) => (
            <details key={faq.q} className="group" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-display text-lg font-semibold text-navy transition-colors hover:text-pink-deep [&::-webkit-details-marker]:hidden">
                {faq.q}
                <ChevronDown className="h-5 w-5 shrink-0 text-pink-deep transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <p className="pb-5 pr-8 text-[15px] leading-relaxed text-navy-soft">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="bg-cream pb-16 sm:pb-24">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[2rem] bg-navy px-6 py-12 text-center sm:px-12 sm:py-16">
          <HeroBackground />
          <div className="relative mx-auto max-w-2xl">
            <p className="eyebrow-light justify-center"><Sparkles className="h-3.5 w-3.5" /> New arrivals every week</p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-white sm:text-5xl">
              Treat yourself to something <span className="italic text-gold-light">beautiful</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-white/60">
              Free delivery, cash on delivery and 7-day exchange on every order across Pakistan.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to={ROUTES.PRODUCTS} className="btn btn-gold btn-lg">
                Start shopping <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={buildWhatsAppLink(WHATSAPP_NUMBER_1)} target="_blank" rel="noopener noreferrer" className="btn btn-outline-light btn-lg">
                Order via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export function HomePage() {
  const { data: categories } = useCategories();
  const deals = useProducts(STOREFRONT_QUERIES.deals);
  const bestsellers = useProducts(STOREFRONT_QUERIES.bestsellers);
  const newArrivals = useProducts(STOREFRONT_QUERIES.newArrivals);

  const onSale = deals.data?.items.filter((p) => p.old_price && p.old_price > p.price);
  const productPool = [...(bestsellers.data?.items ?? []), ...(newArrivals.data?.items ?? []), ...(deals.data?.items ?? [])];

  return (
    <PublicLayout>
      <SEO
        title={`${STORE_NAME} — Online Shopping in Pakistan | Cosmetics, Jewellery & Baby Clothes`}
        description={STORE_DESCRIPTION}
        keywords="online shopping Pakistan, cosmetics Pakistan, skin care Pakistan, jewellery Pakistan, baby clothes Pakistan, cash on delivery Pakistan"
        canonical="/"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }}
      />
      <DealsPopup />

      <HeroCarousel products={bestsellers.data?.items ?? []} />
      <StatsBar />
      <CategoriesSection productPool={productPool} />
      <PromoBanners deals={onSale} bestsellers={bestsellers.data?.items} newArrivals={newArrivals.data?.items} />

      {(deals.isLoading || (onSale && onSale.length > 0)) && (
        <section className="section border-y border-sale/10 bg-gradient-to-b from-[#fff5ef] to-white">
          <div className="container-page">
            <ProductRail
              eyebrow={<span className="text-sale"><Tag className="mr-1 inline h-3.5 w-3.5" /> Limited-time deals</span>}
              title="Deals you'll love"
              subtitle="The biggest savings in the store right now — while stocks last."
              products={onSale}
              isLoading={deals.isLoading}
              categories={categories}
              viewAllTo={`${ROUTES.PRODUCTS}?deals=1`}
              viewAllLabel="Shop all deals"
            />
          </div>
        </section>
      )}

      <section className="section bg-white">
        <div className="container-page">
          <ProductRail
            eyebrow={<><Flame className="h-3.5 w-3.5" /> Bestsellers</>}
            title="Customer favourites"
            subtitle="Our most-loved pieces, chosen again and again."
            products={bestsellers.data?.items}
            isLoading={bestsellers.isLoading}
            categories={categories}
            viewAllTo={ROUTES.PRODUCTS}
          />
        </div>
      </section>

      <MarqueeBand />
      <WhyUsSection />

      <section className="section bg-cream">
        <div className="container-page">
          <ProductRail
            eyebrow={<><Sparkles className="h-3.5 w-3.5" /> Just in</>}
            title="New arrivals"
            subtitle="Fresh additions to the collection."
            products={newArrivals.data?.items}
            isLoading={newArrivals.isLoading}
            categories={categories}
            viewAllTo={ROUTES.PRODUCTS}
          />
        </div>
      </section>

      <TestimonialsSection />
      <MemberCta />
      <FaqSection />
      <ClosingCta />
    </PublicLayout>
  );
}
