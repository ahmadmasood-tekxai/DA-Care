import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Boxes, Package, ShoppingCart, TrendingUp, Wallet } from 'lucide-react';

import { dashboardApi } from '@/api/dashboard';
import { Card } from '@/components/common/Card';
import { AdminLayout } from '@/components/layout/admin/AdminLayout';
import { formatCurrency } from '@/utils/format';

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

  return (
    <AdminLayout pageTitle="Dashboard">
      <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading || !data ? (
            <>
              {Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)}
            </>
          ) : (
            <>
              <StatCard label="Total Revenue" value={formatCurrency(data.total_revenue)} icon={Wallet} tone="emerald" />
              <StatCard label="Total Orders" value={String(data.total_orders)} icon={ShoppingCart} tone="pink" />
              <StatCard label="Pending Orders" value={String(data.pending_orders)} icon={AlertTriangle} tone="amber" />
              <StatCard label="Total Products" value={String(data.total_products)} icon={Package} tone="navy" />
              <StatCard label="Categories" value={String(data.total_categories)} icon={Boxes} tone="navy" />
              <StatCard label="Low Stock Items" value={String(data.low_stock_products)} icon={AlertTriangle} tone="amber" />
            </>
          )}
        </div>

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
