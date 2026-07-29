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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Audit Status SN Unit</h2>
              <p className="text-xs text-slate-400">Verifikasi & Penyesuaian Status Fisik Barang</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Item details banner */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-blue-400 font-bold">{item.itemCode}</span>
              <span className="font-mono text-slate-300 font-bold bg-slate-800 px-2 py-0.5 rounded">
                SN: {item.serialNumber}
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-200">{item.name}</div>
            <div className="text-xs text-slate-400 pt-1 border-t border-slate-800/80 flex justify-between">
              <span>Lokasi Storage:</span>
              <span className="font-bold text-slate-200">{item.location.name}</span>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>Status Fisik Hasil Opname <span className="text-rose-400">*</span></span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
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
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Catatan Hasil Audit Opname <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Unit diperiksa dalam fisik baik / Kabel terputus perlu diganti"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Buttons */}
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
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-sm shadow-lg shadow-amber-600/20 transition disabled:opacity-50"
            >
              {loading ? 'Memproses Status...' : 'Simpan Audit Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

