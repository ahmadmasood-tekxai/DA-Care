import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items, tone = 'dark', className }: { items: Crumb[]; tone?: 'dark' | 'light'; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={clsx('text-xs', className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <Fragment key={`${item.label}-${i}`}>
              <li className="min-w-0">
                {item.to && !isLast ? (
                  <Link
                    to={item.to}
                    className={clsx(
                      'transition-colors',
                      tone === 'light' ? 'text-white/55 hover:text-white' : 'text-navy-soft/70 hover:text-navy'
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? 'page' : undefined}
                    className={clsx('line-clamp-1 font-medium', tone === 'light' ? 'text-gold-light' : 'text-navy')}
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <li aria-hidden="true">
                  <ChevronRight className={clsx('h-3 w-3', tone === 'light' ? 'text-white/30' : 'text-navy/25')} />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
