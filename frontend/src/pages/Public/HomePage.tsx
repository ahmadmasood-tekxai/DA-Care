import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles as ThreeSparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Diamond,
  Heart,
  Quote,
  Sparkles,
  Star,
  Truck,
  Building,
  ShoppingBag,
  Smartphone,
  Baby
} from 'lucide-react';

import { categoriesApi } from '@/api/categories';
import { productsApi } from '@/api/products';
import { Button } from '@/components/common/Button';

import { ProductCard } from '@/components/common/ProductCard';
import { DiscountPopup } from '@/components/common/DiscountPopup';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { ROUTES, resolveIcon } from '@/constants';
import { SEO } from '@/components/common/SEO';

// ---------------------------------------------------------------------------
// Three.js Animated Background Component
// ---------------------------------------------------------------------------
function FloatingIcons() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={1} floatIntensity={2} position={[-3, 1, -2]}>
        <mesh>
          <octahedronGeometry args={[0.5]} />
          <meshStandardMaterial color="#988686" wireframe opacity={0.3} transparent />
        </mesh>
      </Float>
      <Float speed={1.5} rotationIntensity={1.5} floatIntensity={1.5} position={[3, -1, -3]}>
        <mesh>
          <dodecahedronGeometry args={[0.6]} />
          <meshStandardMaterial color="#D1D0D0" wireframe opacity={0.4} transparent />
        </mesh>
      </Float>
      <Float speed={2.5} rotationIntensity={0.5} floatIntensity={2.5} position={[0, -2, -4]}>
        <mesh>
          <icosahedronGeometry args={[0.8]} />
          <meshStandardMaterial color="#5C4E4E" wireframe opacity={0.2} transparent />
        </mesh>
      </Float>
      <ThreeSparkles count={100} scale={12} size={2} speed={0.4} opacity={0.2} color="#D1D0D0" />
      <Stars radius={10} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Page Data - Optimized for Target Niches
// ---------------------------------------------------------------------------
const categories_preview = [
  { icon: Sparkles, title: 'Premium Cosmetics', desc: 'Radiant skincare and makeup formulations for a flawless, natural glow.' },
  { icon: ShoppingBag, title: 'Luxury Hand Purses', desc: 'Elegant, designer-inspired bags that make a statement wherever you go.' },
  { icon: Diamond, title: 'Exquisite Jewellery', desc: 'Timeless ornaments crafted to perfection for your most special occasions.' },
  { icon: Smartphone, title: 'Smart Electronics', desc: 'Cutting-edge gadgets and premium accessories to elevate your lifestyle.' },
  { icon: Baby, title: 'Baby Garments', desc: 'Soft, breathable, and beautifully designed clothing for your little ones.' },
];

const whyUs = [
  { icon: Sparkles, title: 'Uncompromising Quality', desc: 'We source only the finest materials, ensuring every product exceeds your expectations.' },
  { icon: Heart, title: 'Customer First', desc: 'Your satisfaction is our priority. Experience seamless shopping with dedicated support.' },
  { icon: Building, title: 'Secure Payments', desc: 'Shop with confidence using our secure bank transfer and cash on delivery options.' },
  { icon: Truck, title: 'Fast Nationwide Delivery', desc: 'Carefully packaged and delivered straight to your doorstep across Pakistan.' },
];

