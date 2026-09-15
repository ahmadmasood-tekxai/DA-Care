import { useState, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, Copy, Image as ImageIcon, Minus, Plus, ShoppingBag, Trash2, Building, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

import { getApiErrorMessage } from '@/api/client';
import { ordersApi } from '@/api/orders';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Input } from '@/components/common/Input';
import { ProductImage } from '@/components/common/ProductImage';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { ROUTES } from '@/constants';
import { useCart } from '@/hooks/useCart';
import { useSEO } from '@/hooks/useSEO';
import { PaymentMethod } from '@/types';
import { formatCurrency } from '@/utils/format';

export function CartPage() {
  useSEO({
    title: 'Your Shopping Cart',
    description:
      'Review your OKIRA order, enter your details, and choose between Cash on Delivery or Bank Transfer. Nationwide delivery across Pakistan.',
    keywords: 'OKIRA cart, checkout Pakistan, cash on delivery Pakistan',
  });

  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH_ON_DELIVERY);
  const [formError, setFormError] = useState('');
  
  // Bank transfer flow state
  const [orderId, setOrderId] = useState<number | null>(null);
  const [showBankTransferDetails, setShowBankTransferDetails] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const { data: bankDetails } = useQuery({
    queryKey: ['bank-details'],
    queryFn: ordersApi.getBankDetails,
    enabled: paymentMethod === PaymentMethod.BANK_TRANSFER,
  });

  const checkoutMutation = useMutation({
    mutationFn: ordersApi.create,
    onSuccess: (data) => {
      setOrderId(data.id);
      if (data.payment_method === PaymentMethod.CASH_ON_DELIVERY) {
        setOrderConfirmed(true);
        clearCart();
      } else {
        setShowBankTransferDetails(true);
      }
    },
    onError: (err) => setFormError(getApiErrorMessage(err)),
  });

  const markTransferredMutation = useMutation({
    mutationFn: () => ordersApi.markTransferred(orderId!, transactionRef, receiptFile || undefined),
    onSuccess: () => {
      setOrderConfirmed(true);
      setShowBankTransferDetails(false);
      clearCart();
    },
    onError: (err) => setFormError(getApiErrorMessage(err)),
  });

  const handleCheckout = () => {
    setFormError('');
    if (!customerName.trim()) return setFormError('Please enter your name.');
    if (!customerPhone.trim()) return setFormError('Please enter your phone number.');
    if (!customerAddress.trim()) return setFormError('Please enter your delivery address.');

    checkoutMutation.mutate({
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      payment_method: paymentMethod,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app, show a toast notification here
  };

  if (orderConfirmed) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-md px-6 py-28 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-display font-semibold">Order Confirmed!</h1>
          <p className="mt-3 text-navy-soft">
            Thank you for your order. We will process it shortly and keep you updated.
          </p>
          <Link to={ROUTES.PRODUCTS} className="mt-8 inline-block">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  if (showBankTransferDetails && bankDetails) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-xl px-6 py-14">
          <div className="rounded-3xl border border-navy/10 bg-white p-8 shadow-xl shadow-navy/5">
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-pale text-pink-deep">
                <Building className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-display font-semibold">Bank Transfer Required</h2>
              <p className="mt-2 text-navy-soft">
                Please transfer <strong>{formatCurrency(subtotal)}</strong> to the account below to complete your order.
              </p>
            </div>

            <div className="space-y-4 rounded-xl bg-cream-2 p-5 mb-8 border border-navy/5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-navy-soft mb-1">Account Title</p>
                <p className="font-semibold text-lg">{bankDetails.account_title}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-navy-soft mb-1">Bank Name</p>
                <p className="font-semibold text-lg">{bankDetails.bank_name}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-navy-soft mb-1">Account Number</p>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-lg font-semibold">{bankDetails.account_number}</p>
                  <button onClick={() => copyToClipboard(bankDetails.account_number)} className="text-pink-deep hover:text-navy flex items-center gap-1 text-sm font-semibold">
                    <Copy className="h-4 w-4" /> Copy
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-navy-soft mb-1">IBAN</p>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-lg font-semibold">{bankDetails.iban}</p>
                  <button onClick={() => copyToClipboard(bankDetails.iban)} className="text-pink-deep hover:text-navy flex items-center gap-1 text-sm font-semibold">
                    <Copy className="h-4 w-4" /> Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Confirm your transfer</h3>
              
              <Input
                label="Transaction Reference Number (Optional)"
                placeholder="e.g. 1234567890"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
              />

              <div>
                <label className="mb-1.5 block text-sm font-bold text-navy">Payment Receipt (Optional)</label>
                <div 
                  className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-navy/20 bg-cream py-6 transition-colors hover:border-pink-deep"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-center">
                    <ImageIcon className="mx-auto mb-2 h-6 w-6 text-navy-soft" />
                    <span className="text-sm font-semibold text-pink-deep">
                      {receiptFile ? receiptFile.name : 'Upload Screenshot'}
                    </span>
                  </div>
                </div>
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                />
              </div>

              {formError && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{formError}</p>}

              <Button
                fullWidth
                size="lg"
                className="mt-4"
                isLoading={markTransferredMutation.isPending}
                onClick={() => markTransferredMutation.mutate()}
              >
                I've Made the Transfer
              </Button>
            </div>
          </div>
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
            description="Browse our premium collections and add your favorites."
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
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-navy">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-navy hover:bg-pink-pale"
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
              <Input label="Delivery Address" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="Full Address required" required />
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-sm mb-3">Payment Method</h4>
              <div className="space-y-2">
                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${paymentMethod === PaymentMethod.CASH_ON_DELIVERY ? 'border-pink-deep bg-pink-pale/30' : 'border-navy/10 hover:bg-cream-2'}`}>
                  <input type="radio" name="payment" value={PaymentMethod.CASH_ON_DELIVERY} checked={paymentMethod === PaymentMethod.CASH_ON_DELIVERY} onChange={() => setPaymentMethod(PaymentMethod.CASH_ON_DELIVERY)} className="accent-pink-deep" />
                  <Truck className="h-5 w-5 text-navy-soft" />
                  <span className="text-sm font-medium">Cash on Delivery</span>
                </label>
                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${paymentMethod === PaymentMethod.BANK_TRANSFER ? 'border-pink-deep bg-pink-pale/30' : 'border-navy/10 hover:bg-cream-2'}`}>
                  <input type="radio" name="payment" value={PaymentMethod.BANK_TRANSFER} checked={paymentMethod === PaymentMethod.BANK_TRANSFER} onChange={() => setPaymentMethod(PaymentMethod.BANK_TRANSFER)} className="accent-pink-deep" />
                  <Building className="h-5 w-5 text-navy-soft" />
                  <span className="text-sm font-medium">Manual Bank Transfer</span>
                </label>
              </div>
            </div>

            {formError && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{formError}</p>}

            <div className="mt-6">
              <Button fullWidth size="lg" onClick={handleCheckout} isLoading={checkoutMutation.isPending}>
                Place Order
              </Button>
            </div>
            <p className="mt-3 text-center text-xs text-navy-soft">
              By placing your order you agree to our terms and conditions.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
