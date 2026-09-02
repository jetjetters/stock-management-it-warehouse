'use client';

import { useState, useEffect } from 'react';
import { Plus, Layers, Pencil, Trash2 } from 'lucide-react';
import { deleteBrand } from '@/app/actions/master-data';
import { BrandModal } from '@/components/brands/brand-modal';
import { DeleteConfirmModal } from '@/components/ui/delete-confirm-modal';
import { SuccessModal } from '@/components/ui/success-modal';
import { useRouter, useSearchParams } from 'next/navigation';

type BrandType = {
  id: string;
  name: string;
  categoryId: string;
  category: { name: string };
  _count: { items: number };
};

type BrandsClientProps = {
  initialBrands: BrandType[];
  categories: any[];
};

export function BrandsClient({ initialBrands, categories }: BrandsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actionParam = searchParams.get('action');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editBrand, setEditBrand] = useState<BrandType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (actionParam === 'new') {
      setEditBrand(null);
      setIsModalOpen(true);
    }
  }, [actionParam]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (actionParam) {
      window.history.replaceState(null, '', '/brands');
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteBrand(deleteTarget.id);
      setDeleteTarget(null);
      setSuccessMsg('Merk / brand telah berhasil dihapus.');
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Merk / Brand</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Daftar produsen & merk terintegrasi dengan kategori barang
          </p>
        </div>

        <button
          onClick={() => {
            setEditBrand(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-[#b90051] hover:bg-[#a00045] text-white font-semibold rounded-xl text-sm shadow-md shadow-[#b90051]/20 transition flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Merk Baru</span>
        </button>
      </div>

      {/* Brands Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {initialBrands.map((brand) => (
          <div
            key={brand.id}
            className="bg-[#fce7ee] border border-[#f5b8cc] rounded-2xl p-5 space-y-3 shadow-sm hover:shadow transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-[#f5b8cc]/60 text-[#b90051] flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{brand.name}</h3>
                  <span className="text-xs text-[#b90051] font-semibold block">{brand.category.name}</span>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setEditBrand(brand);
                    setIsModalOpen(true);
                  }}
                  title="Edit Merk"
                  className="p-1.5 text-[#b90051] hover:text-[#8a003b] hover:bg-[#f5b8cc]/40 rounded-lg transition"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: brand.id, name: brand.name })}
                  title="Hapus Merk"
                  className="p-1.5 text-[#b90051] hover:text-[#8a003b] hover:bg-[#f5b8cc]/40 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="pt-2.5 border-t border-[#f0a8bf]/70 text-[11px] text-gray-600 flex justify-between items-center">
              <span>Digunakan oleh:</span>
              <strong className="text-gray-900 font-mono font-bold">{brand._count.items} Barang</strong>
            </div>
          </div>
        ))}
      </div>

      <BrandModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        categories={categories}
        editBrand={editBrand}
        onSuccess={handleSuccess}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Merk / Brand"
        itemName={deleteTarget?.name || ''}
        itemType="merk/brand"
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
