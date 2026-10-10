import clsx from 'clsx';

/**
 * Decorative backdrop for dark sections — soft drifting gold/rose light and a
 * faint grain grid. Pure CSS (GPU-composited transforms only), so it adds no
 * JavaScript weight and stays smooth on low-end phones.
 */
export function HeroBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={clsx('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <div className="absolute -left-[15%] -top-[30%] h-[70%] w-[60%] animate-drift rounded-full bg-gold/[.14] blur-[100px]" />
      <div
        className="absolute -bottom-[35%] -right-[10%] h-[75%] w-[55%] animate-drift rounded-full bg-pink-deep/25 blur-[110px]"
        style={{ animationDelay: '-9s' }}
      />
      <div
        className="absolute inset-0 opacity-[.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)',
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
    </div>
  );
}
