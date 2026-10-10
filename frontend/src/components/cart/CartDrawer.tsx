import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, Truck, X } from 'lucide-react';

import { ProductImage } from '@/components/common/ProductImage';
import { ROUTES } from '@/constants';
import { useCart } from '@/hooks/useCart';
import { useOverlay } from '@/hooks/useOverlay';
import { formatCurrency, getProductImages } from '@/utils/format';

/** Slide-out mini cart — review and adjust without leaving the page. */
export function CartDrawer() {
  const { items, itemCount, subtotal, savings, isCartOpen, closeCart, updateQuantity, removeItem } = useCart();

  useOverlay(isCartOpen, closeCart);

  if (!isCartOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div className="absolute inset-0 animate-fade-in bg-navy/50 backdrop-blur-sm" onClick={closeCart} />

      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md animate-slide-in-right flex-col bg-white shadow-lift">
        <header className="flex h-16 items-center justify-between border-b border-navy/10 px-5">
          <h2 className="font-display text-xl">
            Your cart <span className="font-body text-sm font-normal text-navy-soft">({itemCount})</span>
          </h2>
          <button className="icon-btn -mr-2" onClick={closeCart} aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream-2 text-pink-deep">
              <ShoppingBag className="h-7 w-7" />
            </span>
            <div>
              <p className="font-display text-xl">Your cart is empty</p>
              <p className="mt-1 text-sm text-navy-soft">Discover something you'll love.</p>
            </div>
            <Link to={ROUTES.PRODUCTS} onClick={closeCart} className="btn btn-primary">
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 bg-emerald-50 px-5 py-2.5 text-xs font-medium text-emerald-800">
              <Truck className="h-4 w-4 shrink-0" /> Free delivery on this order · Cash on delivery available
            </div>

            <ul className="flex-1 divide-y divide-navy/[.07] overflow-y-auto px-5 scrollbar-thin">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex gap-4 py-4">
                  <Link
                    to={ROUTES.PRODUCT_DETAIL(product.slug)}
                    onClick={closeCart}
                    className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-cream-2"
                  >
                    <ProductImage imageUrl={getProductImages(product)[0]} imageColor={product.image_color} alt={product.name} width={160} sizes="80px" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={ROUTES.PRODUCT_DETAIL(product.slug)}
                        onClick={closeCart}
                        className="line-clamp-2 text-sm font-semibold text-navy hover:text-pink-deep"
                      >
                        {product.name}
                      </Link>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="-mr-1 -mt-1 rounded-full p-1.5 text-navy-soft/50 transition-colors hover:bg-rose-50 hover:text-rose-600"
                        aria-label={`Remove ${product.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-0.5 text-xs text-navy-soft">{formatCurrency(product.price)} each</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full border border-navy/15">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-navy transition-colors hover:bg-cream-2"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold tabular-nums" aria-live="polite">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={product.stock > 0 && quantity >= product.stock}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-navy transition-colors hover:bg-cream-2 disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-navy">{formatCurrency(product.price * quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="pb-safe border-t border-navy/10 bg-cream/60 px-5 pt-4">
              {savings > 0 && (
                <div className="mb-1 flex justify-between text-sm text-emerald-700">
                  <span>You save</span>
                  <span className="font-semibold">{formatCurrency(savings)}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-navy-soft">Subtotal</span>
                <span className="font-display text-2xl font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <Link to={ROUTES.CART} onClick={closeCart} className="btn btn-primary btn-lg mt-4 w-full">
                Checkout
              </Link>
              <button onClick={closeCart} className="mt-2 w-full py-2 text-xs font-semibold text-navy-soft hover:text-navy">
                Continue shopping
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>,
    document.body
  );
}
