import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';

import { categoriesApi } from '@/api/categories';
import { getApiErrorMessage } from '@/api/client';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { Table, type TableColumn } from '@/components/common/Table';
import { AdminLayout } from '@/components/layout/admin/AdminLayout';
import { ImageUpload } from '@/components/common/ImageUpload';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { resolveIcon } from '@/constants';
import type { CategoryCreateInput, CategoryWithCount } from '@/types';

const emptyForm: CategoryCreateInput = { name: '', description: '', icon: 'Shirt', display_order: 0 };

export function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryWithCount | null>(null);
  const [form, setForm] = useState<CategoryCreateInput>(emptyForm);
  const [formError, setFormError] = useState('');

  const { data: categories, isLoading } = useQuery({ queryKey: ['admin-categories'], queryFn: categoriesApi.list });

  const createMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
    onError: (err) => setFormError(getApiErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoryCreateInput }) => categoriesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
    onError: (err) => setFormError(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setCategoryToDelete(null);
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => categoriesApi.uploadImage(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err) => setFormError(getApiErrorMessage(err)),
  });

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setIsModalOpen(true);
  }

  function openEditModal(category: CategoryWithCount) {
    setEditingId(category.id);
    setForm({ name: category.name, description: category.description || '', icon: category.icon, display_order: category.display_order });
    setFormError('');
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  }

  function handleSubmit() {
    setFormError('');
    if (!form.name.trim()) return setFormError('Category name is required.');
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload: form });
    } else {
      createMutation.mutate(form);
    }
  }

  const columns: TableColumn<CategoryWithCount>[] = [
    {
      key: 'image',
      header: 'Image',
      render: (c) => {
        if (c.image_url) {
          return (
            <div className="flex h-10 w-10 overflow-hidden rounded-lg border border-navy/10">
              <img src={c.image_url} alt={c.name} className="h-full w-full object-cover" />
            </div>
          );
        }
        const Icon = resolveIcon(c.icon);
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-pale text-pink-deep">
            <Icon className="h-5 w-5" />
          </div>
        );
      },
    },
    { key: 'name', header: 'Name', render: (c) => <span className="font-bold text-navy">{c.name}</span> },
    { key: 'slug', header: 'Slug', render: (c) => <code className="text-xs text-navy-soft">{c.slug}</code> },
    { key: 'count', header: 'Products', align: 'center', render: (c) => c.product_count },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) => (
        <div className="flex justify-end gap-1.5">
          <button onClick={() => openEditModal(c)} className="rounded-lg p-1.5 text-navy-soft hover:bg-pink-pale hover:text-pink-deep">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setCategoryToDelete(c)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout pageTitle="Categories">
      <Card
        noPadding
        title="Product Categories"
        subtitle="Organize your storefront into shoppable categories"
        action={
          <Button size="sm" onClick={openCreateModal}>
            <Plus className="h-3.5 w-3.5" /> Add Category
          </Button>
        }
      >
        <div className="p-4">
          <Table columns={columns} data={categories ?? []} rowKey={(c) => c.id} isLoading={isLoading} emptyMessage="No categories yet." />
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit Category' : 'Add Category'}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSubmit} isLoading={createMutation.isPending || updateMutation.isPending}>
              Save Category
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {editingId ? (
            <ImageUpload
              currentImageUrl={categories?.find(c => c.id === editingId)?.image_url}
              isUploading={uploadImageMutation.isPending}
              onUpload={(file) => uploadImageMutation.mutateAsync({ id: editingId, file }).then(() => { })}
            />
          ) : (
            <p className="rounded-lg bg-cream-2 px-3 py-2 text-xs text-navy-soft">
              Save the category first, then you'll be able to upload its image.
            </p>
          )}

          <Input label="Category Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Wedding Sets" required />
          <Input label="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input
            label="Display Order"
            type="number"
            value={form.display_order}
            onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
            hint="Lower numbers appear first"
          />
          {formError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{formError}</p>}
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={() => categoryToDelete && deleteMutation.mutate(categoryToDelete.id)}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? All products in this category will also be deleted. This action cannot be undone.`}
        confirmText="Delete Category"
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </AdminLayout>
  );
}
