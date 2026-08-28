'use client';

import { useState, useEffect } from 'react';
import { X, Tags } from 'lucide-react';
import { createCategory, updateCategory } from '@/app/actions/master-data';

export type ItemCategoryType = 'DEVICE' | 'BARANG';

type CategoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  editCategory?: {
    id: string;
    name: string;
    type: ItemCategoryType;
    codePrefix: string;
  } | null;
  onSuccess: (msg?: string) => void;
};

export function CategoryModal({
  isOpen,
  onClose,
  editCategory,
  onSuccess,
}: CategoryModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<ItemCategoryType>('DEVICE');
  const [codePrefix, setCodePrefix] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editCategory) {
      setName(editCategory.name);
      setType(editCategory.type);
      setCodePrefix(editCategory.codePrefix);
      setError('');
    } else {
      setName('');
      setType('DEVICE');
      setCodePrefix('');
      setError('');
    }
  }, [editCategory, isOpen]);

  if (!isOpen) return null;

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
        onSuccess('Data kategori master berhasil diperbarui.');
      } else {
        await createCategory({ name, type, codePrefix });
        onSuccess('Kategori master baru berhasil ditambahkan.');
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan kategori');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#fae2ea] text-[#b90051] rounded-xl border border-[#f5b8cc]">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {editCategory ? 'Edit Master Kategori' : 'Tambah Master Kategori Baru'}
              </h2>
              <p className="text-xs text-gray-500">Atur penjenisan aset dan prefix SKU</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Nama Kategori <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Mouse, Printer, Tinta Printer"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#b90051] focus:ring-1 focus:ring-[#b90051]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Klasifikasi Tipe Inventaris <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('DEVICE')}
                className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                  type === 'DEVICE'
                    ? 'bg-[#fae2ea] border-[#f5b8cc] text-[#b90051]'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>DEVICE (Aset Perangkat)</span>
                <span className="text-[10px] font-normal text-gray-500">Mouse, Keyboard, Laptop</span>
              </button>

              <button
                type="button"
                onClick={() => setType('BARANG')}
                className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                  type === 'BARANG'
                    ? 'bg-[#fae2ea] border-[#f5b8cc] text-[#b90051]'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>BARANG (Consumables)</span>
                <span className="text-[10px] font-normal text-gray-500">Tinta, Kabel, Kertas</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Inisial Prefix Kode Barang (SKU) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={codePrefix}
              onChange={(e) => setCodePrefix(e.target.value.toUpperCase())}
              placeholder="Contoh: MOS, PRN, TNT"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-mono font-bold tracking-wider text-blue-600 uppercase placeholder-gray-400 focus:outline-none focus:border-[#b90051] focus:ring-1 focus:ring-[#b90051]"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Prefix ini akan digunakan untuk generasi otomatis SKU (contoh: MOS0001, MOS0002).
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm hover:bg-gray-50 font-semibold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#b90051] hover:bg-[#a00045] text-white rounded-xl text-sm font-semibold shadow-md shadow-[#b90051]/20 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Menyimpan...' : 'Simpan Kategori'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
