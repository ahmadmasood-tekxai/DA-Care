import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Product } from '@/types';

const FAVORITES_KEY = 'oqira_favorites';

interface FavoritesContextValue {
  favorites: Product[];
  isFavorite: (productId: number) => boolean;
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: number) => void;
  toggleFavorite: (product: Product) => void;
  favoritesCount: number;
}

// eslint-disable-next-line react-refresh/only-export-components
export const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? (JSON.parse(stored) as Product[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = useCallback(
    (productId: number) => favorites.some((p) => p.id === productId),
    [favorites]
  );

  const addFavorite = useCallback((product: Product) => {
    setFavorites((prev) =>
      prev.some((p) => p.id === product.id) ? prev : [...prev, product]
    );
  }, []);

  const removeFavorite = useCallback((productId: number) => {
    setFavorites((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const toggleFavorite = useCallback(
    (product: Product) => {
      if (favorites.some((p) => p.id === product.id)) {
        removeFavorite(product.id);
      } else {
        addFavorite(product);
      }
    },
    [favorites, addFavorite, removeFavorite]
  );

  const value = useMemo(
    () => ({ favorites, isFavorite, addFavorite, removeFavorite, toggleFavorite, favoritesCount: favorites.length }),
    [favorites, isFavorite, addFavorite, removeFavorite, toggleFavorite]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
