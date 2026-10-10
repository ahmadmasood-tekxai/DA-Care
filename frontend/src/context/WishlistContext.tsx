import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { WISHLIST_STORAGE_KEY } from '@/constants';
import type { Product } from '@/types';

interface WishlistContextValue {
  items: Product[];
  count: number;
  has: (productId: number) => boolean;
  /** Adds or removes; returns true when the product is now saved. */
  toggle: (product: Product) => boolean;
  remove: (productId: number) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

function load(): Product[] {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Saved products live in the browser, so guests can use the wishlist too. */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full or blocked — the wishlist just won't persist */
    }
  }, [items]);

  const ids = useMemo(() => new Set(items.map((p) => p.id)), [items]);
  const has = useCallback((productId: number) => ids.has(productId), [ids]);

  const toggle = useCallback(
    (product: Product) => {
      const saved = !ids.has(product.id);
      setItems((prev) => (saved ? [product, ...prev] : prev.filter((p) => p.id !== product.id)));
      return saved;
    },
    [ids]
  );

  const remove = useCallback((productId: number) => setItems((prev) => prev.filter((p) => p.id !== productId)), []);

  const value = useMemo(() => ({ items, count: items.length, has, toggle, remove }), [items, has, toggle, remove]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
