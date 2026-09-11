import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, MessageCircle, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { getApiErrorMessage } from '@/api/client';
import { ordersApi } from '@/api/orders';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Input } from '@/components/common/Input';
import { ProductImage } from '@/components/common/ProductImage';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { ROUTES, WHATSAPP_NUMBER_1 } from '@/constants';
import { useCart } from '@/hooks/useCart';
import { buildWhatsAppOrderLink, formatCurrency } from '@/utils/format';

export function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [formError, setFormError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const checkoutMutation = useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      setOrderPlaced(true);
      const link = buildWhatsAppOrderLink(WHATSAPP_NUMBER_1, items, customerName);
      clearCart();
      window.open(link, '_blank');
    },
    onError: (err) => setFormError(getApiErrorMessage(err)),
  });

  function handleCheckout() {
    setFormError('');
    if (!customerName.trim()) return setFormError('Please enter your name.');
    if (!customerPhone.trim()) return setFormError('Please enter your phone number.');

    checkoutMutation.mutate({
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
    });
  }

  if (orderPlaced) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-md px-6 py-28 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-3xl">Order Received!</h1>
          <p className="mt-3 text-navy-soft">
            We've logged your order and opened WhatsApp so you can confirm the details with our team.
          </p>
          <Link to={ROUTES.PRODUCTS} className="mt-8 inline-block">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  if (items.length === 0) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-md px-6 py-28">
          <EmptyState
            icon={<ShoppingBag className="h-6 w-6" />}
            title="Your cart is empty"
            description="Browse the collection and add a set for your little gentleman."
            action={
              <Link to={ROUTES.PRODUCTS}>
                <Button>Shop the Collection</Button>
              </Link>
            }
          />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="bg-cream-2 px-6 py-14 text-center">
        <span className="section-tag">Almost There</span>
        <h1 className="text-4xl sm:text-5xl">Your Cart</h1>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Cart items */}
          <div className="space-y-4 lg:col-span-2">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-4 rounded-2xl border border-navy/10 bg-white p-4">
                <Link to={ROUTES.PRODUCT_DETAIL(product.slug)} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-cream-2">
                  <ProductImage imageUrl={product.image_url} imageColor={product.image_color} alt={product.name} />
                </Link>

                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link to={ROUTES.PRODUCT_DETAIL(product.slug)}>
                        <h3 className="font-display font-semibold text-navy hover:text-pink-deep">{product.name}</h3>
                      </Link>
                      <p className="mt-0.5 text-sm text-navy-soft">{formatCurrency(product.price)} each</p>
                    </div>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="rounded-full p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-navy/15">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-navy hover:bg-pink-pale"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-navy">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-navy hover:bg-pink-pale"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="font-display font-semibold text-navy">{formatCurrency(product.price * quantity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout summary */}
          <div className="h-fit rounded-3xl border border-navy/10 bg-white p-6">
            <h3 className="font-display text-lg font-semibold text-navy">Order Summary</h3>
            <div className="mt-4 flex items-center justify-between border-b border-navy/10 pb-4 text-sm">
              <span className="text-navy-soft">Subtotal</span>
              <span className="font-bold text-navy">{formatCurrency(subtotal)}</span>
            </div>

            <div className="mt-4 space-y-3">
              <Input label="Your Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Sara Ahmed" required />
              <Input label="Phone Number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="03xx-xxxxxxx" required />
              <Input label="Address (optional)" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="For delivery" />
            </div>

            {formError && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{formError}</p>}

            <Button fullWidth size="lg" className="mt-5" onClick={handleCheckout} isLoading={checkoutMutation.isPending}>
              <MessageCircle className="h-4 w-4" /> Checkout via WhatsApp
            </Button>
            <p className="mt-3 text-center text-xs text-navy-soft">
              We'll confirm your order and delivery details over WhatsApp.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
