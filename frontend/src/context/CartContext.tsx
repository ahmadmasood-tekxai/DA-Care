import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { CART_STORAGE_KEY } from '@/constants';
import type { CartItem, Product } from '@/types';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  /** Total saved versus old_price across the cart. */
  savings: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: number) => boolean;
  /** Slide-out mini cart. */
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext<CartContextValue | undefined>(undefined);

function loadCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
    return Array.isArray(parsed) ? parsed.filter((i) => i?.product?.id && i.quantity > 0) : [];
  } catch {
    return [];
  }
}

/** Never let a line exceed what's in stock (when stock is known). */
function clampQuantity(product: Product, quantity: number): number {
  const max = product.stock > 0 ? product.stock : quantity;
  return Math.max(0, Math.min(quantity, max));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage());
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full or blocked — cart still works for this session */
    }
  }, [items]);

  // Keep carts in sync across open tabs.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) setItems(loadCartFromStorage());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { product, quantity: clampQuantity(product, i.quantity + quantity) } : i
        );
      }
      return [...prev, { product, quantity: clampQuantity(product, quantity) }];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.product.id === productId ? { ...i, quantity: clampQuantity(i.product, quantity) } : i))
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const isInCart = useCallback((productId: number) => items.some((i) => i.product.id === productId), [items]);

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0), [items]);
  const savings = useMemo(
    () =>
      items.reduce((sum, i) => {
        const old = i.product.old_price;
        return old && old > i.product.price ? sum + (old - i.product.price) * i.quantity : sum;
      }, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items, itemCount, subtotal, savings,
      addItem, removeItem, updateQuantity, clearCart, isInCart,
      isCartOpen, openCart, closeCart,
    }),
    [items, itemCount, subtotal, savings, addItem, removeItem, updateQuantity, clearCart, isInCart, isCartOpen, openCart, closeCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
