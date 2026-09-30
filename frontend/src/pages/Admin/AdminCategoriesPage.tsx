import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, FolderPlus, FolderTree, Pencil, Plus, Trash2 } from 'lucide-react';

import { categoriesApi } from '@/api/categories';
import { getApiErrorMessage } from '@/api/client';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { AdminLayout } from '@/components/layout/admin/AdminLayout';
import { ImageUpload } from '@/components/common/ImageUpload';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { Badge } from '@/components/common/Badge';
import { resolveIcon } from '@/constants';
import type { CategoryCreateInput, CategoryWithCount } from '@/types';

const emptyForm: CategoryCreateInput = { name: '', description: '', icon: 'Shirt', display_order: 0, parent_id: null };

export function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryWithCount | null>(null);
  const [form, setForm] = useState<CategoryCreateInput>(emptyForm);
  const [formError, setFormError] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [isAddingSubcategoryFor, setIsAddingSubcategoryFor] = useState<CategoryWithCount | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: categoriesApi.list,
  });

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
    setEditingCategory(null);
    setIsAddingSubcategoryFor(null);
    setForm(emptyForm);
    setFormError('');
    setIsModalOpen(true);
  }

  function openAddSubcategoryModal(parentCategory: CategoryWithCount) {
    setEditingId(null);
    setEditingCategory(null);
    setIsAddingSubcategoryFor(parentCategory);
    setForm({ ...emptyForm, parent_id: parentCategory.id });
    setFormError('');
    setIsModalOpen(true);
  }

  function openEditModal(category: CategoryWithCount) {
    setEditingId(category.id);
    setEditingCategory(category);
    setIsAddingSubcategoryFor(null);
    setForm({
      name: category.name,
      description: category.description || '',
      icon: category.icon,
      display_order: category.display_order,
      parent_id: category.parent_id ?? null,
    });
    setFormError('');
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
    setEditingCategory(null);
    setIsAddingSubcategoryFor(null);
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

  function toggleExpand(id: number) {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const modalTitle = editingId
    ? `Edit — ${editingCategory?.name}`
    : isAddingSubcategoryFor
    ? `Add Subcategory to "${isAddingSubcategoryFor.name}"`
    : 'Add Category';

  return (
    <AdminLayout pageTitle="Categories">
      <Card
        noPadding
        title="Product Categories"
        subtitle="Organize your storefront into shoppable categories and subcategories"
        action={
          <Button size="sm" onClick={openCreateModal}>
            <Plus className="h-3.5 w-3.5" /> Add Category
          </Button>
        }
      >
        <div className="divide-y divide-navy/5">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-navy-soft">Loading categories…</div>
          ) : !categories?.length ? (
            <div className="p-8 text-center text-sm text-navy-soft">No categories yet. Add your first one!</div>
          ) : (
            (categories as CategoryWithCount[]).map((category) => {
              const isExpanded = expandedCategories.has(category.id);
              const hasSubcategories = (category.subcategories?.length ?? 0) > 0;
              const Icon = resolveIcon(category.icon);

              return (
                <div key={category.id}>
                  {/* Parent Category Row */}
                  <div className="flex items-center gap-3 px-5 py-4 hover:bg-cream-2/60 transition-colors">
                    {/* Expand toggle */}
                    <button
                      onClick={() => hasSubcategories && toggleExpand(category.id)}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-navy-soft transition-colors ${hasSubcategories ? 'hover:bg-pink-pale hover:text-pink-deep cursor-pointer' : 'cursor-default opacity-30'}`}
                    >
                      {hasSubcategories ? (
                        isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                      ) : (
                        <span className="h-4 w-4" />
                      )}
                    </button>

                    {/* Icon / Image */}
                    {category.image_url ? (
                      <img src={category.image_url} alt={category.name} className="h-10 w-10 rounded-lg object-cover border border-navy/10 shrink-0" />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pink-pale text-pink-deep">
                        <Icon className="h-5 w-5" />
                      </div>
                    )}

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy truncate">{category.name}</span>
                        {hasSubcategories && (
                          <Badge tone="info" className="shrink-0">
                            {category.subcategories!.length} sub
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-navy-soft mt-0.5">
                        <code className="text-[11px]">{category.slug}</code>
                        {' · '}
                        <span>{category.product_count} products</span>
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openAddSubcategoryModal(category)}
                        className="rounded-lg p-1.5 text-navy-soft hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        title="Add subcategory"
                      >
                        <FolderPlus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(category)}
                        className="rounded-lg p-1.5 text-navy-soft hover:bg-pink-pale hover:text-pink-deep transition-colors"
                        title="Edit category"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setCategoryToDelete(category)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Subcategories (expanded) */}
                  {isExpanded && hasSubcategories && (
                    <div className="bg-cream-2/30 border-t border-navy/5">
                      {category.subcategories!.map((sub) => {
                        const SubIcon = resolveIcon(sub.icon);
                        return (
                          <div key={sub.id} className="flex items-center gap-3 py-3 pl-14 pr-5 hover:bg-cream-2/60 transition-colors border-b border-navy/5 last:border-b-0">
                            <FolderTree className="h-4 w-4 shrink-0 text-navy-soft/50" />

                            {sub.image_url ? (
                              <img src={sub.image_url} alt={sub.name} className="h-8 w-8 rounded-md object-cover border border-navy/10 shrink-0" />
                            ) : (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-400">
                                <SubIcon className="h-4 w-4" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-semibold text-navy">{sub.name}</span>
                              <p className="text-xs text-navy-soft"><code className="text-[11px]">{sub.slug}</code></p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => openEditModal(sub as unknown as CategoryWithCount)}
                                className="rounded-lg p-1.5 text-navy-soft hover:bg-pink-pale hover:text-pink-deep transition-colors"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => setCategoryToDelete(sub as unknown as CategoryWithCount)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Create / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalTitle}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSubmit} isLoading={createMutation.isPending || updateMutation.isPending}>
              {editingId ? 'Save Changes' : isAddingSubcategoryFor ? 'Add Subcategory' : 'Add Category'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {editingId && (
            <ImageUpload
              currentImageUrl={editingCategory?.image_url}
              isUploading={uploadImageMutation.isPending}
              onUpload={(file) => uploadImageMutation.mutateAsync({ id: editingId, file }).then(() => {})}
            />
          )}

          {isAddingSubcategoryFor && (
            <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <FolderTree className="h-4 w-4 shrink-0" />
              <span>Adding subcategory under <strong>{isAddingSubcategoryFor.name}</strong></span>
            </div>
          )}

          {!editingId && !isAddingSubcategoryFor && (
            <p className="rounded-lg bg-cream-2 px-3 py-2 text-xs text-navy-soft">
              💡 Save the category first, then you'll be able to upload its image.
            </p>
          )}

          <Input
            label="Category Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={isAddingSubcategoryFor ? 'e.g. Summer Collection' : 'e.g. Wedding Sets'}
            required
          />
          <Input
            label="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {!isAddingSubcategoryFor && !form.parent_id && (
            <Input
              label="Display Order"
              type="number"
              value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
              hint="Lower numbers appear first"
            />
          )}

          {formError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{formError}</p>}
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={() => categoryToDelete && deleteMutation.mutate(categoryToDelete.id)}
        title="Delete Category"
        message={
          categoryToDelete?.parent_id
            ? `Are you sure you want to delete the subcategory "${categoryToDelete?.name}"? Products in it will lose this subcategory.`
            : `Are you sure you want to delete "${categoryToDelete?.name}"? All products and subcategories in this category will also be deleted.`
        }
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </AdminLayout>
  );
}
