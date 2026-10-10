import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Copy,
  ImagePlus,
  Lock,
  Mail,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  UserRound,
  Wallet,
} from 'lucide-react';
import clsx from 'clsx';

import { getApiErrorMessage } from '@/api/client';
import { ordersApi } from '@/api/orders';
import { EmptyState } from '@/components/common/EmptyState';
import { ProductImage } from '@/components/common/ProductImage';
import { SEO } from '@/components/common/SEO';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { BANK_ACCOUNTS, ROUTES, WHATSAPP_NUMBER_1 } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { PaymentMethod, type Order } from '@/types';
import { buildWhatsAppLink, formatCurrency, getProductImages } from '@/utils/format';
import meezanLogo from '@/assets/images/meezan-bank-logo.png';
import mashreqLogo from '@/assets/images/mashriq-bank-logo.jfif';

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Bahawalpur'];
const PHONE_RE = /^((\+92)|(0092)|(0))3\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Field = 'name' | 'phone' | 'email' | 'city' | 'address';
type Step = 'cart' | 'bank' | 'done';

function validate(values: Record<Field, string>): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};
  if (values.name.trim().length < 3) errors.name = 'Please enter your full name.';
  if (!PHONE_RE.test(values.phone.replace(/[\s-]/g, ''))) errors.phone = 'Enter a valid mobile number, e.g. 0300 1234567.';
  if (values.email.trim() && !EMAIL_RE.test(values.email.trim())) errors.email = 'Enter a valid email, or leave it blank.';
  if (values.city.trim().length < 2) errors.city = 'Please enter your city.';
  if (values.address.trim().length < 10) errors.address = 'Please enter your full street address.';
  return errors;
}

