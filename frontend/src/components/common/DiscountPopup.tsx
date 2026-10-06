import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Clock, Users, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

function getRandomViewers() {
  return Math.floor(Math.random() * 30) + 28; // 28–57
}

export function DiscountPopup() {
  const [isOpen, setIsOpen] = useState(false);
  // Countdown: 10 minutes
  const [seconds, setSeconds] = useState(10 * 60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewers = useRef(getRandomViewers());

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('hasSeenDiscountPopupV2');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => (s > 0 ? s - 1 : 0));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenDiscountPopupV2', 'true');
  };

  if (!isOpen) return null;

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-[#0d0a0a] shadow-[0_32px_80px_rgba(0,0,0,0.6)] border border-[#C9A84C]/20">

        {/* Gold top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-[#C9A84C] via-[#E8C96D] to-[#C9A84C]" />

        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-8 py-8 text-center">
          {/* Live viewers badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              {viewers.current} people viewing right now
            </span>
          </div>

          {/* Icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#a07830] shadow-[0_8px_32px_rgba(201,168,76,0.4)]">
            <Zap className="h-8 w-8 text-[#0d0a0a]" />
          </div>

          {/* Heading */}
          <h2 className="font-display text-2xl font-bold text-white mb-1">
            Exclusive Welcome Offer
          </h2>
          <p className="text-sm text-white/50 mb-4">Valid today only — for new visitors</p>

          {/* Discount highlight */}
          <div className="mb-5 rounded-2xl border border-[#C9A84C]/30 bg-[#C9A84C]/10 p-4">
            <p className="text-4xl font-display font-bold text-[#E8C96D] mb-1">20% OFF</p>
            <p className="text-sm text-white/60">On your first order — COD available</p>
          </div>

          {/* Countdown */}
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 flex items-center justify-center gap-1.5">
              <Clock className="h-3 w-3" /> Offer expires in
            </p>
            <div className="flex items-center justify-center gap-3">
              {[mins, secs].map((val, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 border border-white/10 font-display text-3xl font-bold text-[#E8C96D] tabular-nums">
                    {val}
                  </div>
                  <span className="mt-1 text-[9px] uppercase tracking-widest text-white/30">
                    {i === 0 ? 'Min' : 'Sec'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust strip */}
          <div className="mb-6 flex items-center justify-center gap-4 text-[10px] text-white/40">
            <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-emerald-400" /> COD Available</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3 text-[#C9A84C]" /> 5,000+ Orders</span>
            <span className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-[#C9A84C]" /> Premium Quality</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <Link to={ROUTES.PRODUCTS} onClick={handleClose}>
              <button className="w-full rounded-full bg-gradient-to-r from-[#C9A84C] via-[#E8C96D] to-[#C9A84C] bg-[length:200%_auto] py-4 text-sm font-extrabold uppercase tracking-widest text-[#0d0a0a] shadow-[0_8px_32px_rgba(201,168,76,0.4)] transition-all hover:shadow-[0_12px_40px_rgba(201,168,76,0.6)] hover:scale-105 animate-[gradient_3s_linear_infinite]">
                Shop Now — 20% OFF
              </button>
            </Link>
            <button
              onClick={handleClose}
              className="text-[11px] text-white/30 hover:text-white/50 transition-colors"
            >
              No thanks, I prefer paying full price
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
