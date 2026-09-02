'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Tags, Sparkles, AlertCircle } from 'lucide-react';
import { createCategory, updateCategory } from '@/app/actions/master-data';
import type { ItemCategoryType } from '@/app/actions/items';

type CategoryFormProps = {
  editCategory?: {
    id: string;
    name: string;
    type: ItemCategoryType;
    codePrefix: string;
  } | null;
};

export function CategoryForm({ editCategory }: CategoryFormProps) {
  const router = useRouter();

  const [name, setName] = useState(editCategory?.name || '');
  const [type, setType] = useState<ItemCategoryType>(editCategory?.type || 'DEVICE');
  const [codePrefix, setCodePrefix] = useState(editCategory?.codePrefix || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !codePrefix.trim()) {
      setError('Nama dan Prefix Kode wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (editCategory) {
        await updateCategory(editCategory.id, { name, type, codePrefix });
      } else {
        await createCategory({ name, type, codePrefix });
      }
      router.push('/categories');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan kategori');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header & Back Button */}
      <div className="flex items-center space-x-4">
        <Link
          href="/categories"
          className="p-2.5 bg-white border border-gray-200 hover:border-[#b90051] hover:text-[#b90051] rounded-xl transition text-gray-600 shadow-2xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <span>{editCategory ? 'Edit Master Kategori' : 'Tambah Kategori Baru'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {editCategory
              ? `Mengubah klasifikasi kategori master: ${editCategory.name}`
              : 'Daftarkan jenis kategori barang baru beserta inisial kode SKU'}
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#fae2ea] text-[#b90051] border border-[#f5b8cc] flex items-center justify-center shrink-0">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Formulir Master Kategori</h2>
              <p className="text-xs text-gray-500">Lengkapi parameter kategori inventaris di bawah ini</p>
            </div>
          </div>
          <span className="text-xs bg-[#fae2ea] text-[#b90051] font-bold px-3 py-1 rounded-full border border-[#f5b8cc]">
            {type === 'DEVICE' ? 'Perangkat (Device)' : 'Bahan (Consumable)'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Nama Kategori */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Nama Kategori <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Mouse, Keyboard, Laptop, Printer, Tinta Printer"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#b90051] focus:ring-1 focus:ring-[#b90051] transition"
            />
          </div>

          {/* Klasifikasi Tipe */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Klasifikasi Tipe Inventaris <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType('DEVICE')}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer space-y-2 ${
                  type === 'DEVICE'
                    ? 'border-[#b90051] bg-[#fff8fa] shadow-xs ring-2 ring-[#b90051]/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-gray-900">DEVICE (Aset Perangkat)</span>
                  <div className={`w-2.5 h-2.5 rounded-full ${type === 'DEVICE' ? 'bg-[#b90051]' : 'bg-gray-300'}`} />
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Barang berwujud fisik yang memiliki unit Serial Number (SN) individual dan status kepemilikan (Milik IT / Sewa).
                </p>
              </button>

              <button
                type="button"
                onClick={() => setType('BARANG')}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer space-y-2 ${
                  type === 'BARANG'
                    ? 'border-[#b90051] bg-[#fff8fa] shadow-xs ring-2 ring-[#b90051]/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-gray-900">BARANG (Consumables / Habis Pakai)</span>
                  <div className={`w-2.5 h-2.5 rounded-full ${type === 'BARANG' ? 'bg-[#b90051]' : 'bg-gray-300'}`} />
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Bahan operasional pendukung, aksesoris, atau bahan habis pakai seperti tinta, kabel, dan kertas.
                </p>
              </button>
            </div>
          </div>

          {/* Inisial Prefix Kode Barang (SKU) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Inisial Prefix Kode Barang (SKU) <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                required
                maxLength={6}
                value={codePrefix}
                onChange={(e) => setCodePrefix(e.target.value.toUpperCase())}
                placeholder="Contoh: MOS, KEB, PRN, TNT"
                className="w-48 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold tracking-wider text-[#b90051] uppercase placeholder-gray-400 focus:outline-none focus:border-[#b90051] focus:ring-1 focus:ring-[#b90051] transition"
              />
              {codePrefix && (
                <div className="flex items-center space-x-2 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                  <Sparkles className="w-3.5 h-3.5 text-[#b90051]" />
                  <span>Preview SKU: <strong className="font-mono text-gray-900">{codePrefix}0001</strong></span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              Prefix ini digunakan sebagai kode awalan pada saat penomoran SKU otomatis inventaris.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-end space-x-3">
            <Link
              href="/categories"
              className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#b90051] hover:bg-[#a00045] text-white rounded-xl text-xs font-bold shadow-md shadow-[#b90051]/20 transition disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
            >
              <span>{loading ? 'Menyimpan...' : editCategory ? 'Perbarui Kategori' : 'Simpan Kategori Baru'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
