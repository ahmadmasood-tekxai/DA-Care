import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Check, MessageCircle, Minus, Plus, RefreshCcw, Share2, ShieldCheck, ShoppingBag, Truck, Wallet, Zap } from 'lucide-react';
import clsx from 'clsx';

import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ProductGallery } from '@/components/common/ProductGallery';
import { ProductRail } from '@/components/common/ProductRail';
import { WishlistButton } from '@/components/common/WishlistButton';
import { SEO, breadcrumbSchema } from '@/components/common/SEO';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { PRODUCT_BADGE_LABELS, ROUTES, SITE_URL, STORE_NAME, STORE_PROMISES, WHATSAPP_NUMBER_1 } from '@/constants';
import { useCart } from '@/hooks/useCart';
import { useProduct, useProducts } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/useToast';
import { NotFoundPage } from '@/pages/Public/NotFoundPage';
import { ProductBadge } from '@/types';
import { buildWhatsAppLink, formatCurrency, getDiscountPercent, getProductImages, resolveImageUrl } from '@/utils/format';

const LOW_STOCK_THRESHOLD = 5;

function ProductDetailSkeleton() {
  return (
    <PublicLayout>
      <div className="container-page py-6 sm:py-10" aria-busy="true">
        <div className="skeleton mb-6 h-3 w-48" />
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="skeleton aspect-[4/5] rounded-3xl sm:aspect-square" />
          <div className="space-y-4">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-10 w-4/5" />
            <div className="skeleton h-8 w-40" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton mt-6 h-14 w-full rounded-full" />
            <div className="skeleton h-14 w-full rounded-full" />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem, openCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [stickyVisible, setStickyVisible] = useState(false);
  const buyBoxRef = useRef<HTMLDivElement>(null);

  const { data: product, isLoading, isError } = useProduct(slug);
  const related = useProducts(
    { category_slug: product?.category?.slug, page_size: 9 },
    { enabled: !!product?.category?.slug }
  );

  // Fresh state when moving between products.
  useEffect(() => setQuantity(1), [slug]);

  // Mobile sticky buy bar appears once the main buttons have scrolled above the
  // viewport. A rAF-throttled scroll check (not IntersectionObserver) so a jump
  // straight back to the top still hides it.
  useEffect(() => {
    const el = buyBoxRef.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      setStickyVisible(el.getBoundingClientRect().bottom < 0);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [product?.id]);

  if (isError) {
    return <NotFoundPage title="Product not found" message="This product may have sold out or been removed. Explore similar pieces in our collection." />;
  }
  if (isLoading || !product) return <ProductDetailSkeleton />;

  const images = getProductImages(product);
  const discount = getDiscountPercent(product);
  const soldOut = product.stock <= 0;
  const lowStock = !soldOut && product.stock <= LOW_STOCK_THRESHOLD;
  const productUrl = `${SITE_URL}${ROUTES.PRODUCT_DETAIL(product.slug)}`;
  const relatedItems = related.data?.items.filter((p) => p.id !== product.id).slice(0, 8);

  const handleAdd = () => {
    addItem(product, quantity);
    openCart();
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate(ROUTES.CART);
  };

  const handleShare = async () => {
    const shareData = { title: product.name, text: `${product.name} — ${formatCurrency(product.price)}`, url: productUrl };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(productUrl);
        toast({ title: 'Link copied', description: 'Share it with anyone.', variant: 'info' });
      }
    } catch {
      /* user cancelled the share sheet */
    }
  };

  const whatsappHref = buildWhatsAppLink(
    WHATSAPP_NUMBER_1,
    `Assalam o Alaikum! I'd like to order:\n\n*${product.name}*\nPrice: ${formatCurrency(product.price)}\nQuantity: ${quantity}\n\n${productUrl}`
  );

  return (
    <PublicLayout>
      <SEO
        title={`${product.name} — Buy Online in Pakistan`}
        description={`${product.short_description || product.name} — ${formatCurrency(product.price)}. Free delivery and cash on delivery across Pakistan at ${STORE_NAME}.`}
        canonical={ROUTES.PRODUCT_DETAIL(product.slug)}
        image={resolveImageUrl(images[0]) ?? undefined}
        type="product"
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description || product.short_description || product.name,
            image: images.map((u) => resolveImageUrl(u)),
            sku: String(product.id),
            category: product.category?.name,
            brand: { '@type': 'Brand', name: STORE_NAME },
            offers: {
              '@type': 'Offer',
              url: productUrl,
              priceCurrency: 'PKR',
              price: String(product.price),
              availability: soldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
              itemCondition: 'https://schema.org/NewCondition',
              seller: { '@type': 'Organization', name: STORE_NAME },
              shippingDetails: {
                '@type': 'OfferShippingDetails',
                shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'PKR' },
                shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'PK' },
                deliveryTime: {
                  '@type': 'ShippingDeliveryTime',
                  handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
                  transitTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 5, unitCode: 'DAY' },
                },
              },
            },
          },
          breadcrumbSchema([
            ['Home', '/'],
            [product.category.name, ROUTES.CATEGORY_PAGE(product.category.slug)],
            [product.name, ROUTES.PRODUCT_DETAIL(product.slug)],
          ]),
        ]}
      />

      <div className="container-page py-5 sm:py-8">
        <Breadcrumbs
          className="mb-5 sm:mb-8"
          items={[
            { label: 'Home', to: ROUTES.HOME },
            { label: product.category.name, to: ROUTES.CATEGORY_PAGE(product.category.slug) },
            ...(product.subcategory
              ? [{ label: product.subcategory.name, to: `${ROUTES.CATEGORY_PAGE(product.category.slug)}?sub=${product.subcategory.id}` }]
              : []),
            { label: product.name },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          {/* key: reset gallery position when navigating to another product */}
          <ProductGallery
            key={product.id}
            images={images}
            alt={product.name}
            imageColor={product.image_color}
            dimmed={soldOut}
            overlay={
              <div className="pointer-events-none absolute left-4 top-4 flex flex-col items-start gap-2">
                {soldOut ? (
                  <span className="rounded-full bg-navy px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white">Sold out</span>
                ) : product.badge !== ProductBadge.NONE ? (
                  <span className="rounded-full bg-gold px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-navy">
                    {PRODUCT_BADGE_LABELS[product.badge]}
                  </span>
                ) : null}
                {discount > 0 && !soldOut && (
                  <span className="rounded-full bg-sale px-3 py-1.5 text-[11px] font-bold text-white">-{discount}%</span>
                )}
              </div>
            }
          />

          {/* Buy box */}
          <div>
            <div className="flex items-center justify-between gap-4">
              <Link to={ROUTES.CATEGORY_PAGE(product.category.slug)} className="eyebrow hover:text-pink-deep">
                {product.subcategory?.name ?? product.category.name}
              </Link>
              <button onClick={handleShare} className="icon-btn -mr-2 h-9 w-9" aria-label="Share this product">
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{product.name}</h1>

            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-display text-3xl font-semibold text-navy">{formatCurrency(product.price)}</span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-navy-soft/50 line-through">{formatCurrency(product.old_price!)}</span>
                  <span className="rounded-full bg-sale/10 px-2.5 py-1 text-xs font-bold text-sale">
                    You save {formatCurrency(product.old_price! - product.price)}
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-navy-soft/70">Inclusive of all taxes · Free delivery</p>

            {product.short_description && <p className="mt-5 leading-relaxed text-navy-soft">{product.short_description}</p>}

            <p
              className={clsx(
                'mt-5 flex items-center gap-2 text-sm font-semibold',
                soldOut ? 'text-rose-600' : lowStock ? 'text-sale' : 'text-emerald-700'
              )}
            >
              {soldOut ? (
                'Currently sold out'
              ) : lowStock ? (
                <><Zap className="h-4 w-4" /> Only {product.stock} left in stock — order soon</>
              ) : (
                <><Check className="h-4 w-4" /> In stock, ready to ship</>
              )}
            </p>

            <div ref={buyBoxRef} className="mt-6 space-y-3">
              <div className="flex gap-3">
                <div className={clsx('flex items-center rounded-full border border-navy/15 bg-white', soldOut && 'opacity-50')}>
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={soldOut || quantity <= 1}
                    className="flex h-12 w-12 items-center justify-center rounded-full text-navy transition-colors hover:bg-cream-2 disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite" aria-label={`Quantity ${quantity}`}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={soldOut || quantity >= product.stock}
                    className="flex h-12 w-12 items-center justify-center rounded-full text-navy transition-colors hover:bg-cream-2 disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button onClick={handleAdd} disabled={soldOut} className="btn btn-outline btn-lg min-w-0 flex-1 border-navy max-sm:px-4">
                  <ShoppingBag className="h-4 w-4" /> {soldOut ? 'Sold out' : 'Add to cart'}
                </button>
                <WishlistButton product={product} variant="outline" />
              </div>
              <button onClick={handleBuyNow} disabled={soldOut} className="btn btn-primary btn-lg w-full">
                Buy it now
              </button>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg w-full">
                <MessageCircle className="h-4 w-4" /> Order on WhatsApp
              </a>
            </div>

            <ul className="mt-8 grid grid-cols-2 gap-3 rounded-2xl border border-navy/[.07] bg-white p-4 text-xs sm:text-sm">
              {[
                { icon: Truck, label: 'Free delivery', sub: STORE_PROMISES.delivery },
                { icon: Wallet, label: 'Cash on delivery', sub: 'Pay at your door' },
                { icon: RefreshCcw, label: '7-day exchange', sub: 'On unused items' },
                { icon: ShieldCheck, label: '100% authentic', sub: 'Quality checked' },
              ].map(({ icon: Icon, label, sub }) => (
                <li key={label} className="flex items-start gap-2.5">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-pink-deep" />
                  <span>
                    <span className="block font-semibold text-navy">{label}</span>
                    <span className="block text-[11px] text-navy-soft/70 sm:text-xs">{sub}</span>
                  </span>
                </li>
              ))}
            </ul>

            {product.description && (
              <details className="group mt-6 border-t border-navy/10 pt-4" open>
                <summary className="flex cursor-pointer list-none items-center justify-between py-2 font-display text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  Product details
                  <Plus className="h-4 w-4 transition-transform group-open:rotate-45" />
                </summary>
                <p className="whitespace-pre-line pb-2 text-[15px] leading-relaxed text-navy-soft">{product.description}</p>
              </details>
            )}
          </div>
        </div>
      </div>

      {(related.isLoading || (relatedItems && relatedItems.length > 0)) && (
        <section className="section border-t border-navy/[.07] bg-white">
          <div className="container-page">
            <ProductRail
              eyebrow="More to explore"
              title="You may also like"
              products={relatedItems}
              isLoading={related.isLoading}
              viewAllTo={ROUTES.CATEGORY_PAGE(product.category.slug)}
              viewAllLabel={`More ${product.category.name}`}
            />
          </div>
        </section>
      )}

      {/* Mobile sticky buy bar */}
      <div
        className={clsx(
          'pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-navy/10 bg-white/95 px-4 pt-3 shadow-lift backdrop-blur-md transition-transform duration-300 lg:hidden',
          stickyVisible && !soldOut ? 'translate-y-0' : 'translate-y-full'
        )}
        aria-hidden={!stickyVisible}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-navy-soft">{product.name}</p>
            <p className="font-bold text-navy">{formatCurrency(product.price * quantity)}</p>
          </div>
          <button onClick={handleAdd} tabIndex={stickyVisible ? 0 : -1} className="btn btn-primary">
            <ShoppingBag className="h-4 w-4" /> Add to cart
          </button>
        </div>
      </div>
    </PublicLayout>
  );
}
