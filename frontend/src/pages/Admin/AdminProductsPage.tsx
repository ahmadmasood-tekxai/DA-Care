import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';

import { categoriesApi } from '@/api/categories';
import { getApiErrorMessage } from '@/api/client';
import { productsApi } from '@/api/products';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { ImageUpload } from '@/components/common/ImageUpload';
import { Input, Select } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { ProductImage } from '@/components/common/ProductImage';
import { Table, type TableColumn } from '@/components/common/Table';
import { AdminLayout } from '@/components/layout/admin/AdminLayout';
import { PRODUCT_BADGE_LABELS } from '@/constants';
import { ProductBadge, type Product, type ProductCreateInput } from '@/types';
import { formatCurrency } from '@/utils/format';

const emptyForm: ProductCreateInput = {
  category_id: 0,
  name: '',
  short_description: '',
  description: '',
  price: 0,
  old_price: null,
  stock: 0,
  image_color: '#22304F',
  badge: ProductBadge.NONE,
  is_featured: false,
  is_active: true,
};

export function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductCreateInput>(emptyForm);
  const [formError, setFormError] = useState('');

  const { data: categories } = useQuery({ queryKey: ['admin-categories'], queryFn: categoriesApi.list });
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => productsApi.list({ include_inactive: true, page_size: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      // Keep the modal open on the newly created product so the admin can immediately upload its image.
      setEditingProduct(created);
      setFormError('');
    },
    onError: (err) => setFormError(getApiErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductCreateInput }) => productsApi.update(id, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingProduct(updated);
      setFormError('');
    },
    onError: (err) => setFormError(getApiErrorMessage(err)),
  });

  const uploadImageMutation = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => productsApi.uploadImage(id, file),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingProduct(updated);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  function openCreateModal() {
    setEditingProduct(null);
    setForm({ ...emptyForm, category_id: categories?.[0]?.id ?? 0 });
    setFormError('');
    setIsModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setForm({
      category_id: product.category_id, name: product.name, short_description: product.short_description,
      description: product.description || '', price: product.price, old_price: product.old_price,
      stock: product.stock, image_color: product.image_color, badge: product.badge,
      is_featured: product.is_featured, is_active: product.is_active,
    });
    setFormError('');
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingProduct(null);
    setForm(emptyForm);
  }

  function handleSubmit() {
    setFormError('');
    if (!form.name.trim()) return setFormError('Product name is required.');
    if (!form.category_id) return setFormError('Please select a category.');
    if (!form.price || form.price <= 0) return setFormError('Enter a valid price.');

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, payload: form });
    } else {
      createMutation.mutate(form);
    }
  }

  const columns: TableColumn<Product>[] = [
    {
      key: 'image',
      header: '',
      render: (p) => (
        <div className="h-11 w-11 overflow-hidden rounded-lg">
          <ProductImage imageUrl={p.image_url} imageColor={p.image_color} alt={p.name} />
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Product',
      render: (p) => (
        <div>
          <p className="font-bold text-navy">{p.name}</p>
          {p.badge !== ProductBadge.NONE && (
            <Badge tone="info" className="mt-1">{PRODUCT_BADGE_LABELS[p.badge]}</Badge>
          )}
        </div>
      ),
    },
    { key: 'price', header: 'Price', align: 'right', render: (p) => formatCurrency(p.price) },
    { key: 'stock', header: 'Stock', align: 'right', render: (p) => p.stock },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (p) => (p.is_active ? <Badge tone="success">Active</Badge> : <Badge tone="default">Hidden</Badge>),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (p) => (
        <div className="flex justify-end gap-1.5">
          <button onClick={() => openEditModal(p)} className="rounded-lg p-1.5 text-navy-soft hover:bg-pink-pale hover:text-pink-deep">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => confirm(`Delete "${p.name}"?`) && deleteMutation.mutate(p.id)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout pageTitle="Products">
      <Card
        noPadding
        title="Products"
        subtitle="Add, edit, and manage stock across all categories"
        action={
          <Button size="sm" onClick={openCreateModal}>
            <Plus className="h-3.5 w-3.5" /> Add Product
          </Button>
        }
      >
        <div className="p-4">
          <Table columns={columns} data={products?.items ?? []} rowKey={(p) => p.id} isLoading={isLoading} emptyMessage="No products yet." />
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? `Edit — ${editingProduct.name}` : 'Add New Product'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Close</Button>
            <Button onClick={handleSubmit} isLoading={createMutation.isPending || updateMutation.isPending}>
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {editingProduct && (
            <ImageUpload
              currentImageUrl={editingProduct.image_url}
              isUploading={uploadImageMutation.isPending}
              onUpload={(file) => uploadImageMutation.mutateAsync({ id: editingProduct.id, file }).then(() => {})}
            />
          )}
          {!editingProduct && (
            <p className="rounded-lg bg-cream-2 px-3 py-2 text-xs text-navy-soft">
              Save the product first, then you'll be able to upload its photo.
            </p>
          )}

          <Select
            label="Category"
            value={String(form.category_id || '')}
            onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
            placeholder="Select a category…"
            options={(categories ?? []).map((c) => ({ value: String(c.id), label: c.name }))}
          />
          <Input label="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input
            label="Short Description"
            value={form.short_description}
            onChange={(e) => setForm({ ...form, short_description: e.target.value })}
            placeholder="One line shown on product cards"
          />
          <div>
            <label className="mb-1.5 block text-sm font-bold text-navy">Full Description (optional)</label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-pink-deep focus:outline-none focus:ring-2 focus:ring-pink-deep"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Price (Rs.)" type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} required />
            <Input
              label="Old Price (optional)"
              type="number"
              min="0"
              value={form.old_price ?? ''}
              onChange={(e) => setForm({ ...form, old_price: e.target.value ? parseFloat(e.target.value) : null })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Stock Quantity" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} />
            <Select
              label="Badge"
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value as ProductBadge })}
              options={Object.values(ProductBadge).map((b) => ({ value: b, label: PRODUCT_BADGE_LABELS[b] || 'None' }))}
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-navy">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="rounded border-slate-300 text-pink-deep focus:ring-pink-deep" />
              Featured on Home
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-navy">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-slate-300 text-pink-deep focus:ring-pink-deep" />
              Active (visible on storefront)
            </label>
          </div>

          {formError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{formError}</p>}
        </div>
      </Modal>
    </AdminLayout>
  );
}
