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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                {editCategory ? 'Edit Master Kategori' : 'Tambah Master Kategori Baru'}
              </h2>
              <p className="text-xs text-slate-400">Atur penjenisan aset dan prefix SKU</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Nama Kategori <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Mouse, Printer, Tinta Printer"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Klasifikasi Tipe Inventaris <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('DEVICE')}
                className={`p-3 rounded-lg border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 ${
                  type === 'DEVICE'
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span>DEVICE (Aset Perangkat)</span>
                <span className="text-[10px] font-normal text-slate-400">Mouse, Keyboard, Laptop</span>
              </button>

              <button
                type="button"
                onClick={() => setType('BARANG')}
                className={`p-3 rounded-lg border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 ${
                  type === 'BARANG'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span>BARANG (Consumables)</span>
                <span className="text-[10px] font-normal text-slate-400">Tinta, Kabel, Kertas</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Inisial Prefix Kode Barang (SKU) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={codePrefix}
              onChange={(e) => setCodePrefix(e.target.value.toUpperCase())}
              placeholder="Contoh: MOS, PRN, TNT"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm font-mono font-bold tracking-wider text-blue-400 uppercase placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Prefix ini akan digunakan untuk generasi otomatis SKU (contoh: MOS0001, MOS0002).
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan Kategori'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
