import type { ReactNode } from 'react';

import { Breadcrumbs, type Crumb } from '@/components/common/Breadcrumbs';
import { HeroBackground } from '@/components/common/HeroBackground';

interface PageHeaderProps {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  breadcrumbs?: Crumb[];
  /** Extra content under the description (chips, counts…). */
  children?: ReactNode;
}

/** Compact dark banner for inner pages — branded without pushing content below the fold. */
export function PageHeader({ title, eyebrow, description, breadcrumbs, children }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden bg-navy">
      <HeroBackground />
      <div className="container-page relative py-10 sm:py-14">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} tone="light" className="mb-4" />}
        {eyebrow && <p className="eyebrow-light mb-2">{eyebrow}</p>}
        <h1 className="max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
          {title}
        </h1>
        {description && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65 sm:text-base">{description}</p>}
        {children}
      </div>
    </section>
  );
}
