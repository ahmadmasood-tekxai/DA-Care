import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Check, MessageCircle, Minus, Plus, ShieldCheck, ShoppingBag, Truck, Wallet, Link2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { productsApi } from '@/api/products';
import { Button } from '@/components/common/Button';
import { ProductImage } from '@/components/common/ProductImage';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { PRODUCT_BADGE_LABELS, ROUTES, WHATSAPP_NUMBER_1, resolveIcon } from '@/constants';
import { ProductBadge } from '@/types';
import { useCart } from '@/hooks/useCart';
import { SEO } from '@/components/common/SEO';
import { formatCurrency } from '@/utils/format';
import { ProductCard } from '@/components/common/ProductCard';
import { HeroBackground } from '@/components/common/HeroBackground';


// ---------------------------------------------------------------------------
// Skeleton: full page layout mirroring the real product detail page
// ---------------------------------------------------------------------------
function ProductDetailSkeleton() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Back button */}
        <div className="mb-6 h-5 w-32 animate-pulse rounded-full bg-slate-200" />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Left — image + thumbnails */}
          <div>
            <div className="aspect-square w-full animate-pulse rounded-4xl bg-slate-200" />
            <div className="mt-4 flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 w-20 animate-pulse rounded-xl bg-slate-200" />
              ))}
            </div>
          </div>

          {/* Right — info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-28 animate-pulse rounded-full bg-slate-200" />
              <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
            </div>
            <div className="h-9 w-3/4 animate-pulse rounded-full bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded-full bg-slate-200" />
            <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-200" />
            <div className="h-8 w-1/3 animate-pulse rounded-full bg-slate-200" />
            <div className="h-5 w-40 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-4 flex gap-4">
              <div className="h-11 w-32 animate-pulse rounded-full bg-slate-200" />
              <div className="h-11 flex-1 animate-pulse rounded-full bg-slate-200" />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-navy/10 pt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-5 w-full animate-pulse rounded-full bg-slate-200" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}


export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getBySlug(slug!),
    enabled: !!slug,
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ['products', 'related', product?.category?.slug],
    queryFn: () => productsApi.list({ category_slug: product?.category?.slug, page_size: 5 }),
    enabled: !!product?.category?.slug,
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  function handleAddToCart() {
    if (!product) return;
    addItem(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  if (isLoading || !product) {
    return <ProductDetailSkeleton />;
  }

  const CategoryIcon = resolveIcon(product.category.icon);
  const fallbackMainImage = product.image_url || (product.images && product.images.length > 0 ? product.images[0].url : '');
  const allImages = [fallbackMainImage, ...(product.images?.map(i => i.url) || [])]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i) as string[];
  const currentMainImage = selectedImage ?? fallbackMainImage;

  return (
    <PublicLayout>
      <SEO
        title={product ? `${product.name} — Buy Online Pakistan | OQIRA` : 'Product Detail'}
        description={product
          ? `${product.name} — Rs. ${product.price}. ${product.short_description || ''} OQIRA par khareeden — COD + bank transfer. Pakistan bhar delivery. Aaj hi order karein!`
          : 'Discover premium products at OQIRA. Nationwide delivery in Pakistan.'}
        keywords={product ? `${product.name}, ${product.name} Pakistan, ${product.category?.name || ''} Pakistan, buy ${product.name} online, OQIRA, online shopping Pakistan, COD Pakistan` : 'OQIRA'}
        url={`https://okira.vercel.app/products/${product?.slug}`}
        image={product?.image_url || undefined}
        schema={product ? {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "description": product.short_description || product.description || '',
          "image": product.image_url || '',
          "brand": { "@type": "Brand", "name": "OQIRA" },
          "sku": String(product.id),
          "offers": {
            "@type": "Offer",
            "url": `https://okira.vercel.app/products/${product.slug}`,
            "priceCurrency": "PKR",
            "price": String(product.price),
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition",
            "seller": { "@type": "Organization", "name": "OQIRA" },
            "shippingDetails": {
              "@type": "OfferShippingDetails",
              "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "PKR" },
              "deliveryTime": { "@type": "ShippingDeliveryTime", "businessDays": { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] } }
            }
          },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://okira.vercel.app/" },
              { "@type": "ListItem", "position": 2, "name": product.category?.name, "item": `https://okira.vercel.app/products?category=${product.category?.slug}` },
              { "@type": "ListItem", "position": 3, "name": product.name, "item": `https://okira.vercel.app/products/${product.slug}` }
            ]
          }
        } : undefined}
      />
      {/* DARK HERO */}
      <section className="relative overflow-hidden bg-navy px-6 pb-12 pt-28 text-center">
        <HeroBackground />
        <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_50%_0%,_#D1D0D0_0%,_transparent_60%)]" />
        <div className="relative z-10">
          {product?.category && (
            <span className="section-tag animate-fade-in-up">{product.category.name}</span>
          )}
          <h1 className="mt-3 text-3xl font-display font-semibold tracking-tight text-white sm:text-5xl max-w-3xl mx-auto leading-tight animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            {product?.name || 'Product Detail'}
          </h1>
          {product && (
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2 text-xs font-bold uppercase tracking-widest text-gold backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Rs. {product.price.toLocaleString()} · {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          )}
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <button
          onClick={() => navigate(ROUTES.PRODUCTS)}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-navy-soft hover:text-pink-deep"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </button>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Left Column: Image + Gallery */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-4xl border border-navy/10 bg-cream-2">
              {product.stock <= 0 ? (
                <span className="absolute left-4 top-4 z-10 rounded-full bg-slate-800 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-widest text-white shadow-lg">
                  Out of Stock
                </span>
              ) : product.badge !== ProductBadge.NONE ? (
                <span className="absolute left-4 top-4 z-10 rounded-full bg-pink-deep px-3.5 py-1.5 text-xs font-extrabold text-white">
                  {PRODUCT_BADGE_LABELS[product.badge]}
                </span>
              ) : null}
              <ProductImage
                imageUrl={currentMainImage}
                imageColor={product.image_color}
                alt={product.name}
                className={product.stock <= 0 ? 'opacity-60 grayscale' : ''}
              />
            </div>

            {allImages.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${currentMainImage === img ? 'border-pink-deep opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Info */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <Link
                to={`${ROUTES.PRODUCTS}?category=${product.category.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-pink-pale px-3.5 py-1.5 text-xs font-bold text-pink-deep hover:bg-pink"
              >
                <CategoryIcon className="h-3.5 w-3.5" /> {product.category.name}
              </Link>
              <button
                onClick={handleCopyLink}
                className="relative flex h-8 w-8 items-center justify-center rounded-full bg-cream-2 text-navy transition-colors hover:bg-pink-deep hover:text-white"
                title="Copy Link"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Link2 className="h-4 w-4" />}
                {copied && (
                  <span className="absolute -top-8 right-0 animate-fade-in-up whitespace-nowrap rounded bg-navy px-2 py-1 text-[10px] font-bold text-white">
                    Copied!
                  </span>
                )}
              </button>
            </div>

            <h1 className="font-display text-3xl font-semibold text-navy sm:text-4xl">{product.name}</h1>
            <p className="mt-3 text-navy-soft">{product.short_description}</p>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-3xl font-semibold text-navy">{formatCurrency(product.price)}</span>
              {product.old_price && (
                <span className="text-lg text-slate-400 line-through">{formatCurrency(product.old_price)}</span>
              )}
            </div>

            {product.description && <p className="mt-5 text-sm leading-relaxed text-navy-soft">{product.description}</p>}

            <div className="mt-6 flex items-center gap-2 text-sm font-semibold">
              {product.stock > 0 ? (
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <Check className="h-4 w-4" /> In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-rose-600">Currently Out of Stock</span>
              )}
            </div>

            {/* Quantity + Add to Cart */}
            <div className="mt-7 flex flex-wrap sm:flex-row flex-col items-center gap-4">
              <div className={`flex items-center rounded-full border border-navy/15 bg-white ${product.stock <= 0 ? 'opacity-50' : ''}`}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-navy hover:bg-pink-pale disabled:opacity-50"
                  aria-label="Decrease quantity"
                  disabled={product.stock <= 0}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-bold text-navy">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-navy hover:bg-pink-pale disabled:opacity-50"
                  aria-label="Increase quantity"
                  disabled={product.stock <= 0}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button size="lg" onClick={handleAddToCart} disabled={product.stock <= 0} className="flex-1 sm:flex-none">
                <ShoppingBag className="h-5 w-5" /> {product.stock <= 0 ? 'Out of Stock' : justAdded ? 'Added to Cart!' : 'Add to Cart'}
              </Button>
            </div>

            {/* WhatsApp Order CTA */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER_1}?text=${encodeURIComponent(`Assalam o Alaikum! Main yeh product order karna chahta/chahti hun:\n\n*${product.name}*\nPrice: Rs. ${product.price}\nQuantity: ${quantity}\n\nLink: ${window.location.href}`)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-2.5 rounded-full border-2 border-[#25D366] bg-[#25D366]/10 py-3 text-sm font-bold text-[#128C7E] transition-all hover:bg-[#25D366] hover:text-white"
            >
              <MessageCircle className="h-5 w-5" />
              Order on WhatsApp
            </a>

            <div className="mt-8 grid grid-cols-1 gap-3 border-t border-navy/10 pt-6 sm:grid-cols-3">
              {[
                { icon: Truck, label: 'Free Delivery' },
                { icon: Wallet, label: 'Cash on Delivery' },
                { icon: ShieldCheck, label: '7-Day Exchange' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs font-bold text-navy-soft">
                  <Icon className="h-4 w-4 text-pink-deep" /> {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.items.length > 1 && (
          <div className="mt-20 border-t border-navy/10 pt-16">
            <h2 className="mb-8 font-display text-3xl font-semibold text-navy">You may also like</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.items
                .filter((p) => p.id !== product.id)
                .slice(0, 4)
                .map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
