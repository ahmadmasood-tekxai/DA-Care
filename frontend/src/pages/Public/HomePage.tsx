import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles as ThreeSparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  ChevronDown,
  Diamond,
  Heart,
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
import { Loader } from '@/components/common/Loader';
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
  { name: 'Ayesha M.', role: 'Verified Buyer', quote: 'The jewellery set I ordered exceeded my expectations. The packaging was beautiful and the quality is outstanding.' },
  { name: 'Sana R.', role: 'Verified Buyer', quote: 'I bought a luxury hand purse and some cosmetics. Absolutely in love with the premium feel! OQIRA is my new favorite store.' },
  { name: 'Zahra K.', role: 'Verified Buyer', quote: 'The baby garments are so soft and beautifully stitched. Plus, my husband loves the smart electronics I got him. Highly recommended!' },
];

const faqs = [
  { q: 'How do I pay using Bank Transfer?', a: 'Select "Bank Transfer" at checkout. You will see our bank details. Transfer the amount, upload the receipt, and we will verify and process your order immediately.' },
  { q: 'Is Cash on Delivery available?', a: 'Yes, Cash on Delivery is available across Pakistan for most items.' },
  { q: 'How long does delivery take?', a: 'Standard delivery takes 3-5 working days. You will receive an email confirmation once your payment is verified and the order is dispatched.' },
  { q: 'What is your return policy?', a: 'We accept returns on unused apparel, bags, electronics, and jewellery within 7 days. Cosmetics and skin care items cannot be returned once opened for hygiene reasons.' },
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
      <SEO
        title="Premium Cosmetics, Purses, Jewellery, Electronics & Baby Garments"
        description="OQIRA — Pakistan's premium lifestyle destination. Shop top-tier cosmetics, luxury hand purses, fine jewellery, smart electronics, and baby garments online."
        keywords="OQIRA, cosmetics Pakistan, luxury purses, jewellery online, smart electronics, baby garments, premium shopping Pakistan"
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
        <div className="relative z-10 mx-auto max-w-5xl glass rounded-3xl p-10 sm:p-14 border-white/10 bg-navy/40 text-cream">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-bold uppercase tracking-widest text-gold shadow-md backdrop-blur-md animate-fade-in-up">
            <Sparkles className="h-4 w-4" /> Welcome to OQIRA
          </div>
          <h1 className="text-5xl leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl font-display font-semibold text-white animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Elevate your lifestyle <br />
            with <span className="text-pink-pale italic">premium</span> essentials
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
          <h2 className="text-4xl sm:text-5xl">Curated for excellence</h2>
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
            <h2 className="text-4xl sm:text-5xl">Explore the store</h2>
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
          <h2 className="text-4xl sm:text-5xl">Handpicked for you</h2>
        </div>
        {loadingFeatured ? (
          <Loader />
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

      {/* TESTIMONIALS */}
      <section className="bg-cream-2 px-6 py-24">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="section-tag">Reviews</span>
          <h2 className="text-4xl sm:text-5xl">What our clients say</h2>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="flex flex-col rounded-3xl bg-white p-8 shadow-sm border border-navy/5">
              <div className="mb-5 flex gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold" />
                ))}
              </div>
              <p className="flex-1 text-base leading-relaxed text-navy-soft italic">"{t.quote}"</p>
              <div className="mt-6 flex items-center gap-4 border-t border-navy/10 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy font-display font-semibold text-gold">
                  {t.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="font-bold text-navy">{t.name}</p>
                  <p className="text-xs uppercase tracking-wider text-pink-deep mt-0.5">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
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
