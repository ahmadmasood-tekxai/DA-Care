import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Returns the page numbers (and '…' gaps) to render. */
function buildPages(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '…')[] = [1];

  if (current > 3) pages.push('…');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let p = start; p <= end; p++) pages.push(p);

  if (current < total - 2) pages.push('…');

  pages.push(total);
  return pages;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPages(page, totalPages);

  const btnBase =
    'inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 select-none';
  const activeBtn =
    'bg-navy text-white shadow-md scale-105';
  const inactiveBtn =
    'bg-white text-navy border border-navy/15 hover:border-navy/40 hover:bg-cream-2';
  const arrowBtn =
    'bg-white text-navy border border-navy/15 hover:bg-pink-pale hover:border-pink-deep/30 disabled:opacity-30 disabled:cursor-not-allowed px-2.5';

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex items-center justify-center gap-2"
    >
      {/* Prev */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={`${btnBase} ${arrowBtn}`}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === '…' ? (
          <span
            key={`ellipsis-${i}`}
            className="inline-flex h-9 w-9 items-center justify-center text-navy/40 text-sm select-none"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`${btnBase} px-3 ${p === page ? activeBtn : inactiveBtn}`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className={`${btnBase} ${arrowBtn}`}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
