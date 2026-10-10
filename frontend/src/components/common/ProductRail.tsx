import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { Carousel } from '@/components/common/Carousel';
import { ProductCard, ProductCardSkeleton } from '@/components/common/ProductCard';
import type { CategoryWithCount, Product } from '@/types';

interface ProductRailProps {
  eyebrow?: ReactNode;
  title: string;
  subtitle?: string;
  products?: Product[];
  isLoading?: boolean;
  categories?: CategoryWithCount[];
  viewAllTo?: string;
  viewAllLabel?: string;
  autoPlayMs?: number;
}

const SLIDE = 'w-[46%] sm:w-[31%] lg:w-[23.5%]';

/** Section header + swipeable carousel of product cards. Renders nothing once loaded if empty. */
export function ProductRail({
  eyebrow,
  title,
  subtitle,
  products,
  isLoading,
  categories,
  viewAllTo,
  viewAllLabel = 'View all',
  autoPlayMs,
}: ProductRailProps) {
  if (!isLoading && (!products || products.length === 0)) return null;

  const categoryName = (id: number) => categories?.find((c) => c.id === id)?.name;

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
        <div className="max-w-xl">
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <h2 className="heading-lg">{title}</h2>
          {subtitle && <p className="mt-2 text-sm text-navy-soft sm:text-base">{subtitle}</p>}
        </div>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            className="group hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-navy underline-offset-4 hover:text-pink-deep hover:underline sm:inline-flex"
          >
            {viewAllLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-hidden sm:gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`shrink-0 ${SLIDE}`}>
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <Carousel ariaLabel={title} slideClassName={SLIDE} autoPlayMs={autoPlayMs}>
          {products!.map((p) => (
            <ProductCard key={p.id} product={p} categoryName={categoryName(p.category_id)} />
          ))}
        </Carousel>
      )}

      {viewAllTo && (
        <Link to={viewAllTo} className="btn btn-outline btn-sm mt-6 w-full sm:hidden">
          {viewAllLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
