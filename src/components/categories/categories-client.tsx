'use client';

import { useState, useEffect } from 'react';
import { Plus, Tags, Pencil, Trash2 } from 'lucide-react';
import { deleteCategory } from '@/app/actions/master-data';
import { CategoryModal } from '@/components/categories/category-modal';
import { DeleteConfirmModal } from '@/components/ui/delete-confirm-modal';
import { SuccessModal } from '@/components/ui/success-modal';
import type { ItemCategoryType } from '@/app/actions/items';
import { useRouter, useSearchParams } from 'next/navigation';

type CategoryType = {
  id: string;
  name: string;
  type: ItemCategoryType;
  codePrefix: string;
  _count: { items: number };
};

type CategoriesClientProps = {
  initialCategories: CategoryType[];
};

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actionParam = searchParams.get('action');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<CategoryType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (actionParam === 'new') {
      setEditCategory(null);
      setIsModalOpen(true);
    }
  }, [actionParam]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (actionParam) {
      window.history.replaceState(null, '', '/categories');
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
      setSuccessMsg('Kategori master telah berhasil dihapus.');
      router.refresh();
    }
  };

  const handleSuccess = (msg?: string) => {
    setSuccessMsg(msg || 'Data berhasil disimpan!');
    handleCloseModal();
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kategori</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Kelola klasifikasi jenis barang (Device vs Consumable) dan inisial kode SKU
          </p>
        </div>

        <button
          onClick={() => {
            setEditCategory(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-[#b90051] hover:bg-[#a00045] text-white font-semibold rounded-xl text-sm shadow-md shadow-[#b90051]/20 transition flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori Baru</span>
        </button>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {initialCategories.map((category) => {
          return (
            <div
              key={category.id}
              className="bg-[#fce7ee] border border-[#f5b8cc] rounded-2xl p-5 space-y-4 shadow-sm hover:shadow transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#f5b8cc]/60 text-[#b90051] flex items-center justify-center shrink-0">
                    <Tags className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{category.name}</h3>
                    <span className="font-mono text-xs text-[#b90051] font-bold block mt-0.5">
                      Stock Keeping Unit : [{category.codePrefix}]
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      setEditCategory(category);
                      setIsModalOpen(true);
                    }}
                    title="Edit Kategori"
                    className="p-1.5 text-[#b90051] hover:text-[#8a003b] hover:bg-[#f5b8cc]/40 rounded-lg transition"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ id: category.id, name: category.name })}
                    title="Hapus Kategori"
                    className="p-1.5 text-[#b90051] hover:text-[#8a003b] hover:bg-[#f5b8cc]/40 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#f0a8bf]/70 text-xs">
                <span className="font-bold px-3 py-0.5 rounded-full bg-[#f0a8bf] text-[#8a003b] text-[11px] tracking-wide uppercase">
                  {category.type}
                </span>

                <span className="text-gray-600 text-xs">
                  Total <strong className="text-gray-900 font-bold">{category._count.items}</strong> Item SKU
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editCategory={editCategory}
        onSuccess={handleSuccess}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Kategori Master"
        itemName={deleteTarget?.name || ''}
        itemType="kategori"
        onConfirm={handleConfirmDelete}
      />

      <SuccessModal
        isOpen={!!successMsg}
        onClose={() => setSuccessMsg('')}
        message={successMsg}
      />
    </div>
  );
}
