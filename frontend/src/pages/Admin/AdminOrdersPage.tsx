import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, ExternalLink, XCircle } from 'lucide-react';

import { getApiErrorMessage } from '@/api/client';
import { ordersApi } from '@/api/orders';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { Table, type TableColumn } from '@/components/common/Table';
import { AdminLayout } from '@/components/layout/admin/AdminLayout';
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
} from '@/constants';
import { OrderStatus, PaymentMethod, PaymentStatus, type Order } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils/format';

// ---------------------------------------------------------------------------
// Payment Verification Modal
// ---------------------------------------------------------------------------
interface VerifyModalState {
  order: Order;
  action: 'confirm' | 'reject';
}

function PaymentVerifyModal({
  state,
  onClose,
  onSubmit,
  isLoading,
}: {
  state: VerifyModalState;
  onClose: () => void;
  onSubmit: (reason?: string) => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState('');
  const isConfirm = state.action === 'confirm';

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isConfirm ? 'Confirm Payment' : 'Reject Payment'}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit(isConfirm ? undefined : reason)}
            isLoading={isLoading}
            className={isConfirm ? '' : 'bg-rose-600 hover:bg-rose-700'}
          >
            {isConfirm ? 'Yes, Confirm Payment' : 'Reject Payment'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Icon */}
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
            isConfirm ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}
        >
          {isConfirm ? (
            <CheckCircle className="h-8 w-8" />
          ) : (
            <XCircle className="h-8 w-8" />
          )}
        </div>

        {/* Summary */}
        <div className="rounded-xl border border-navy/10 bg-cream-2 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-navy-soft">Order</span>
            <span className="font-bold text-navy">#{state.order.id}</span>
          </div>
          <div className="mt-1.5 flex justify-between">
            <span className="text-navy-soft">Customer</span>
            <span className="font-bold text-navy">{state.order.customer_name}</span>
          </div>
          <div className="mt-1.5 flex justify-between">
            <span className="text-navy-soft">Amount</span>
            <span className="font-bold text-navy">{formatCurrency(state.order.total_amount)}</span>
          </div>
          {state.order.transaction_ref && (
            <div className="mt-1.5 flex justify-between">
              <span className="text-navy-soft">Ref #</span>
              <span className="font-mono text-sm font-bold text-navy">{state.order.transaction_ref}</span>
            </div>
          )}
        </div>

        {isConfirm ? (
          <p className="text-center text-sm text-navy-soft">
            This will mark the payment as <strong className="text-emerald-600">Paid</strong> and notify
            the customer.
          </p>
        ) : (
          <>
            <p className="text-center text-sm text-navy-soft">
              This will mark the payment as <strong className="text-rose-600">Unpaid</strong>.
              Provide a reason below (optional).
            </p>
            <Input
              label="Rejection Reason (optional)"
              placeholder="e.g. Amount did not match, incorrect account..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </>
        )}
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [verifyModal, setVerifyModal] = useState<VerifyModalState | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => ordersApi.list(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
    onError: (err) => alert(getApiErrorMessage(err)),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: number; action: 'confirm' | 'reject'; reason?: string }) =>
      ordersApi.verifyPayment(id, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setVerifyModal(null);
    },
    onError: (err) => alert(getApiErrorMessage(err)),
  });

  const columns: TableColumn<Order>[] = [
    { key: 'date', header: 'Order Date', render: (o) => formatDateTime(o.created_at) },
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
      key: 'total',
      header: 'Total',
      align: 'right',
      render: (o) => <span className="font-bold text-navy">{formatCurrency(o.total_amount)}</span>,
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (o) => (
        <div className="flex flex-col gap-1.5 text-xs">
          <span className="font-semibold text-navy">{PAYMENT_METHOD_LABELS[o.payment_method]}</span>
          <span
            className={`inline-block w-fit rounded-full border px-2 py-0.5 font-bold ${PAYMENT_STATUS_COLORS[o.payment_status]}`}
          >
            {PAYMENT_STATUS_LABELS[o.payment_status]}
          </span>

          {o.payment_method === PaymentMethod.BANK_TRANSFER && (
            <div className="mt-1 flex flex-col gap-1 border-t border-navy/10 pt-1.5">
              {o.transaction_ref && (
                <span className="text-navy-soft">
                  Ref: <span className="font-mono">{o.transaction_ref}</span>
                </span>
              )}
              {o.receipt_image_url && (
                <a
                  href={o.receipt_image_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> View Receipt
                </a>
              )}

              {o.payment_status === PaymentStatus.PENDING_VERIFICATION && (
                <div className="mt-1 flex items-center gap-2">
                  <button
                    onClick={() => setVerifyModal({ order: o, action: 'confirm' })}
                    className="flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-200"
                    disabled={verifyMutation.isPending}
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Confirm
                  </button>
                  <button
                    onClick={() => setVerifyModal({ order: o, action: 'reject' })}
                    className="flex items-center gap-1 rounded-lg bg-rose-100 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-200"
                    disabled={verifyMutation.isPending}
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              )}

              {o.rejection_reason && (
                <div className="mt-1 flex items-start gap-1 rounded bg-rose-50 p-1.5 text-rose-700">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>{o.rejection_reason}</span>
                </div>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Order Status',
      align: 'center',
      render: (o) => (
        <select
          value={o.status}
          onChange={(e) =>
            statusMutation.mutate({ id: o.id, status: e.target.value as OrderStatus })
          }
          className={`rounded-full border px-2.5 py-1 text-xs font-bold ${ORDER_STATUS_COLORS[o.status]}`}
        >
          {Object.values(OrderStatus).map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
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
          <Table
            columns={columns}
            data={orders ?? []}
            rowKey={(o) => o.id}
            isLoading={isLoading}
            emptyMessage="No orders logged yet."
          />
        </div>
      </Card>

      {/* Payment Verification Modal */}
      {verifyModal && (
        <PaymentVerifyModal
          state={verifyModal}
          onClose={() => setVerifyModal(null)}
          onSubmit={(reason) =>
            verifyMutation.mutate({
              id: verifyModal.order.id,
              action: verifyModal.action,
              reason,
            })
          }
          isLoading={verifyMutation.isPending}
        />
      )}
    </AdminLayout>
  );
}
