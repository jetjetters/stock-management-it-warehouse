'use client';

import { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

type DeleteConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  itemName: string;
  itemType?: string; // e.g. "Item Inventaris", "Kategori", "Merk", "Lokasi"
  onConfirm: () => Promise<void> | void;
};

export function DeleteConfirmModal({
  isOpen,
  onClose,
  title = 'Konfirmasi Penghapusan',
  itemName,
  itemType = 'data',
  onConfirm,
}: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">{title}</h2>
              <p className="text-xs text-slate-400">Peringatan Tindakan Permanen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <p className="text-xs text-slate-400">
              Apakah Anda yakin ingin menghapus {itemType} berikut secara permanen?
            </p>
            <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-lg flex items-center space-x-2 text-rose-300 font-semibold text-sm">
              <Trash2 className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="truncate">"{itemName}"</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
             Data yang telah dihapus <strong className="text-slate-200">tidak dapat dikembalikan</strong> dan akan hilang dari seluruh daftar serta laporan sistem.
          </p>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 font-medium transition disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-lg text-sm shadow-lg shadow-rose-600/20 transition flex items-center space-x-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{loading ? 'Menghapus...' : 'Ya, Hapus Permanen'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
