'use client';

import { useState, useEffect } from 'react';
import { X, ClipboardCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { stockOpnameAdjustment } from '@/app/actions/items';

type LocationItem = {
  id: string;
  name: string;
};

type StockOpnameModalProps = {
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

export function StockOpnameModal({
  isOpen,
  onClose,
  item,
  locations,
  onSuccess,
}: StockOpnameModalProps) {
  const [physicalStock, setPhysicalStock] = useState<number>(0);
  const [locationId, setLocationId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setPhysicalStock(item.currentStock);
      setLocationId(item.locationId);
      setNotes('');
      setError('');
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const currentStock = item.currentStock;
  const diff = physicalStock - currentStock;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (diff === 0) {
      setError('Stok fisik yang Anda masukkan sama dengan stok di sistem.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await stockOpnameAdjustment({
        itemId: item.id,
        physicalStock,
        notes,
        locationId,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal melakukan verifikasi opname');
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
              <h2 className="text-lg font-bold text-slate-100">Stock Opname Adjustment</h2>
              <p className="text-xs text-slate-400">Verifikasi & Penyesuaian Fisik Stok</p>
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
              <span className="text-slate-400">Lokasi: {item.location.name}</span>
            </div>
            <div className="text-sm font-semibold text-slate-200">{item.name}</div>
            <div className="text-xs text-slate-400 pt-1 border-t border-slate-800/80 flex justify-between">
              <span>Stok Tercatat Sistem:</span>
              <span className="font-mono font-bold text-slate-200">{currentStock} unit</span>
            </div>
          </div>

          {/* Input physical stock */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Jumlah Stok Fisik Sebenarnya (Hasil Hitung Opname) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              min="0"
              required
              value={physicalStock}
              onChange={(e) => setPhysicalStock(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-base font-bold font-mono text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Diff Calculator Indicator */}
          {diff !== 0 && (
            <div
              className={`p-3.5 rounded-lg border flex items-center justify-between text-xs font-medium ${
                diff > 0
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              <div className="flex items-center space-x-2">
                {diff > 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span>
                  Otomatisasi Log Audit Trail: Kategori{' '}
                  <strong>{diff > 0 ? 'TAMBAH (IN)' : 'KURANG (OUT)'}</strong>
                </span>
              </div>
              <span className="font-mono font-bold text-sm">
                {diff > 0 ? `+${diff}` : diff} Unit
              </span>
            </div>
          )}

          {/* Location Select */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Lokasi Opname Dilakukan
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Keterangan / Alasan Selisih Opname <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Ditemukan 2 unit cadangan di rak belakang / Barang rusak terbakar"
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
              disabled={loading || diff === 0}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-sm shadow-lg shadow-amber-600/20 transition disabled:opacity-50"
            >
              {loading ? 'Memproses Opname...' : 'Simpan Audit Opname'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
