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
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await onConfirm();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{title}</h2>
              <p className="text-xs text-gray-500">Peringatan Tindakan Permanen</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs leading-relaxed font-medium">
              {error}
            </div>
          )}

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <p className="text-xs text-gray-600">
              Apakah Anda yakin ingin menghapus {itemType} berikut secara permanen?
            </p>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-700 font-semibold text-sm">
              <Trash2 className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="truncate">"{itemName}"</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            Data yang telah dihapus <strong className="text-gray-900">tidak dapat dikembalikan</strong> dan akan hilang dari seluruh daftar serta laporan sistem.
          </p>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm hover:bg-gray-50 font-semibold transition disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-rose-600/20 transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
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
