import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from 'lucide-react';

import { categoriesApi } from '@/api/categories';
import { getApiErrorMessage } from '@/api/client';
import { productsApi } from '@/api/products';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { ImageUpload } from '@/components/common/ImageUpload';
import { Input, Select } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { ConfirmModal } from '@/components/common/ConfirmModal';
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
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductCreateInput>(emptyForm);
  const [formError, setFormError] = useState('');

  // Pagination & Search state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState(''); // local state for input

  const { data: categories } = useQuery({ queryKey: ['admin-categories'], queryFn: categoriesApi.list });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => productsApi.list({ include_inactive: true, page_size: 10, page, search }),
  });

  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
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
    mutationFn: ({ id, files }: { id: number; files: File[] }) => productsApi.uploadImages(id, files),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingProduct(updated);
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setProductToDelete(null);
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

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1); // Reset to page 1 on new search
    setSearch(searchInput);
  }

  const columns: TableColumn<Product>[] = [
    {
      key: 'image',
      header: '',
      render: (p) => {
        const displayImageUrl = p.image_url || (p.images && p.images.length > 0 ? p.images[0].url : '');
        return (
          <div className="h-11 w-11 overflow-hidden rounded-lg">
            <ProductImage imageUrl={displayImageUrl} imageColor={p.image_color} alt={p.name} />
          </div>
        );
      },
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
    {
      key: 'stock',
      header: 'Stock',
      align: 'right',
      render: (p) => (
        <div className="flex flex-col items-end gap-1">
          <span className={`font-bold ${p.stock <= 0 ? 'text-rose-600' : p.stock <= 5 ? 'text-amber-600' : 'text-navy'}`}>
            {p.stock}
          </span>
          {p.stock <= 5 && (
            <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${p.stock <= 0 ? 'text-rose-600' : 'text-amber-600'}`}>
              <AlertTriangle className="h-3 w-3" />
              {p.stock <= 0 ? 'Out of Stock' : 'Critical'}
            </span>
          )}
        </div>
      )
    },
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
            onClick={() => setProductToDelete(p)}
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
        subtitle="Manage inventory, prices, and product details"
        action={
          <Button size="sm" onClick={openCreateModal}>
            <Plus className="h-3.5 w-3.5" /> Add Product
          </Button>
        }
      >
        <div className="border-b border-navy/5 bg-cream-2/50 p-4">
          <form onSubmit={handleSearchSubmit} className="flex max-w-sm items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-soft" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-pink-deep focus:outline-none focus:ring-1 focus:ring-pink-deep"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">Search</Button>
          </form>
        </div>

        <div className="p-4">
          <Table columns={columns} data={productsData?.items ?? []} rowKey={(p) => p.id} isLoading={isLoading} emptyMessage="No products found." />

          {productsData && productsData.total_pages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-navy/5 pt-4 text-sm text-navy-soft">
              <span>
                Showing page <strong className="text-navy">{productsData.page}</strong> of <strong className="text-navy">{productsData.total_pages}</strong>
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={productsData.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(p => Math.min(productsData.total_pages, p + 1))}
                  disabled={productsData.page >= productsData.total_pages}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
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
              additionalImages={editingProduct.images}
              isUploading={uploadImageMutation.isPending}
              multiple={true}
              onUploadMultiple={(files) => uploadImageMutation.mutateAsync({ id: editingProduct.id, files }).then(() => { })}
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

      <ConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={() => productToDelete && deleteMutation.mutate(productToDelete.id)}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </AdminLayout>
  );
}
