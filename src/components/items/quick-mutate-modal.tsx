'use client';

import { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Repeat } from 'lucide-react';
import { mutateStock } from '@/app/actions/items';
import { MutationType } from '@prisma/client';

type LocationItem = {
  id: string;
  name: string;
};

type QuickMutateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    itemCode: string;
    name: string;
    currentStock: number;
    locationId: string;
    location: { name: string };
  } | null;
  locations: LocationItem[];
  onSuccess: () => void;
};

export function QuickMutateModal({
  isOpen,
  onClose,
  item,
  locations,
  onSuccess,
}: QuickMutateModalProps) {
  const [type, setType] = useState<MutationType>(MutationType.IN);
  const [quantity, setQuantity] = useState<number>(1);
  const [locationId, setLocationId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setType(MutationType.IN);
      setQuantity(1);
      setLocationId(item.locationId);
      setNotes('');
      setError('');
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setError('Jumlah mutasi harus lebih dari 0.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await mutateStock({
        itemId: item.id,
        mutation: quantity,
        type,
        notes,
        locationId,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah stok');
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
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Mutasi Stok Instant</h2>
              <p className="text-xs text-slate-400">Pencatatan Masuk & Keluar Inventaris</p>
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

          {/* Item Banner */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-blue-400 font-bold">{item.itemCode}</span>
              <span className="text-slate-400">Stok Saat Ini: <strong className="text-slate-100">{item.currentStock}</strong></span>
            </div>
            <div className="text-sm font-semibold text-slate-200 mt-0.5">{item.name}</div>
          </div>

          {/* Type Toggle: IN vs OUT */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType(MutationType.IN)}
              className={`p-3 rounded-lg border flex items-center justify-center space-x-2 text-xs font-bold transition ${
                type === MutationType.IN
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>STOK MASUK (IN)</span>
            </button>

            <button
              type="button"
              onClick={() => setType(MutationType.OUT)}
              className={`p-3 rounded-lg border flex items-center justify-center space-x-2 text-xs font-bold transition ${
                type === MutationType.OUT
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-md shadow-rose-500/10'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>STOK KELUAR (OUT)</span>
            </button>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Jumlah Kuantitas <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-base font-bold font-mono text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Location Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Tujuan / Lokasi Terkait
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Keterangan / Tujuan Mutasi <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                type === MutationType.IN
                  ? 'Contoh: Pembelian PO-2026/04 atau Donasi'
                  : 'Contoh: Dipinjam Chelsy di Main Office'
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
              className={`px-5 py-2 text-white font-medium rounded-lg text-sm shadow-lg transition disabled:opacity-50 ${
                type === MutationType.IN
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
              }`}
            >
              {loading ? 'Menyimpan...' : type === MutationType.IN ? 'Tambah Stok (+)' : 'Kurangi Stok (-)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
