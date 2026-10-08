import { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

const notifications = [
  { name: 'Ayesha', city: 'Lahore', product: 'Gold Necklace Set', time: '2 mins ago' },
  { name: 'Sana', city: 'Karachi', product: 'Luxury Hand Purse', time: '5 mins ago' },
  { name: 'Fatima', city: 'Islamabad', product: 'Skin Care Bundle', time: '7 mins ago' },
  { name: 'Hira', city: 'Rawalpindi', product: 'Baby Garments Set', time: '3 mins ago' },
  { name: 'Maria', city: 'Faisalabad', product: 'Diamond Earrings', time: '1 min ago' },
  { name: 'Nadia', city: 'Multan', product: 'Cosmetics Bundle', time: '4 mins ago' },
  { name: 'Sara', city: 'Peshawar', product: 'Luxury Suit', time: '6 mins ago' },
  { name: 'Zara', city: 'Sialkot', product: 'Embroidered Lawn Suit', time: '9 mins ago' },
  { name: 'Iqra', city: 'Gujranwala', product: 'Bridal Jewelry Set', time: '3 mins ago' },
  { name: 'Maham', city: 'Bahawalpur', product: 'Premium Handbag', time: '8 mins ago' },
  { name: 'Alina', city: 'Lahore', product: 'Luxury Abaya', time: '4 mins ago' },
  { name: 'Komal', city: 'Karachi', product: 'Makeup Essentials Kit', time: '6 mins ago' },
  { name: 'Anum', city: 'Islamabad', product: 'Premium Jewelry Set', time: '2 mins ago' },
  { name: 'Mehwish', city: 'Rawalpindi', product: 'Kids Winter Collection', time: '10 mins ago' },
  { name: 'Laiba', city: 'Sargodha', product: 'Pearl Earrings Set', time: '5 mins ago' },
  { name: 'Rabia', city: 'Lahore', product: 'Luxury Khussa Pair', time: '7 mins ago' },
  { name: 'Amna', city: 'Hyderabad', product: 'Organic Skin Care Set', time: '3 mins ago' },
  { name: 'Eman', city: 'Quetta', product: 'Premium Hijab Collection', time: '11 mins ago' },
  { name: 'Minsa', city: 'Abbottabad', product: 'Designer 3-Piece Suit', time: '5 mins ago' },
  { name: 'Sumbal', city: 'Lahore', product: 'Gold Plated Jewelry Set', time: '8 mins ago' },
];

export function SocialProofTicker() {
  const [visible, setVisible] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    // Start after 8 seconds
    const startTimer = setTimeout(() => {
      showNext(0);
    }, 8000);
    return () => clearTimeout(startTimer);
  }, []);

  function showNext(idx: number) {
    setCurrentIdx(idx);
    setVisible(true);
    // Hide after 4 seconds
    setTimeout(() => {
      setVisible(false);
      // Show next after 6 seconds
      setTimeout(() => {
        showNext((idx + 1) % notifications.length);
      }, 6000);
    }, 4000);
  }

  const n = notifications[currentIdx];

  return (
    <Link
      to={ROUTES.PRODUCTS}
      className={`fixed bottom-6 left-4 z-[90] max-w-[280px] transition-all duration-500 group cursor-pointer ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-[#C9A84C]/20 bg-[#0d0a0a]/95 p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-300 group-hover:border-[#C9A84C]/50 group-hover:bg-[#1a1414] group-hover:-translate-y-1 group-hover:shadow-[0_12px_40px_rgba(201,168,76,0.2)]">
        {/* Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#a07830] shadow-md">
          <ShoppingBag className="h-4.5 w-4.5 text-[#0d0a0a]" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-white leading-tight">
            <span className="text-[#E8C96D]">{n.name}</span> from {n.city}
          </p>
          <p className="text-[11px] text-white/50 leading-tight truncate">
            just purchased: {n.product}
          </p>
          <p className="text-[10px] text-[#C9A84C]/70 mt-0.5">{n.time}</p>
        </div>

        {/* Green dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
      </div>
    </Link>
  );
}
