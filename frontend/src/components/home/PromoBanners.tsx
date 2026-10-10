import { Link } from 'react-router-dom';
import { ArrowUpRight, Flame, Sparkles, Tag } from 'lucide-react';
import clsx from 'clsx';

import { ProductImage } from '@/components/common/ProductImage';
import { ROUTES } from '@/constants';
import type { Product } from '@/types';
import { getDiscountPercent, getProductImages } from '@/utils/format';

interface PromoBannersProps {
  deals?: Product[];
  bestsellers?: Product[];
  newArrivals?: Product[];
}

function firstWithImage(list?: Product[]) {
  return list?.find((p) => getProductImages(p).length > 0);
}

/** Three editorial banners — one large, two stacked — each fronted by a real product photo. */
export function PromoBanners({ deals, bestsellers, newArrivals }: PromoBannersProps) {
  const maxDiscount = Math.max(0, ...(deals ?? []).map(getDiscountPercent));
  const tiles = [
    {
      key: 'deals',
      to: `${ROUTES.PRODUCTS}?deals=1`,
      icon: Tag,
      eyebrow: 'Limited time',
      title: maxDiscount > 0 ? `Up to ${maxDiscount}% off` : 'Deals of the week',
      text: 'Our biggest savings, while stocks last.',
      cta: 'Shop deals',
      product: firstWithImage(deals) ?? firstWithImage(bestsellers),
    },
    {
      key: 'new',
      to: ROUTES.PRODUCTS,
      icon: Sparkles,
      eyebrow: 'Just landed',
      title: 'New arrivals',
      text: 'Fresh pieces added every week.',
      cta: 'Discover',
      product: firstWithImage(newArrivals),
    },
    {
      key: 'best',
      to: ROUTES.PRODUCTS,
      icon: Flame,
      eyebrow: 'Most loved',
      title: 'Bestsellers',
      text: 'The pieces customers reorder.',
      cta: 'Shop favourites',
      product: firstWithImage(bestsellers?.slice(1)) ?? firstWithImage(bestsellers),
    },
  ];

  if (tiles.every((t) => !t.product)) return null;

  return (
    <section className="section bg-white" aria-label="Featured collections">
      <div className="container-page grid gap-4 sm:gap-5 lg:grid-cols-[1.25fr_1fr] lg:grid-rows-2">
        {tiles.map((t, i) => {
          const Icon = t.icon;
          const hero = i === 0;
          return (
            <Link
              key={t.key}
              to={t.to}
              className={clsx(
                'group relative isolate flex overflow-hidden rounded-[1.75rem] bg-navy',
                hero ? 'min-h-[380px] sm:min-h-[460px] lg:row-span-2' : 'min-h-[220px] sm:min-h-[240px]'
              )}
            >
              {t.product && (
                <div className="absolute inset-0 -z-10">
                  <ProductImage
                    imageUrl={getProductImages(t.product)[0]}
                    imageColor={t.product.image_color}
                    alt=""
                    width={hero ? 1100 : 760}
                    sizes={hero ? '(min-width: 1024px) 55vw, 100vw' : '(min-width: 1024px) 40vw, 100vw'}
                    className="transition-transform duration-1000 ease-out-expo group-hover:scale-105"
                  />
                </div>
              )}
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy via-navy/55 to-navy/5 sm:bg-gradient-to-r sm:from-navy/90 sm:via-navy/45 sm:to-transparent" />

              <div className={clsx('mt-auto flex w-full flex-col p-6 sm:mt-0 sm:justify-end sm:p-8', hero && 'lg:p-10')}>
                <p className="eyebrow-light"><Icon className="h-3.5 w-3.5" /> {t.eyebrow}</p>
                <h3 className={clsx('mt-2 font-display font-semibold leading-tight text-white', hero ? 'text-4xl sm:text-5xl' : 'text-3xl')}>
                  {t.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm text-white/70">{t.text}</p>
                <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-navy transition-colors group-hover:bg-gold">
                  {t.cta} <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