function FormField({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-navy">{label}</label>
      {children}
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

function Steps({ step }: { step: Step }) {
  const items = ['Cart', 'Payment', 'Confirmed'];
  const current = step === 'cart' ? 0 : step === 'bank' ? 1 : 2;
  return (
    <ol className="flex items-center gap-2 text-xs font-medium sm:gap-3" aria-label="Checkout progress">
      {items.map((label, i) => (
        <li key={label} className="flex items-center gap-2 sm:gap-3">
          <span className={clsx('flex items-center gap-2', i <= current ? 'text-navy' : 'text-navy-soft/50')}>
            <span
              className={clsx(
                'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold',
                i < current ? 'bg-emerald-500 text-white' : i === current ? 'bg-navy text-white' : 'bg-cream-3 text-navy-soft'
              )}
            >
              {i < current ? '✓' : i + 1}
            </span>
            {label}
          </span>
          {i < items.length - 1 && <span className="h-px w-6 bg-navy/15 sm:w-10" />}
        </li>
      ))}
    </ol>
  );
}

function BankCard({ logo, bank, title, lines }: { logo: string; bank: string; title: string; lines: { label: string; value: string }[] }) {
  const { toast } = useToast();
  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: `${label} copied`, description: value, variant: 'info', durationMs: 2000 });
    } catch {
      toast({ title: 'Copy failed', description: 'Please select and copy manually.', variant: 'error' });
    }
  };

  return (
    <div className="rounded-2xl bg-navy p-5 text-white ring-1 ring-gold/20">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1.5">
          <img src={logo} alt="" className="h-full w-full object-contain" />
        </span>
        <span className="font-display text-lg font-semibold">{bank}</span>
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Account title</p>
      <p className="mb-4 font-medium">{title}</p>
      {lines.map(({ label, value }) => (
        <div key={label} className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">{label}</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="break-all font-mono text-sm font-semibold text-gold-light sm:text-base">{value}</p>
            <button
              onClick={() => copy(value, label)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/80 transition-colors hover:bg-white/20"
              aria-label={`Copy ${label}`}
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CartPage() {
  const { items, subtotal, savings, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [values, setValues] = useState<Record<Field, string>>(() => ({
    name: user?.full_name ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
    city: '',
    address: '',
  }));
  const [note, setNote] = useState('');
  const [touched, setTouched] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH_ON_DELIVERY);
  const [serverError, setServerError] = useState('');
  const [step, setStep] = useState<Step>('cart');
  const [order, setOrder] = useState<Order | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const errors = touched ? validate(values) : {};

  const checkoutMutation = useMutation({
    mutationFn: ordersApi.create,
    onSuccess: (data) => {
      setOrder(data);
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      if (data.payment_method === PaymentMethod.CASH_ON_DELIVERY) {
        clearCart();
        setStep('done');
      } else {
        setStep('bank');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (err) => setServerError(getApiErrorMessage(err)),
  });

  const transferMutation = useMutation({
    mutationFn: () => ordersApi.markTransferred(order!.id, transactionRef.trim(), receiptFile ?? undefined),
    onSuccess: () => {
      clearCart();
      setStep('done');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (err) => setServerError(getApiErrorMessage(err)),
  });

  const set = (field: Field) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const handleCheckout = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setServerError('');
    const found = validate(values);
    if (Object.keys(found).length > 0) {
      document.getElementById(`checkout-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    checkoutMutation.mutate({
      customer_name: values.name.trim(),
      customer_phone: values.phone.replace(/[\s-]/g, ''),
      customer_email: values.email.trim() || undefined,
      customer_address: `${values.address.trim()}, ${values.city.trim()}`.slice(0, 255),
      note: note.trim() || undefined,
      items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      payment_method: paymentMethod,
    });
  };

  const fieldClass = (field: Field) => clsx('field', errors[field] && 'border-rose-400 focus:border-rose-400 focus:ring-rose-200');
  const aria = (field: Field) => ({ 'aria-invalid': !!errors[field], 'aria-describedby': errors[field] ? `checkout-${field}-error` : undefined });

  // ── Confirmation ──────────────────────────────────────────────────────────
  if (step === 'done') {
    const isBank = order?.payment_method === PaymentMethod.BANK_TRANSFER;
    return (
      <PublicLayout>
        <SEO title="Order confirmed" noIndex />
        <section className="container-page max-w-2xl py-12 sm:py-20">
          <div className="mb-8 flex justify-center"><Steps step="done" /></div>
          <div className="card px-6 py-10 text-center sm:px-12">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <h1 className="heading-lg mt-5">Thank you{order ? `, ${order.customer_name.split(' ')[0]}` : ''}!</h1>
            <p className="mx-auto mt-3 max-w-md text-navy-soft">
              {isBank
                ? "We've received your transfer details. Our team will verify the payment and confirm your order shortly."
                : "Your order is placed. We'll call you to confirm delivery — please keep cash ready when it arrives."}
            </p>
            {order?.customer_email && (
              <p className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm text-navy">
                <Mail className="h-4 w-4 text-pink-deep" /> Confirmation sent to <strong className="font-semibold">{order.customer_email}</strong>
              </p>
            )}
            {order && (
              <dl className="mx-auto mt-8 grid max-w-sm grid-cols-2 gap-4 rounded-2xl bg-cream p-5 text-left text-sm">
                <div><dt className="text-navy-soft">Order number</dt><dd className="font-semibold text-navy">#{order.id}</dd></div>
                <div><dt className="text-navy-soft">Total</dt><dd className="font-semibold text-navy">{formatCurrency(order.total_amount)}</dd></div>
                <div><dt className="text-navy-soft">Payment</dt><dd className="font-semibold text-navy">{isBank ? 'Bank transfer' : 'Cash on delivery'}</dd></div>
                <div><dt className="text-navy-soft">Delivery</dt><dd className="font-semibold text-navy">3–5 working days</dd></div>
              </dl>
            )}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              {user ? (
                <Link to={ROUTES.ACCOUNT} className="btn btn-primary">Track your order</Link>
              ) : (
                <Link to={ROUTES.PRODUCTS} className="btn btn-primary">Continue shopping</Link>
              )}
              <a
                href={buildWhatsAppLink(WHATSAPP_NUMBER_1, `Hi! I just placed order #${order?.id ?? ''}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                <MessageCircle className="h-4 w-4" /> Message us
              </a>
            </div>
          </div>
        </section>
      </PublicLayout>
    );
  }

  // ── Bank transfer ─────────────────────────────────────────────────────────
  if (step === 'bank' && order) {
    return (
      <PublicLayout>
        <SEO title="Complete your payment" noIndex />
        <section className="container-page max-w-3xl py-10 sm:py-16">
          <div className="mb-8 flex justify-center"><Steps step="bank" /></div>
          <div className="text-center">
            <h1 className="heading-lg">Complete your bank transfer</h1>
            <p className="mx-auto mt-3 max-w-lg text-navy-soft">
              Transfer <strong className="text-navy">{formatCurrency(order.total_amount)}</strong> to either account below, then
              confirm. Your order <strong className="text-navy">#{order.id}</strong> is reserved.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <BankCard
              logo={meezanLogo}
              bank={BANK_ACCOUNTS.meezan.bank}
              title={BANK_ACCOUNTS.meezan.title}
              lines={[{ label: 'Account number', value: BANK_ACCOUNTS.meezan.account }]}
            />
            <BankCard
              logo={mashreqLogo}
              bank={BANK_ACCOUNTS.mashreq.bank}
              title={BANK_ACCOUNTS.mashreq.title}
              lines={[
                { label: 'Account number', value: BANK_ACCOUNTS.mashreq.account },
                { label: 'IBAN', value: BANK_ACCOUNTS.mashreq.iban },
              ]}
            />
          </div>

          <div className="card mt-6 space-y-5 p-6 sm:p-8">
            <h2 className="font-display text-xl">Confirm your transfer</h2>
            <FormField id="txn-ref" label="Transaction reference (optional)">
              <input id="txn-ref" className="field" value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} placeholder="e.g. 1234567890" />
            </FormField>
            <div>
              <p className="mb-1.5 text-sm font-medium text-navy">Payment receipt (optional)</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-navy/15 bg-cream/60 px-4 py-7 text-center transition-colors hover:border-gold"
              >
                <ImagePlus className="h-6 w-6 text-pink-deep" />
                <span className="text-sm font-semibold text-navy">{receiptFile ? receiptFile.name : 'Upload a screenshot'}</span>
                <span className="text-xs text-navy-soft">PNG or JPG — helps us verify faster</span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)} />
            </div>
            {serverError && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{serverError}</p>}
            <button onClick={() => transferMutation.mutate()} disabled={transferMutation.isPending} className="btn btn-primary btn-lg w-full">
              {transferMutation.isPending ? 'Submitting…' : "I've made the transfer"}
            </button>
          </div>
        </section>
      </PublicLayout>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <PublicLayout>
        <SEO title="Your cart" noIndex />
        <section className="container-page max-w-xl py-20">
          <EmptyState
            icon={<ShoppingBag className="h-6 w-6" />}
            title="Your cart is empty"
            description="Browse our collections and add your favourites — they'll wait for you here."
            action={<Link to={ROUTES.PRODUCTS} className="btn btn-primary mt-2">Start shopping</Link>}
          />
        </section>
      </PublicLayout>
    );
  }

  // ── Cart + checkout ───────────────────────────────────────────────────────
  return (
    <PublicLayout>
      <SEO title="Your cart" noIndex />
      <section className="container-page py-8 sm:py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link to={ROUTES.PRODUCTS} className="mb-3 inline-flex items-center gap-1.5 text-sm text-navy-soft hover:text-navy">
              <ArrowLeft className="h-4 w-4" /> Continue shopping
            </Link>
            <h1 className="heading-lg">Checkout</h1>
          </div>
          <Steps step="cart" />
        </div>

        <form onSubmit={handleCheckout} noValidate className="grid gap-8 lg:grid-cols-[1fr_420px] lg:gap-10">
          <div className="space-y-8">
            {/* Items */}
            <div className="card divide-y divide-navy/[.07]">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4 p-4 sm:p-5">
                  <Link to={ROUTES.PRODUCT_DETAIL(product.slug)} className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-cream-2 sm:h-28 sm:w-24">
                    <ProductImage imageUrl={getProductImages(product)[0]} imageColor={product.image_color} alt={product.name} width={200} sizes="96px" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link to={ROUTES.PRODUCT_DETAIL(product.slug)} className="line-clamp-2 font-semibold text-navy hover:text-pink-deep">
                          {product.name}
                        </Link>
                        <p className="mt-0.5 text-sm text-navy-soft">{formatCurrency(product.price)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(product.id)}
                        className="-mr-1.5 -mt-1.5 rounded-full p-2 text-navy-soft/50 transition-colors hover:bg-rose-50 hover:text-rose-600"
                        aria-label={`Remove ${product.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center rounded-full border border-navy/15">
                        <button type="button" onClick={() => updateQuantity(product.id, quantity - 1)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-cream-2" aria-label="Decrease quantity">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold tabular-nums">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={product.stock > 0 && quantity >= product.stock}
                          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-cream-2 disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="font-bold text-navy">{formatCurrency(product.price * quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Account */}
            {user ? (
              <p className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <UserRound className="h-4 w-4 shrink-0" />
                <span>Signed in as <strong className="font-semibold">{user.email}</strong> — you can track this order in your account.</span>
              </p>
            ) : (
              <div className="flex flex-col gap-3 rounded-2xl border border-gold/30 bg-gold/[.07] px-4 py-3.5 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-3 text-navy">
                  <UserRound className="h-4 w-4 shrink-0 text-gold-dark" />
                  <span><strong className="font-semibold">Have an account?</strong> Sign in to track this order and check out faster.</span>
                </span>
                <Link to={`${ROUTES.LOGIN}?next=${ROUTES.CART}`} className="btn btn-outline btn-sm shrink-0">Sign in</Link>
              </div>
            )}

            {/* Delivery details */}
            <section className="card space-y-4 p-5 sm:p-6" aria-labelledby="delivery-heading">
              <h2 id="delivery-heading" className="font-display text-xl">Delivery details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="checkout-name" label="Full name" error={errors.name}>
                  <input id="checkout-name" className={fieldClass('name')} value={values.name} onChange={set('name')} autoComplete="name" placeholder="e.g. Sara Ahmed" {...aria('name')} />
                </FormField>
                <FormField id="checkout-phone" label="Mobile number" error={errors.phone}>
                  <input id="checkout-phone" className={fieldClass('phone')} value={values.phone} onChange={set('phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="0300 1234567" {...aria('phone')} />
                </FormField>
              </div>
              <FormField id="checkout-email" label="Email for order updates (recommended)" error={errors.email}>
                <input
                  id="checkout-email"
                  type="email"
                  inputMode="email"
                  className={fieldClass('email')}
                  value={values.email}
                  onChange={set('email')}
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...aria('email')}
                />
                {!errors.email && <p className="mt-1.5 text-xs text-navy-soft">We'll email your confirmation and let you know when it ships.</p>}
              </FormField>
              <FormField id="checkout-city" label="City" error={errors.city}>
                <input id="checkout-city" list="pk-cities" className={fieldClass('city')} value={values.city} onChange={set('city')} autoComplete="address-level2" placeholder="e.g. Lahore" {...aria('city')} />
                <datalist id="pk-cities">{CITIES.map((c) => <option key={c} value={c} />)}</datalist>
              </FormField>
              <FormField id="checkout-address" label="Street address" error={errors.address}>
                <textarea
                  id="checkout-address"
                  rows={2}
                  maxLength={220}
                  className={clsx(fieldClass('address'), 'resize-none')}
                  value={values.address}
                  onChange={set('address')}
                  autoComplete="street-address"
                  placeholder="House, street, area, nearby landmark"
                  {...aria('address')}
                />
              </FormField>
              <FormField id="checkout-note" label="Order notes (optional)">
                <input id="checkout-note" className="field" maxLength={255} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Gift wrap, preferred delivery time…" />
              </FormField>
            </section>

            {/* Payment */}
            <section className="card p-5 sm:p-6">
              <h2 id="payment-heading" className="mb-4 font-display text-xl">Payment method</h2>
              <div role="radiogroup" aria-labelledby="payment-heading" className="grid gap-3 sm:grid-cols-2">
                {[
                  { value: PaymentMethod.CASH_ON_DELIVERY, icon: Wallet, title: 'Cash on delivery', desc: 'Pay when your order arrives' },
                  { value: PaymentMethod.BANK_TRANSFER, icon: Building2, title: 'Bank transfer', desc: 'Meezan or Mashreq Bank' },
                ].map(({ value, icon: Icon, title, desc }) => (
                  <label
                    key={value}
                    className={clsx(
                      'flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors',
                      paymentMethod === value ? 'border-navy bg-cream/60' : 'border-navy/10 hover:border-navy/30'
                    )}
                  >
                    <input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} className="mt-1 accent-[#0d0a0a]" />
                    <span className="flex-1">
                      <span className="flex items-center gap-2 font-semibold text-navy"><Icon className="h-4 w-4 text-pink-deep" /> {title}</span>
                      <span className="mt-0.5 block text-xs text-navy-soft">{desc}</span>
                    </span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="card p-5 sm:p-6">
              <h2 className="font-display text-xl">Order summary</h2>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-navy-soft">Subtotal ({items.reduce((n, i) => n + i.quantity, 0)} items)</dt><dd className="font-medium">{formatCurrency(subtotal)}</dd></div>
                {savings > 0 && (
                  <div className="flex justify-between text-emerald-700"><dt>You save</dt><dd className="font-medium">−{formatCurrency(savings)}</dd></div>
                )}
                <div className="flex justify-between"><dt className="text-navy-soft">Delivery</dt><dd className="font-medium text-emerald-700">Free</dd></div>
                <div className="flex items-baseline justify-between border-t border-navy/10 pt-4">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-display text-2xl font-semibold">{formatCurrency(subtotal)}</dd>
                </div>
              </dl>

              {serverError && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{serverError}</p>}

              <button type="submit" disabled={checkoutMutation.isPending} className="btn btn-primary btn-lg mt-6 w-full">
                <Lock className="h-4 w-4" />
                {checkoutMutation.isPending ? 'Placing order…' : paymentMethod === PaymentMethod.BANK_TRANSFER ? 'Continue to payment' : 'Place order'}
              </button>
              <ul className="mt-5 space-y-2 text-xs text-navy-soft">
                <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-pink-deep" /> Delivered in 3–5 working days</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-pink-deep" /> 7-day easy exchange</li>
              </ul>
            </div>
          </aside>
        </form>
      </section>
    </PublicLayout>
  );
}
