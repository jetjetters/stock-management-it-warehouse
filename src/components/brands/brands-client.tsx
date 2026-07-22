'use client';

import { useState } from 'react';
import { Plus, Layers, Pencil, Trash2 } from 'lucide-react';
import { deleteBrand } from '@/app/actions/master-data';
import { BrandModal } from '@/components/brands/brand-modal';
import { useRouter } from 'next/navigation';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editBrand, setEditBrand] = useState<BrandType | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus merk "${name}"?`)) {
      await deleteBrand(id);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Master Merk / Brand</h1>
          <p className="text-xs text-slate-400">
            Daftar produsen & merk terintegrasi dengan kategori barang
          </p>
        </div>

        <button
          onClick={() => {
            setEditBrand(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm shadow-lg shadow-blue-600/20 transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Merk Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {initialBrands.map((brand) => (
          <div
            key={brand.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-slate-700 transition shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{brand.name}</h3>
                  <span className="text-xs text-slate-400">{brand.category.name}</span>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setEditBrand(brand);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(brand.id, brand.name)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
              <span>Digunakan oleh:</span>
              <strong className="text-slate-300 font-mono">{brand._count.items} Barang</strong>
            </div>
          </div>
        ))}
      </div>

      <BrandModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        editBrand={editBrand}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
