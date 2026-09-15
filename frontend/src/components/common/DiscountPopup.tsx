import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { Button } from '@/components/common/Button';

export function DiscountPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the popup
    const hasSeenPopup = localStorage.getItem('hasSeenDiscountPopup');

    if (!hasSeenPopup) {
      // Small delay to make it feel more natural
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenDiscountPopup', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in duration-300">

        {/* Decorative Header */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-pink-pale to-cream-2 rounded-t-3xl" />

        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/50 text-navy hover:bg-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative pt-10 px-8 pb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-deep text-white shadow-lg shadow-pink-deep/30 transform rotate-12">
            <Sparkles className="h-8 w-8" />
          </div>

          <h2 className="font-display text-3xl font-bold text-navy mb-2">Wait, little one!</h2>
          <p className="text-navy-soft mb-6">
            Get <span className="font-bold text-pink-deep">20% OFF</span> your first order of premium sets. Dress him up in style!
          </p>


          <div className="flex flex-col gap-3">
            <Link to={ROUTES.PRODUCTS} onClick={handleClose}>
              <Button size="lg" fullWidth className="bg-navy hover:bg-navy-soft text-white">
                Shop Now & Save 20%
              </Button>
            </Link>
            <button
              onClick={handleClose}
              className="text-sm font-medium text-navy-soft hover:text-navy underline-offset-4 hover:underline"
            >
              No thanks, I'll pay full price
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
