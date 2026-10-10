import { Sparkle } from 'lucide-react';

const WORDS = [
  'Skin care',
  'Fine jewellery',
  'Designer apparel',
  'Baby essentials',
  'Cash on delivery',
  'Free delivery nationwide',
  '7-day exchange',
  '100% authentic',
];

/** Slow gold ticker between sections — decorative, so hidden from screen readers. */
export function MarqueeBand() {
  const row = (copy: number) => (
    <ul className="flex shrink-0 items-center" aria-hidden={copy > 0 || undefined}>
      {WORDS.map((w) => (
        <li key={`${copy}-${w}`} className="flex items-center whitespace-nowrap">
          <span className="px-6 font-display text-xl italic text-navy sm:px-8 sm:text-2xl">{w}</span>
          <Sparkle className="h-4 w-4 fill-navy text-navy" />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="overflow-hidden border-y border-gold-dark/30 bg-gold py-4 sm:py-5" aria-label="What we offer">
      <div className="marquee">
        {row(0)}
        {row(1)}
      </div>
    </div>
  );
}