const testimonials = [
  { name: 'Ayesha M.', role: 'Verified Buyer', location: 'Lahore', product: 'Gold Jewellery Set', rating: 5, quote: 'The jewellery set I ordered exceeded my expectations. The packaging was absolutely beautiful and the quality is outstanding. Will definitely be ordering again!' },
  { name: 'Sana R.', role: 'Verified Buyer', location: 'Karachi', product: 'Luxury Hand Purse', rating: 5, quote: 'I bought a luxury hand purse and some cosmetics. Absolutely in love with the premium feel! OQIRA is my new favourite store. The delivery was super fast too.' },
  { name: 'Zahra K.', role: 'Verified Buyer', location: 'Islamabad', product: 'Baby Garments', rating: 5, quote: 'The baby garments are so soft and beautifully stitched. My little one loves wearing them! Plus, my husband loves the electronics I got him. Highly recommended!' },
  { name: 'Fatima N.', role: 'Verified Buyer', location: 'Rawalpindi', product: 'Skin Care Set', rating: 5, quote: 'I was skeptical at first but after receiving my skin care order, I am totally converted. The products are genuinely premium. My skin has never looked better!' },
  { name: 'Hira A.', role: 'Verified Buyer', location: 'Faisalabad', product: 'Luxury Suit', rating: 5, quote: 'Ordered a luxury suit for Eid and it was absolutely stunning. The fabric quality is top-notch and the stitching is perfect. Got so many compliments!' },
  { name: 'Maria T.', role: 'Verified Buyer', location: 'Peshawar', product: 'Earrings Set', rating: 5, quote: 'The customer support team is so helpful! They guided me through the bank transfer process and my earrings arrived exactly as shown. Gorgeous quality.' },
  { name: 'Nadia S.', role: 'Verified Buyer', location: 'Multan', product: 'Cosmetics Bundle', rating: 5, quote: 'OQIRA has the best cosmetics I have ever bought online. The colours are true to the photos and the packaging is so luxurious. Cash on delivery made it so easy!' },
];

const faqs = [
  { q: 'How do I pay using Bank Transfer?', a: 'Select "Bank Transfer" at checkout. You will see our bank details. Transfer the amount, upload the receipt, and we will verify and process your order immediately.' },
  { q: 'Is Cash on Delivery available?', a: 'Yes, Cash on Delivery is available across Pakistan for most items.' },
  { q: 'How long does delivery take?', a: 'Standard delivery takes 3-5 working days. You will receive an email confirmation once your payment is verified and the order is dispatched.' },
  { q: 'What is your return policy?', a: 'We accept returns on unused apparel, bags, electronics, and jewellery within 7 days. Cosmetics and skin care items cannot be returned once opened for hygiene reasons.' },
];

