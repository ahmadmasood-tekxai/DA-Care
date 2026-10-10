import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';

import { SEO } from '@/components/common/SEO';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { ROUTES } from '@/constants';

export function NotFoundPage({
  title = 'Page not found',
  message = "The page you're looking for has moved or no longer exists.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <PublicLayout>
      <SEO title={title} noIndex />
      <section className="container-page flex flex-col items-center py-24 text-center sm:py-32">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream-2 text-pink-deep">
          <Compass className="h-7 w-7" />
        </span>
        <p className="eyebrow mt-6">Error 404</p>
        <h1 className="heading-lg mt-2">{title}</h1>
        <p className="mt-3 max-w-md text-navy-soft">{message}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to={ROUTES.PRODUCTS} className="btn btn-primary">
            Browse products <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to={ROUTES.HOME} className="btn btn-outline">
            Back to home
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
