import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/api/client';
import { ordersApi } from '@/api/orders';
import { Card } from '@/components/common/Card';
import { Table, type TableColumn } from '@/components/common/Table';
import { AdminLayout } from '@/components/layout/admin/AdminLayout';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/constants';
import { OrderStatus, type Order } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils/format';

export function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useQuery({ queryKey: ['admin-orders'], queryFn: () => ordersApi.list() });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) => ordersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
    onError: (err) => alert(getApiErrorMessage(err)),
  });

  const columns: TableColumn<Order>[] = [
    { key: 'date', header: 'Date', render: (o) => formatDateTime(o.created_at) },
    {
      key: 'customer',
      header: 'Customer',
      render: (o) => (
        <div>
          <p className="font-bold text-navy">{o.customer_name}</p>
          <p className="text-xs text-navy-soft">{o.customer_phone}</p>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      render: (o) => (
        <div className="max-w-xs text-xs text-navy-soft">
          {o.items.map((i) => `${i.product_name_snapshot} x${i.quantity}`).join(', ')}
        </div>
      ),
    },
    { key: 'total', header: 'Total', align: 'right', render: (o) => <span className="font-bold text-navy">{formatCurrency(o.total_amount)}</span> },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (o) => (
        <select
          value={o.status}
          onChange={(e) => statusMutation.mutate({ id: o.id, status: e.target.value as OrderStatus })}
          className={`rounded-full border px-2.5 py-1 text-xs font-bold ${ORDER_STATUS_COLORS[o.status]}`}
        >
          {Object.values(OrderStatus).map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
          ))}
        </select>
      ),
    },
  ];

  const totalRevenue = (orders ?? [])
    .filter((o) => o.status !== OrderStatus.CANCELLED)
    .reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <AdminLayout pageTitle="Orders & Revenue">
      <Card
        noPadding
        title="All Orders"
        subtitle={`${orders?.length ?? 0} total orders — ${formatCurrency(totalRevenue)} in active revenue`}
      >
        <div className="p-4">
          <Table columns={columns} data={orders ?? []} rowKey={(o) => o.id} isLoading={isLoading} emptyMessage="No orders logged yet." />
        </div>
      </Card>
    </AdminLayout>
  );
}
