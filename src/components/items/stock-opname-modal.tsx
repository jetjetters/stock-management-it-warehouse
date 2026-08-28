'use client';

import { useState, useEffect } from 'react';
import { X, ClipboardCheck, Tag } from 'lucide-react';
import { updateItemStatus } from '@/app/actions/items';

type LocationItem = {
  id: string;
  name: string;
};

type StockOpnameModalProps = {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    serialNumber: string;
    itemCode: string;
    name: string;
    status: string;
    locationId: string;
    location: { name: string };
  } | null;
  locations: LocationItem[];
  onSuccess: (msg?: string) => void;
};

export function StockOpnameModal({
  isOpen,
  onClose,
  item,
  onSuccess,
}: StockOpnameModalProps) {
  const [status, setStatus] = useState('TERSEDIA');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setStatus(item.status || 'TERSEDIA');
      setNotes('');
      setError('');
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateItemStatus({
        itemId: item.id,
        status,
        notes,
      });
      onSuccess(`Status unit SN (${item.serialNumber}) berhasil diperbarui menjadi ${status}.`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah status unit SN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border-2 border-[#b90051] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Audit Status SN Unit</h2>
              <p className="text-xs text-gray-500">Verifikasi & Penyesuaian Status Fisik Barang</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {/* Item details banner */}
          <div className="p-3.5 bg-[#fff8fa] border border-[#f5b8cc] rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[#b90051] font-bold">SKU: {item.itemCode}</span>
              <span className="font-mono text-[#b90051] font-bold bg-[#fae2ea] px-2 py-0.5 rounded border border-[#f5b8cc]">
                SN: {item.serialNumber}
              </span>
            </div>
            <div className="text-sm font-bold text-gray-900">{item.name}</div>
            <div className="text-xs text-gray-500 pt-1 border-t border-[#f5b8cc]/50 flex justify-between">
              <span>Lokasi Storage:</span>
              <span className="font-semibold text-[#b90051]">{item.location.name}</span>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center space-x-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              <span>Status Fisik Hasil Opname <span className="text-rose-500">*</span></span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#b90051] font-semibold"
            >
              <option value="TERSEDIA">TERSEDIA (Available in Stock)</option>
              <option value="TERPAKAI">TERPAKAI (In Use by Staff)</option>
              <option value="DIPINJAM">DIPINJAM (On Loan)</option>
              <option value="RUSAK">RUSAK (Damaged / Broken)</option>
              <option value="KELUAR">KELUAR (Disposed / Used Up)</option>
            </select>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Catatan Hasil Audit Opname <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Unit diperiksa dalam fisik baik / Kabel terputus perlu diganti"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#b90051] focus:ring-1 focus:ring-[#b90051]"
            />
          </div>

          {/* Buttons */}
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
              className="px-5 py-2 bg-[#b90051] hover:bg-[#a00045] text-white font-bold rounded-xl text-sm shadow-md shadow-[#b90051]/20 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Memproses Status...' : 'Simpan Audit Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

