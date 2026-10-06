import { useState, useEffect } from 'react';
import { Flame, Star, Truck, Zap, X } from 'lucide-react';

const messages = [
  {
    icon: Flame,
    label: 'Today\'s Orders',
    text: '23 orders placed today — Limited stock remaining',
    color: 'text-orange-400',
    dot: 'bg-orange-400',
  },
  {
    icon: Star,
    label: 'Top Rated',
    text: '5,000+ happy customers — Pakistan-wide delivery',
    color: 'text-[#E8C96D]',
    dot: 'bg-[#E8C96D]',
  },
  {
    icon: Truck,
    label: 'Fast Delivery',
    text: 'Order today — delivered in 3–5 working days',
    color: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  {
    icon: Zap,
    label: 'Special Offer',
    text: 'Today only: Free delivery on Bank Transfer orders',
    color: 'text-[#E8C96D]',
    dot: 'bg-[#E8C96D]',
  },
];

export function UrgencyBanner() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % messages.length);
        setAnimating(false);
      }, 200);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  const msg = messages[idx];
  const Icon = msg.icon;

  return (
    <div className="flex h-[34px] items-center justify-between gap-4 bg-[#0d0a0a] px-4 border-b border-[#C9A84C]/15 relative overflow-hidden select-none">
      {/* Shimmer sweep */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px">
        <div className="h-full w-1/2 animate-[shimmer_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />
      </div>

      {/* Left — label pill */}
      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        <span className={`relative flex h-1.5 w-1.5`}>
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${msg.dot} opacity-60`} />
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${msg.dot}`} />
        </span>
        <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-white/30">
          {msg.label}
        </span>
      </div>

      {/* Center — message */}
      <div
        className={`flex flex-1 items-center justify-center gap-2 transition-opacity duration-200 ${
          animating ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <Icon className={`h-3 w-3 shrink-0 ${msg.color}`} />
        <p className={`text-[10px] sm:text-[11px] font-semibold tracking-wide text-center leading-tight ${msg.color}`}>{msg.text}</p>
      </div>

      {/* Right — close */}
      <button
        onClick={() => setVisible(false)}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white/25 hover:text-white/60 hover:bg-white/10 transition-all"
        aria-label="Close banner"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
