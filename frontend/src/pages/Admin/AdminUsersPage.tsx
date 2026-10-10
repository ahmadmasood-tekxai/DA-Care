import { useDeferredValue, useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  UserPlus,
  Users,
  UserX,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import clsx from 'clsx';

import { getApiErrorMessage } from '@/api/client';
import { ordersApi } from '@/api/orders';
import { usersApi } from '@/api/users';
import { Button } from '@/components/common/Button';
import { Input, Select } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { AdminLayout } from '@/components/layout/admin/AdminLayout';
import { Avatar } from '@/components/layout/public/AccountMenu';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, USER_ROLE_LABELS } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { AuthProvider, UserRole, type AdminUser } from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format';

type Filter = 'all' | 'customers' | 'staff' | 'inactive';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'customers', label: 'Customers' },
  { id: 'staff', label: 'Staff & admins' },
  { id: 'inactive', label: 'Deactivated' },
];

const ROLE_STYLES: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'bg-navy text-gold-light border-navy',
  [UserRole.STAFF]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  [UserRole.CUSTOMER]: 'bg-cream-2 text-navy-soft border-navy/10',
};

function Stat({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-navy/[.07] bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-navy-soft">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream-2 text-pink-deep"><Icon className="h-4 w-4" /></span>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold text-navy">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-navy-soft">{hint}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Customer detail (orders) modal
// ---------------------------------------------------------------------------
function UserOrdersModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders', 'user', user.id],
    queryFn: () => ordersApi.list(undefined, undefined, user.id),
  });

  return (
    <Modal isOpen onClose={onClose} title={`${user.full_name || user.username} — purchases`} size="lg">
      <div className="mb-5 grid gap-3 rounded-xl bg-cream p-4 text-sm sm:grid-cols-3">
        <p className="flex items-center gap-2 text-navy"><Mail className="h-4 w-4 text-pink-deep" /> <span className="truncate">{user.email}</span></p>
        <p className="flex items-center gap-2 text-navy"><Phone className="h-4 w-4 text-pink-deep" /> {user.phone || '—'}</p>
        <p className="flex items-center gap-2 text-navy"><Wallet className="h-4 w-4 text-pink-deep" /> {formatCurrency(user.total_spent)} spent</p>
      </div>
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : !orders?.length ? (
        <p className="py-10 text-center text-sm text-navy-soft">No orders placed from this account yet.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="rounded-xl border border-navy/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-navy">Order #{o.id}</p>
                  <p className="text-xs text-navy-soft">{formatDateTime(o.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={clsx('rounded-full border px-2.5 py-0.5 text-xs font-bold', ORDER_STATUS_COLORS[o.status])}>
                    {ORDER_STATUS_LABELS[o.status]}
                  </span>
                  <span className="font-display font-semibold text-navy">{formatCurrency(o.total_amount)}</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-navy-soft">
                {o.items.map((i) => `${i.quantity}× ${i.product_name_snapshot}`).join(' · ')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Add staff modal
// ---------------------------------------------------------------------------
function AddStaffModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ full_name: '', username: '', email: '', password: '', role: UserRole.STAFF });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => usersApi.createStaff(form),
    onSuccess: (u) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: `${USER_ROLE_LABELS[u.role]} account created`, description: u.email });
      onClose();
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) return setError('Password needs at least 8 characters.');
    mutation.mutate();
  };
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Add a team member"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" variant="navy" type="submit" form="add-staff" isLoading={mutation.isPending}>Create account</Button>
        </>
      }
    >
      <form id="add-staff" onSubmit={submit} className="space-y-4">
        <Input label="Full name" name="full_name" value={form.full_name} onChange={set('full_name')} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Username" name="username" value={form.username} onChange={set('username')} required minLength={3} />
          <Select
            label="Role"
            name="role"
            value={form.role}
            onChange={set('role')}
            options={[
              { value: UserRole.STAFF, label: 'Staff — products & orders' },
              { value: UserRole.ADMIN, label: 'Admin — full access' },
            ]}
          />
        </div>
        <Input label="Email" name="email" type="email" value={form.email} onChange={set('email')} required />
        <Input label="Temporary password" name="password" type="text" value={form.password} onChange={set('password')} required hint="Share it privately — they can change it from their account." />
        {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user: me } = useAuth();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const [viewing, setViewing] = useState<AdminUser | null>(null);
  const [adding, setAdding] = useState(false);

  const { data: users, isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: () => usersApi.list() });

  const update = useMutation({
    mutationFn: ({ id, ...payload }: { id: number; is_active?: boolean; role?: UserRole }) => usersApi.update(id, payload),
    onSuccess: (u) => {
      queryClient.setQueryData<AdminUser[]>(['admin-users'], (prev) => prev?.map((x) => (x.id === u.id ? u : x)));
      toast({ title: 'Account updated', description: `${u.full_name || u.username} · ${u.is_active ? USER_ROLE_LABELS[u.role] : 'Deactivated'}` });
    },
    onError: (err) => toast({ title: 'Update failed', description: getApiErrorMessage(err), variant: 'error' }),
  });

  const stats = useMemo(() => {
    const list = users ?? [];
    const customers = list.filter((u) => u.role === UserRole.CUSTOMER);
    const monthAgo = Date.now() - 30 * 24 * 3600 * 1000;
    return {
      customers: customers.length,
      newThisMonth: customers.filter((u) => new Date(u.created_at).getTime() > monthAgo).length,
      buyers: customers.filter((u) => u.orders_count > 0).length,
      revenue: customers.reduce((sum, u) => sum + Number(u.total_spent), 0),
      staff: list.length - customers.length,
    };
  }, [users]);

  const visible = useMemo(() => {
    return (users ?? []).filter((u) => {
      if (filter === 'customers' && u.role !== UserRole.CUSTOMER) return false;
      if (filter === 'staff' && u.role === UserRole.CUSTOMER) return false;
      if (filter === 'inactive' && u.is_active) return false;
      if (!deferredSearch) return true;
      return [u.full_name, u.email, u.username, u.phone ?? ''].some((v) => v.toLowerCase().includes(deferredSearch));
    });
  }, [users, filter, deferredSearch]);

  return (
    <AdminLayout pageTitle="Customers & Staff">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat icon={Users} label="Customers" value={isLoading ? '—' : String(stats.customers)} hint={`${stats.newThisMonth} joined in the last 30 days`} />
          <Stat icon={ShoppingBag} label="Have ordered" value={isLoading ? '—' : String(stats.buyers)} hint={stats.customers ? `${Math.round((stats.buyers / stats.customers) * 100)}% of customers` : undefined} />
          <Stat icon={Wallet} label="Customer revenue" value={isLoading ? '—' : formatCurrency(stats.revenue)} hint="From signed-in orders" />
          <Stat icon={ShieldCheck} label="Team" value={isLoading ? '—' : String(stats.staff)} hint="Admins & staff" />
        </div>

        <div className="overflow-hidden rounded-2xl border border-navy/[.07] bg-white shadow-soft">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-navy/[.07] p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-1 overflow-x-auto no-scrollbar rounded-xl bg-cream-2 p-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={clsx(
                    'shrink-0 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors',
                    filter === f.id ? 'bg-white text-navy shadow-soft' : 'text-navy-soft hover:text-navy'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <label className="relative flex-1 lg:w-72">
                <span className="sr-only">Search users</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-soft/60" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, phone…"
                  className="h-10 w-full rounded-xl border border-navy/10 bg-cream/60 pl-9 pr-3 text-sm focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/20"
                />
              </label>
              <button onClick={() => setAdding(true)} className="btn btn-primary btn-sm shrink-0 rounded-xl">
                <UserPlus className="h-4 w-4" /> <span className="max-sm:hidden">Add staff</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy/[.07] bg-cream/50 text-xs uppercase tracking-wider text-navy-soft">
                  <th className="px-5 py-3 font-semibold">Account</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 text-right font-semibold">Orders</th>
                  <th className="px-4 py-3 text-right font-semibold">Spent</th>
                  <th className="px-4 py-3 font-semibold">Last active</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/[.06]">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-5 py-4"><div className="skeleton h-9" /></td>
                    </tr>
                  ))
                  : visible.map((u) => {
                    const isMe = u.id === me?.id;
                    return (
                      <tr key={u.id} className={clsx('transition-colors hover:bg-cream/40', !u.is_active && 'opacity-60')}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar user={u} size="h-10 w-10 text-xs" />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-navy">
                                {u.full_name || u.username}
                                {isMe && <span className="ml-1.5 text-xs font-normal text-navy-soft">(you)</span>}
                              </p>
                              <p className="truncate text-xs text-navy-soft">
                                {u.email}
                                {u.auth_provider === AuthProvider.GOOGLE && <span className="ml-1.5 rounded bg-cream-2 px-1.5 py-px text-[10px] font-semibold text-navy">Google</span>}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {isMe ? (
                            <span className={clsx('rounded-full border px-2.5 py-1 text-xs font-bold', ROLE_STYLES[u.role])}>{USER_ROLE_LABELS[u.role]}</span>
                          ) : (
                            <select
                              value={u.role}
                              onChange={(e) => update.mutate({ id: u.id, role: e.target.value as UserRole })}
                              aria-label={`Role for ${u.email}`}
                              className={clsx('cursor-pointer rounded-full border px-2.5 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-gold/30', ROLE_STYLES[u.role])}
                            >
                              {Object.values(UserRole).map((r) => <option key={r} value={r}>{USER_ROLE_LABELS[r]}</option>)}
                            </select>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-navy">{u.orders_count}</td>
                        <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-navy">{formatCurrency(u.total_spent)}</td>
                        <td className="px-4 py-3.5 text-xs text-navy-soft">
                          {u.last_login ? formatDate(u.last_login) : 'Never signed in'}
                          <span className="block">Joined {formatDate(u.created_at)}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => update.mutate({ id: u.id, is_active: !u.is_active })}
                            disabled={isMe || update.isPending}
                            title={isMe ? "You can't deactivate yourself" : u.is_active ? 'Deactivate account' : 'Reactivate account'}
                            className={clsx(
                              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold transition-colors disabled:cursor-not-allowed',
                              u.is_active
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 enabled:hover:bg-emerald-100'
                                : 'border-rose-200 bg-rose-50 text-rose-700 enabled:hover:bg-rose-100'
                            )}
                          >
                            {u.is_active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                            {u.is_active ? 'Active' : 'Deactivated'}
                          </button>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button onClick={() => setViewing(u)} className="btn btn-outline btn-sm rounded-xl">
                            <ShoppingBag className="h-3.5 w-3.5" /> Purchases
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                {!isLoading && visible.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center text-sm text-navy-soft">
                      {users?.length ? 'No accounts match your filters.' : 'No accounts yet — customers appear here as soon as they sign up.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewing && <UserOrdersModal user={viewing} onClose={() => setViewing(null)} />}
      {adding && <AddStaffModal onClose={() => setAdding(false)} />}
    </AdminLayout>
  );
}
