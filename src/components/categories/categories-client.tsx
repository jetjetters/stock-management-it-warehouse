'use client';

import { useState } from 'react';
import { Plus, Tags, Pencil, Trash2 } from 'lucide-react';
import { deleteCategory } from '@/app/actions/master-data';
import { CategoryModal } from '@/components/categories/category-modal';
import { DeleteConfirmModal } from '@/components/ui/delete-confirm-modal';
import { SuccessModal } from '@/components/ui/success-modal';
import type { ItemCategoryType } from '@/app/actions/items';
import { useRouter } from 'next/navigation';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<CategoryType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

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
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Master Kategori</h1>
          <p className="text-xs text-slate-400">
            Kelola klasifikasi jenis barang (Device vs Consumable) dan inisial kode SKU
          </p>
        </div>

        <button
          onClick={() => {
            setEditCategory(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm shadow-lg shadow-blue-600/20 transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {initialCategories.map((category) => {
          const isDevice = category.type === 'DEVICE';

          return (
            <div
              key={category.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg">
                    <Tags className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-base">{category.name}</h3>
                    <span className="font-mono text-xs text-blue-400 font-bold">
                      Prefix SKU: [{category.codePrefix}]
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      setEditCategory(category);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ id: category.id, name: category.name })}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                <span
                  className={`font-semibold px-2.5 py-0.5 rounded-full border ${
                    isDevice
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                  }`}
                >
                  {category.type}
                </span>

                <span className="text-slate-400">
                  Total <strong className="text-slate-200">{category._count.items}</strong> Item SKU
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
