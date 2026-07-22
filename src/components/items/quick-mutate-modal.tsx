'use client';

import { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Repeat } from 'lucide-react';
import { mutateStock, type MutationType } from '@/app/actions/items';

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
  onSuccess: (msg?: string) => void;
};

export function QuickMutateModal({
  isOpen,
  onClose,
  item,
  locations,
  onSuccess,
}: QuickMutateModalProps) {
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState<number>(1);
  const [locationId, setLocationId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setType('IN');
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
        type: type as MutationType,
        notes,
        locationId,
      });
      onSuccess(`Mutasi stok (${type === 'IN' ? '+' : '-'}${quantity}) berhasil dicatat.`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah stok');
    } finally {
      setLoading(false);
    }
  };

  const calculatedResult =
    type === 'IN'
      ? item.currentStock + quantity
      : item.currentStock - quantity;

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
              <p className="text-xs text-slate-400">Catat stok masuk / keluar secara cepat</p>
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

          {/* Item Info Summary */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-mono text-xs text-blue-400 font-bold">{item.itemCode}</span>
              <h4 className="text-sm font-semibold text-slate-200">{item.name}</h4>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Stok Saat Ini</span>
              <span className="font-mono text-sm font-bold text-slate-100">{item.currentStock} Unit</span>
            </div>
          </div>

          {/* Mutation Type Toggle */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Jenis Mutasi Stok <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('IN')}
                className={`p-3 rounded-lg border flex items-center justify-center space-x-2 text-xs font-bold transition ${
                  type === 'IN'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>STOK MASUK (IN)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('OUT')}
                className={`p-3 rounded-lg border flex items-center justify-center space-x-2 text-xs font-bold transition ${
                  type === 'OUT'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-md shadow-rose-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>STOK KELUAR (OUT)</span>
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Jumlah Unit <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              min={1}
              required
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Estimasi Stok Akhir:{' '}
              <strong className={calculatedResult < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                {calculatedResult} Unit
              </strong>
            </p>
          </div>

          {/* Location Target */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Lokasi Penyimpanan <span className="text-rose-400">*</span>
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
                type === 'IN'
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
                type === 'IN'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
              }`}
            >
              {loading ? 'Menyimpan...' : type === 'IN' ? 'Tambah Stok (+)' : 'Kurangi Stok (-)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
