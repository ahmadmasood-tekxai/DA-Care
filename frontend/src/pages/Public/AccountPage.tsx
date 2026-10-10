import { useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Check,
  ChevronDown,
  Heart,
  KeyRound,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Package,
  ShoppingBag,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import clsx from 'clsx';

import { authApi } from '@/api/auth';
import { getApiErrorMessage } from '@/api/client';
import { ordersApi } from '@/api/orders';
import { EmptyState } from '@/components/common/EmptyState';
import { SEO } from '@/components/common/SEO';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  ROUTES,
  WHATSAPP_NUMBER_1,
} from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useWishlist } from '@/hooks/useWishlist';
import { OrderStatus, PaymentMethod, PaymentStatus, type Order } from '@/types';
import { buildWhatsAppLink, formatCurrency, formatDate, initials } from '@/utils/format';

type Tab = 'orders' | 'profile' | 'security';

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'orders', label: 'My orders', icon: Package },
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'security', label: 'Password', icon: KeyRound },
];

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
const STEPS = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED];
const STEP_LABELS = ['Placed', 'Confirmed', 'Shipped', 'Delivered'];

function OrderProgress({ status }: { status: OrderStatus }) {
  const current = STEPS.indexOf(status);
  return (
    <ol className="grid grid-cols-4 gap-1.5" aria-label="Order progress">
      {STEP_LABELS.map((label, i) => (
        <li key={label} aria-current={i === current ? 'step' : undefined}>
          <span className={clsx('block h-1.5 rounded-full', i <= current ? 'bg-gold' : 'bg-navy/10')} />
          <span className={clsx('mt-1.5 flex items-center justify-center gap-1 text-[11px] sm:text-xs', i <= current ? 'font-semibold text-navy' : 'text-navy-soft/60')}>
            {i < current && <Check className="h-3 w-3 text-emerald-600" />}
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function OrderCard({ order, defaultOpen }: { order: Order; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const cancelled = order.status === OrderStatus.CANCELLED;
  const awaitingTransfer = order.payment_method === PaymentMethod.BANK_TRANSFER && order.payment_status === PaymentStatus.UNPAID && !cancelled;
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <article className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full flex-wrap items-center gap-x-6 gap-y-3 p-5 text-left transition-colors hover:bg-cream/50 sm:p-6"
      >
        <div className="min-w-[120px]">
          <p className="text-xs text-navy-soft">Order</p>
          <p className="font-display text-lg font-semibold lining-nums text-navy">#{order.id}</p>
        </div>
        <div>
          <p className="text-xs text-navy-soft">Placed</p>
          <p className="text-sm font-medium text-navy">{formatDate(order.created_at)}</p>
        </div>
        <div>
          <p className="text-xs text-navy-soft">Total</p>
          <p className="text-sm font-semibold text-navy">{formatCurrency(order.total_amount)}</p>
        </div>
        <span className={clsx('rounded-full border px-3 py-1 text-xs font-bold', ORDER_STATUS_COLORS[order.status])}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
        <ChevronDown className={clsx('ml-auto h-5 w-5 text-navy-soft transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="animate-fade-in space-y-6 border-t border-navy/[.07] p-5 sm:p-6">
          {!cancelled && <OrderProgress status={order.status} />}

          {awaitingTransfer && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-semibold">Awaiting your bank transfer</p>
              <p className="mt-1">
                {order.rejection_reason ? `We couldn't verify your last transfer: ${order.rejection_reason}. ` : ''}
                Transfer {formatCurrency(order.total_amount)} and send us the receipt on WhatsApp to confirm this order.
              </p>
            </div>
          )}

          <ul className="divide-y divide-navy/[.07]">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-medium text-navy">{item.product_name_snapshot}</span>
                  <span className="text-xs text-navy-soft">Qty {item.quantity} × {formatCurrency(item.unit_price)}</span>
                </span>
                <span className="shrink-0 font-semibold text-navy">{formatCurrency(item.unit_price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <dl className="grid gap-4 rounded-xl bg-cream p-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-navy-soft">Deliver to</dt>
              <dd className="mt-0.5 font-medium text-navy">{order.customer_address || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-navy-soft">Payment</dt>
              <dd className="mt-0.5 font-medium text-navy">
                {PAYMENT_METHOD_LABELS[order.payment_method]}
                {order.payment_method === PaymentMethod.BANK_TRANSFER && (
                  <span className="block text-xs font-normal text-navy-soft">{PAYMENT_STATUS_LABELS[order.payment_status]}</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-navy-soft">{itemCount} item{itemCount === 1 ? '' : 's'} · free delivery</dt>
              <dd className="mt-0.5 font-display text-lg font-semibold lining-nums text-navy">{formatCurrency(order.total_amount)}</dd>
            </div>
          </dl>

          <a
            href={buildWhatsAppLink(WHATSAPP_NUMBER_1, `Hi! I have a question about my order #${order.id}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            <MessageCircle className="h-4 w-4" /> Get help with this order
          </a>
        </div>
      )}
    </article>
  );
}

function OrdersTab() {
  const { data: orders, isLoading, isError } = useQuery({ queryKey: ['my-orders'], queryFn: ordersApi.mine });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
    );
  }
  if (isError) return <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">We couldn't load your orders. Please refresh the page.</p>;
  if (!orders?.length) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-6 w-6" />}
        title="No orders yet"
        description="When you place an order while signed in, you'll be able to follow it here from confirmed to delivered."
        action={<Link to={ROUTES.PRODUCTS} className="btn btn-primary mt-2">Start shopping</Link>}
      />
    );
  }
  return (
    <div className="space-y-4">
      {orders.map((o, i) => <OrderCard key={o.id} order={o} defaultOpen={i === 0} />)}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile & password
// ---------------------------------------------------------------------------
function ProfileTab() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');

  const mutation = useMutation({
    mutationFn: () => authApi.updateMe({ full_name: fullName.trim(), phone: phone.trim() }),
    onSuccess: (u) => {
      setUser(u);
      toast({ title: 'Profile updated' });
    },
    onError: (err) => toast({ title: 'Could not save', description: getApiErrorMessage(err), variant: 'error' }),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <form onSubmit={submit} className="card max-w-xl space-y-5 p-6 sm:p-8">
      <div>
        <h2 className="font-display text-xl">Personal details</h2>
        <p className="mt-1 text-sm text-navy-soft">Used to pre-fill checkout so ordering takes seconds.</p>
      </div>
      <div>
        <label htmlFor="acc-name" className="mb-1.5 block text-sm font-medium text-navy">Full name</label>
        <input id="acc-name" className="field" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
      </div>
      <div>
        <label htmlFor="acc-phone" className="mb-1.5 block text-sm font-medium text-navy">Mobile number</label>
        <input id="acc-phone" className="field" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0300 1234567" autoComplete="tel" />
      </div>
      <div>
        <label htmlFor="acc-email" className="mb-1.5 block text-sm font-medium text-navy">Email</label>
        <input id="acc-email" className="field bg-cream/70 text-navy-soft" value={user?.email ?? ''} readOnly />
        <p className="mt-1.5 text-xs text-navy-soft">Order confirmations and delivery updates are sent here.</p>
      </div>
      <button type="submit" disabled={mutation.isPending} className="btn btn-primary">
        {mutation.isPending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}

function SecurityTab() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const googleOnly = !user?.has_password;
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => authApi.updateMe({ current_password: current || undefined, new_password: next }),
    onSuccess: (u) => {
      setUser(u);
      setCurrent('');
      setNext('');
      toast({ title: 'Password updated' });
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (next.length < 8) return setError('Your new password needs at least 8 characters.');
    mutation.mutate();
  };

  return (
    <form onSubmit={submit} className="card max-w-xl space-y-5 p-6 sm:p-8">
      <div>
        <h2 className="font-display text-xl">{googleOnly ? 'Add a password' : 'Change password'}</h2>
        <p className="mt-1 text-sm text-navy-soft">
          {googleOnly
            ? 'You sign in with Google. Add a password if you also want to sign in with your email.'
            : 'Choose a strong password you don’t use anywhere else.'}
        </p>
      </div>
      {!googleOnly && (
        <div>
          <label htmlFor="pw-current" className="mb-1.5 block text-sm font-medium text-navy">Current password</label>
          <input id="pw-current" type="password" className="field" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
        </div>
      )}
      <div>
        <label htmlFor="pw-new" className="mb-1.5 block text-sm font-medium text-navy">New password</label>
        <input id="pw-new" type="password" className="field" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" placeholder="At least 8 characters" />
      </div>
      {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      <button type="submit" disabled={mutation.isPending} className="btn btn-primary">
        {mutation.isPending ? 'Updating…' : 'Update password'}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export function AccountPage() {
  const { user, isStaff, logout } = useAuth();
  const navigate = useNavigate();
  const { count: wishlistCount } = useWishlist();
  const [params, setParams] = useSearchParams();
  const tab = (TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'orders') as Tab;
  const { data: orders } = useQuery({ queryKey: ['my-orders'], queryFn: ordersApi.mine });

  if (!user) return null;
  const spent = (orders ?? []).filter((o) => o.status !== OrderStatus.CANCELLED).reduce((sum, o) => sum + Number(o.total_amount), 0);
  const firstName = user.full_name?.split(' ')[0] || user.username;

  return (
    <PublicLayout>
      <SEO title="My account" noIndex />

      {/* Header */}
      <section className="border-b border-navy/[.07] bg-white">
        <div className="container-page flex flex-col gap-6 py-8 sm:py-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {user.profile_image ? (
              <img src={user.profile_image} alt="" referrerPolicy="no-referrer" className="h-16 w-16 rounded-full object-cover ring-2 ring-gold/40" />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-navy font-display text-xl font-semibold text-gold-light ring-2 ring-gold/40">
                {initials(user.full_name || user.username)}
              </span>
            )}
            <div>
              <p className="eyebrow">My account</p>
              <h1 className="font-display text-3xl font-semibold text-navy">Hi, {firstName}</h1>
              <p className="text-sm text-navy-soft">Member since {formatDate(user.created_at)}</p>
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: 'Orders', value: String(orders?.length ?? '—') },
              { label: 'Total spent', value: orders ? formatCurrency(spent) : '—' },
              { label: 'Wishlist', value: String(wishlistCount) },
            ].map((s) => (
              <div key={s.label} className="flex flex-col-reverse rounded-2xl bg-cream px-4 py-3 text-center sm:px-6">
                <dt className="text-[11px] font-medium uppercase tracking-wider text-navy-soft">{s.label}</dt>
                <dd className="font-display text-lg font-semibold lining-nums text-navy sm:text-xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-page grid gap-8 py-8 sm:py-12 lg:grid-cols-[240px_1fr]">
        <nav aria-label="Account" className="flex gap-2 overflow-x-auto no-scrollbar lg:flex-col">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setParams(id === 'orders' ? {} : { tab: id }, { replace: true })}
              aria-current={tab === id ? 'page' : undefined}
              className={clsx(
                'flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                tab === id ? 'bg-navy text-white' : 'text-navy-soft hover:bg-white hover:text-navy'
              )}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
          <Link to={ROUTES.WISHLIST} className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-navy-soft transition-colors hover:bg-white hover:text-navy">
            <Heart className="h-4 w-4" /> Wishlist
            {wishlistCount > 0 && <span className="ml-auto rounded-full bg-cream-3 px-2 text-xs font-bold text-navy">{wishlistCount}</span>}
          </Link>
          {isStaff && (
            <Link to={ROUTES.ADMIN_DASHBOARD} className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-navy-soft transition-colors hover:bg-white hover:text-navy">
              <LayoutDashboard className="h-4 w-4" /> Admin panel
            </Link>
          )}
          <button onClick={() => { logout(); navigate(ROUTES.HOME); }} className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 lg:mt-4">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </nav>

        <div className="min-w-0">
          {tab === 'orders' && <OrdersTab />}
          {tab === 'profile' && <ProfileTab />}
          {tab === 'security' && <SecurityTab />}
        </div>
      </section>
    </PublicLayout>
  );
}
