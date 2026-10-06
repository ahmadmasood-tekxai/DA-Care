import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, CheckCircle, XCircle, ShoppingBag, Loader2, User as UserIcon } from 'lucide-react';
import { usersApi } from '@/api/users';
import { ordersApi } from '@/api/orders';
import { AdminLayout } from '@/components/layout/admin/AdminLayout';
import type { User, Order } from '@/types';
import { formatCurrency } from '@/utils/format';

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: usersApi.listUsers,
  });

  const { data: userOrders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['admin-user-orders', selectedUser?.id],
    queryFn: () => ordersApi.listOrders({ user_id: selectedUser!.id }),
    enabled: !!selectedUser,
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      usersApi.updateStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  if (isLoading) {
    return (
      <AdminLayout pageTitle="Users">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#C9A84C]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Users">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">Manage customers and staff accounts.</p>
        </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Last Login
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.profile_image ? (
                        <img src={user.profile_image} alt="" className="h-10 w-10 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A84C]/10 text-[#C9A84C]">
                          <UserIcon className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name}</p>
                        <p className="flex items-center gap-1 text-xs text-gray-500">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <button
                      onClick={() => toggleStatus.mutate({ id: user.id, isActive: !user.is_active })}
                      disabled={toggleStatus.isPending}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold transition-colors ${
                        user.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {user.is_active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {user.is_active ? 'Active' : 'Deactivated'}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-[#C9A84C]"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      View Purchases
                    </button>
                  </td>
                </tr>
              ))}
              {users?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Orders Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="font-display text-xl font-bold text-gray-900">
                Purchases: {selectedUser.full_name}
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-6">
              {isOrdersLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#C9A84C]" />
                </div>
              ) : userOrders?.length === 0 ? (
                <p className="text-center text-gray-500 py-12">No purchases found for this user.</p>
              ) : (
                <div className="space-y-4">
                  {userOrders?.map((order: Order) => (
                    <div key={order.id} className="rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                        <div>
                          <p className="font-medium text-gray-900">Order #{order.id}</p>
                          <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#C9A84C]">{formatCurrency(order.total_amount)}</p>
                          <span className="text-xs font-medium uppercase text-gray-500">{order.status}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-700">{item.quantity}x {item.product_name_snapshot}</span>
                            <span className="text-gray-500">{formatCurrency(item.unit_price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}
