import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AlertTriangle, BadgeCheck, Boxes, Mail, MailWarning, Package, Send, ShoppingCart, TrendingUp, Users, Wallet } from 'lucide-react';

import { getApiErrorMessage } from '@/api/client';
import { dashboardApi } from '@/api/dashboard';
import { emailApi } from '@/api/users';
import { Card } from '@/components/common/Card';
import { AdminLayout } from '@/components/layout/admin/AdminLayout';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { UserRole } from '@/types';
import { formatCurrency } from '@/utils/format';

const AUTOMATED_EMAILS = [
  'Order received + payment instructions',
  'Transfer received → confirmed / rejected',
  'Confirmed, shipped & delivered follow-ups',
  'Delivered email asks for a star rating',
  'Welcome email for new accounts',
  'Store alerts: new orders, payments, low stock',
];

/** Shows whether SMTP is configured and lets an admin send a test message. */
function EmailCard() {
  const { toast } = useToast();
  const { data, isLoading, isError } = useQuery({ queryKey: ['email-status'], queryFn: emailApi.status });
  const test = useMutation({
    mutationFn: () => emailApi.sendTest(),
    onSuccess: (r) => toast({ title: 'Test email sent', description: r.message }),
    onError: (err) => toast({ title: 'Email failed', description: getApiErrorMessage(err), variant: 'error', durationMs: 8000 }),
  });

  const enabled = !!data?.enabled;
  return (
    <Card
      title="Email notifications"
      subtitle={isLoading ? 'Checking…' : enabled ? `Sending as ${data?.from_name} <${data?.from_email}>` : 'Not configured on the server'}
      action={
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
            enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          {enabled ? <BadgeCheck className="h-3.5 w-3.5" /> : <MailWarning className="h-3.5 w-3.5" />}
          {isLoading ? '…' : enabled ? 'Active' : isError ? 'Unknown' : 'Off'}
        </span>
      }
    >
      <ul className="grid gap-2 text-sm text-navy-soft sm:grid-cols-2">
        {AUTOMATED_EMAILS.map((t) => (
          <li key={t} className="flex items-start gap-2"><Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pink-deep" /> {t}</li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-xs text-navy-soft">
          {enabled ? <>Store alerts go to <strong className="text-navy">{data?.admin_email}</strong>.</> : 'Set SMTP_USERNAME and SMTP_PASSWORD in the backend environment.'}
        </p>
        <button onClick={() => test.mutate()} disabled={!enabled || test.isPending} className="btn btn-primary btn-sm rounded-xl">
          <Send className="h-3.5 w-3.5" /> {test.isPending ? 'Sending…' : 'Send test email'}
        </button>
      </div>
    </Card>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Boxes;
  tone: 'pink' | 'navy' | 'amber' | 'emerald';
}) {
  const toneClasses = {
    pink: 'bg-pink-pale text-pink-deep',
    navy: 'bg-navy/10 text-navy',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-navy-soft">{label}</p>
          <p className="font-display text-xl font-semibold text-navy">{value}</p>
        </div>
      </div>
    </Card>
  );
}

// Skeleton for a single stat card
function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 rounded-xl bg-slate-200" />
        <div className="space-y-2 flex-1">
          <div className="h-3 w-2/3 rounded-full bg-slate-200" />
          <div className="h-6 w-1/2 rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

// Skeleton for the top-products list rows
function TopProductsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-xl bg-cream-2 px-4 py-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-full bg-slate-300" />
            <div className="space-y-1.5">
              <div className="h-4 w-36 rounded-full bg-slate-200" />
              <div className="h-3 w-20 rounded-full bg-slate-200" />
            </div>
          </div>
          <div className="h-5 w-24 rounded-full bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

export function AdminDashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-summary'], queryFn: dashboardApi.getSummary });
  const { user } = useAuth();

  return (
    <AdminLayout pageTitle="Dashboard">
      <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading || !data ? (
            <>
              {Array.from({ length: 9 }).map((_, i) => <StatCardSkeleton key={i} />)}
            </>
          ) : (
            <>
              <StatCard label="Total Revenue" value={formatCurrency(data.total_revenue)} icon={Wallet} tone="emerald" />
              <StatCard label="Total Orders" value={String(data.total_orders)} icon={ShoppingCart} tone="pink" />
              <StatCard label="Pending Orders" value={String(data.pending_orders)} icon={AlertTriangle} tone="amber" />
              <StatCard label="Total Products" value={String(data.total_products)} icon={Package} tone="navy" />
              <StatCard label="Categories" value={String(data.total_categories)} icon={Boxes} tone="navy" />
              <StatCard label="Low Stock Items" value={String(data.low_stock_products)} icon={AlertTriangle} tone="amber" />
              <StatCard label="Customers" value={String(data.total_customers)} icon={Users} tone="pink" />
              <StatCard label="Payments to Verify" value={String(data.payments_to_verify)} icon={BadgeCheck} tone={data.payments_to_verify ? 'amber' : 'emerald'} />
              <StatCard label="Avg. Order Value" value={formatCurrency(data.total_orders ? data.total_revenue / data.total_orders : 0)} icon={TrendingUp} tone="emerald" />
            </>
          )}
        </div>

        {data && data.payments_to_verify > 0 && (
          <Link
            to={ROUTES.ADMIN_ORDERS}
            className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 transition-colors hover:bg-amber-100"
          >
            <span className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span><strong>{data.payments_to_verify} bank transfer{data.payments_to_verify === 1 ? '' : 's'}</strong> waiting for verification — customers are notified as soon as you confirm.</span>
            </span>
            <span className="shrink-0 font-semibold">Review →</span>
          </Link>
        )}

        {user?.role === UserRole.ADMIN && <EmailCard />}

        {/* Top products */}
        <Card title="Top Selling Products" subtitle="Ranked by total revenue generated">
          {isLoading || !data ? (
            <TopProductsSkeleton />
          ) : data.top_products.length === 0 ? (
            <p className="text-sm text-navy-soft">No sales yet — orders will show up here once logged.</p>
          ) : (
            <div className="space-y-3">
              {data.top_products.map((p, i) => (
                <div key={p.product_name} className="flex items-center justify-between rounded-xl bg-cream-2 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-deep text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-navy">{p.product_name}</p>
                      <p className="text-xs text-navy-soft">{p.units_sold} units sold</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 font-display font-semibold text-navy">
                    <TrendingUp className="h-4 w-4 text-emerald-500" /> {formatCurrency(p.revenue)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
