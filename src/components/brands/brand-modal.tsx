'use client';

import { useState, useEffect } from 'react';
import { X, Layers } from 'lucide-react';
import { createBrand, updateBrand } from '@/app/actions/master-data';

type CategoryItem = {
  id: string;
  name: string;
};

type BrandModalProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  editBrand?: {
    id: string;
    name: string;
    categoryId: string;
  } | null;
  onSuccess: (msg?: string) => void;
};

export function BrandModal({
  isOpen,
  onClose,
  categories,
  editBrand,
  onSuccess,
}: BrandModalProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editBrand) {
      setName(editBrand.name);
      setCategoryId(editBrand.categoryId);
      setError('');
    } else {
      setName('');
      setCategoryId(categories[0]?.id || '');
      setError('');
    }
  }, [editBrand, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) {
      setError('Nama Merk dan Kategori wajib dipilih.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (editBrand) {
        await updateBrand(editBrand.id, { name, categoryId });
        onSuccess('Data merk/brand berhasil diperbarui.');
      } else {
        await createBrand({ name, categoryId });
        onSuccess('Merk/brand baru berhasil ditambahkan.');
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan brand');
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
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {editBrand ? 'Edit Master Merk' : 'Tambah Master Merk Baru'}
              </h2>
              <p className="text-xs text-gray-500">Atur merk / produsen barang IT</p>
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
              Nama Merk / Brand <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Logitech, Epson, Dell, Belden"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#b90051] focus:ring-1 focus:ring-[#b90051]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Kategori Terkait <span className="text-rose-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#b90051]"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
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
              {loading ? 'Menyimpan...' : 'Simpan Merk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