export function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextTestimonial = useCallback(() => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevTestimonial = useCallback(() => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  // Auto-play every 4 seconds
  useEffect(() => {
    timerRef.current = setInterval(nextTestimonial, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [nextTestimonial]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(nextTestimonial, 4000);
  }, [nextTestimonial]);

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });
  const { data: featured, isLoading: loadingFeatured } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsApi.list({ is_featured: true, page_size: 4 }),
  });

  return (
    <PublicLayout>
      <SEO
        title="Online Shopping Pakistan — Cosmetics, Jewellery, Suits & Baby Clothes"
        description="OQIRA — Pakistan ka No.1 premium online store. Shop cosmetics, skin care, fine jewellery, luxury suits & baby garments online. Cash on delivery + bank transfer. Poori Pakistan delivery. Aaj hi order karein!"
        keywords="OQIRA, online shopping Pakistan, cosmetics Pakistan, skin care online, jewellery Pakistan, baby clothes online, luxury suits Pakistan, kids garments, online store Pakistan, COD Pakistan, cash on delivery, bank transfer Pakistan, makeup online, necklace earrings Pakistan, baby dress Pakistan, premium shopping, best online shop Pakistan"
        url="https://okira.vercel.app/"
        schema={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://okira.vercel.app/" }
          ]
        }}
      />
      <DiscountPopup />

      {/* HERO SECTION WITH THREE.JS BACKGROUND */}
      <section className="relative flex min-h-[95vh] items-center justify-center overflow-hidden bg-navy px-6 pb-16 pt-20 text-center">
        {/* Three.js Canvas */}
        <div className="absolute inset-0 z-0 opacity-80">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#D1D0D0" />
            <FloatingIcons />
          </Canvas>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-5xl glass-dark rounded-[2.5rem] p-8 sm:p-16 text-cream border-white/20">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-gold shadow-[0_0_15px_rgba(209,208,208,0.2)] backdrop-blur-md animate-fade-in-up">
            <Sparkles className="h-4 w-4" /> Welcome to OQIRA
          </div>
          <h1 className="text-5xl leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl font-display font-semibold text-white animate-fade-in-up drop-shadow-lg" style={{ animationDelay: '100ms' }}>
            Elevate your lifestyle <br />
            with <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-pink-pale to-gold animate-gradient bg-[length:200%_auto] italic">premium</span> essentials
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg font-light text-cream/80 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Discover our exclusive collection of flawless cosmetics, designer-inspired hand purses, exquisite jewellery, smart electronics, and comfortable baby garments. Crafted for those who demand the best.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Link to={ROUTES.PRODUCTS}>
              <button className="rounded-full bg-white px-8 py-4 text-sm font-bold uppercase tracking-widest text-navy transition-all hover:bg-gold hover:text-navy hover:scale-105 shadow-xl shadow-black/20">
                Explore The Collection
              </button>
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-8 border-t border-white/10 pt-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            {[
              { icon: Truck, label: 'Nationwide Delivery' },
              { icon: Building, label: 'Secure Bank Transfer & COD' },
              { icon: Heart, label: 'Premium Quality Guarantee' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cream/70">
                <Icon className="h-4 w-4 text-gold" /> {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES PREVIEW - NICHE HIGHLIGHTS */}
      <section className="bg-cream px-6 py-24">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="section-tag">Our Signatures</span>
          <h2 className="text-4xl sm:text-5xl font-display font-semibold text-gradient">Curated for excellence</h2>
          <p className="mt-4 text-navy-soft text-lg">Everything you need to look, feel, and live your absolute best.</p>
        </div>
        <div className="mx-auto flex flex-wrap justify-center gap-6 max-w-7xl">
          {categories_preview.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] rounded-3xl border border-navy/10 bg-white p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-pink-deep/10">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cream-2 text-pink-deep transition-colors group-hover:bg-pink-deep group-hover:text-white">
                <Icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl mb-3 font-display font-semibold text-navy">{title}</h3>
              <p className="text-sm text-navy-soft leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DYNAMIC CATEGORIES FROM DB */}
      {categories && categories.length > 0 && (
        <section className="bg-cream-2 px-6 py-24 border-y border-navy/5">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="section-tag">Shop By Category</span>
            <h2 className="text-4xl sm:text-5xl font-display font-semibold text-gradient">Explore the store</h2>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat) => {
              const Icon = resolveIcon(cat.icon);
              return (
                <Link
                  key={cat.id}
                  to={`${ROUTES.PRODUCTS}?category=${cat.slug}`}
                  className="group rounded-2xl border border-navy/10 bg-white p-6 text-center transition-all hover:border-pink-deep hover:shadow-lg"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-cream-2 text-pink-deep transition-colors group-hover:bg-pink-deep group-hover:text-white">
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} className="h-full w-full object-cover" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <h4 className="text-base font-bold text-navy">{cat.name}</h4>
                  <p className="mt-1 text-xs uppercase tracking-wider text-navy-soft">{cat.product_count} items</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="section-tag">Featured</span>
          <h2 className="text-4xl sm:text-5xl font-display font-semibold text-gradient">Handpicked for you</h2>
        </div>
        {loadingFeatured ? (
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-3xl border border-navy/10 bg-white">
                <div className="aspect-square w-full bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-3/4 rounded-full bg-slate-200" />
                  <div className="h-4 w-full rounded-full bg-slate-200" />
                  <div className="h-4 w-2/3 rounded-full bg-slate-200" />
                  <div className="mt-4 flex items-center justify-between">
                    <div className="h-6 w-1/3 rounded-full bg-slate-200" />
                    <div className="h-9 w-20 rounded-full bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : featured && featured.items.length > 0 ? (
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featured.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-navy-soft">New items arriving soon — check back shortly!</p>
        )}
        <div className="mt-12 text-center">
          <Link to={ROUTES.PRODUCTS}>
            <Button variant="secondary" size="lg">View Entire Collection</Button>
          </Link>
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-navy px-6 py-24 text-cream">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-navy bg-gold px-4 py-1.5 rounded-full mb-4">The OQIRA Standard</span>
          <h2 className="text-4xl sm:text-5xl text-white">Why choose us</h2>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-gold">
                <Icon className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
              <p className="text-sm text-cream/70 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS CAROUSEL */}
      <section className="relative overflow-hidden bg-navy px-6 py-28">
        {/* Decorative radial glow */}
        <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_50%_0%,_#D1D0D0_0%,_transparent_70%)]" />

        <div className="relative mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-16 text-center">
            <span className="section-tag">Reviews</span>
            <h2 className="text-4xl font-display font-semibold text-white sm:text-5xl mt-3">
              What our clients say
            </h2>
            <p className="mt-4 text-cream/60 text-base font-light">Real reviews from real customers across Pakistan</p>
          </div>

          {/* Carousel Track */}
          <div className="relative">
            {/* Cards wrapper */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
              >
                {testimonials.map((t) => (
                  <div key={t.name} className="w-full shrink-0 px-4 sm:px-12 lg:px-24">
                    <div className="relative rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-md p-10 sm:p-14">
                      {/* Big quote icon */}
                      <Quote className="absolute right-10 top-10 h-16 w-16 text-white/5 rotate-180" strokeWidth={1} />

                      {/* Stars */}
                      <div className="mb-6 flex gap-1">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-gold text-gold drop-shadow-sm" />
                        ))}
                      </div>

                      {/* Product pill */}
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gold mb-5">
                        {t.product}
                      </span>

                      {/* Quote text */}
                      <p className="text-xl sm:text-2xl font-display font-medium leading-relaxed text-white italic">
                        &ldquo;{t.quote}&rdquo;
                      </p>

                      {/* Author */}
                      <div className="mt-10 flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-deep to-navy border border-white/20 font-display text-lg font-bold text-white shadow-lg">
                          {t.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-white text-base">{t.name}</p>
                          <p className="text-xs text-gold/80 uppercase tracking-widest mt-0.5">{t.role} · {t.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prev / Next arrows */}
            <button
              onClick={() => { prevTestimonial(); resetTimer(); }}
              className="absolute -left-2 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white hover:text-navy hover:scale-110 sm:-left-6"
              aria-label="Previous review"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => { nextTestimonial(); resetTimer(); }}
              className="absolute -right-2 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white hover:text-navy hover:scale-110 sm:-right-6"
              aria-label="Next review"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {/* Dot indicators */}
          <div className="mt-10 flex items-center justify-center gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setActiveTestimonial(idx); resetTimer(); }}
                className={`rounded-full transition-all duration-300 ${idx === activeTestimonial
                  ? 'w-8 h-2.5 bg-gold'
                  : 'w-2.5 h-2.5 bg-white/25 hover:bg-white/50'
                  }`}
                aria-label={`Go to review ${idx + 1}`}
              />
            ))}
          </div>

          {/* Counter */}
          <p className="mt-4 text-center text-xs font-bold tracking-widest text-white/30 uppercase">
            {activeTestimonial + 1} / {testimonials.length}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="section-tag">Information</span>
          <h2 className="text-4xl sm:text-5xl">Frequently asked questions</h2>
        </div>
        <div className="mx-auto max-w-3xl divide-y divide-navy/10 border-y border-navy/10">
          {faqs.map((faq, i) => (
            <div key={faq.q}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-6 text-left font-display text-xl font-semibold text-navy hover:text-pink-deep transition-colors"
              >
                {faq.q}
                <ChevronDown className={`h-6 w-6 shrink-0 text-pink-deep transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-base text-navy-soft leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy px-6 py-32 text-center text-white border-t-8 border-gold">
        <h2 className="mx-auto max-w-2xl text-4xl font-display text-white sm:text-5xl lg:text-6xl mb-6">
          Experience the OQIRA difference today
        </h2>
        <p className="mx-auto max-w-xl text-lg text-cream/70 mb-10 font-light">
          Shop our exclusive collections of cosmetics, purses, jewellery, electronics, and baby garments.
        </p>
        <Link to={ROUTES.PRODUCTS}>
          <button className="rounded-full bg-gold px-10 py-5 text-sm font-bold uppercase tracking-widest text-navy transition-all hover:bg-white hover:scale-105 shadow-lg shadow-gold/20">
            Shop Now
          </button>
        </Link>
      </section>
    </PublicLayout>
  );
}
