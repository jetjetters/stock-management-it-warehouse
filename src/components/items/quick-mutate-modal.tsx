'use client';

import { useState, useEffect } from 'react';
import { X, Repeat, MapPin } from 'lucide-react';
import { mutateItemLocation } from '@/app/actions/items';

type LocationItem = {
  id: string;
  name: string;
};

type QuickMutateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    serialNumber: string;
    itemCode: string;
    name: string;
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
  const [targetLocationId, setTargetLocationId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      // Pick first location different from current
      const otherLoc = locations.find((l) => l.id !== item.locationId);
      setTargetLocationId(otherLoc?.id || item.locationId);
      setNotes('');
      setError('');
    }
  }, [item, isOpen, locations]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await mutateItemLocation({
        itemId: item.id,
        targetLocationId,
        notes,
      });
      onSuccess(`Mutasi lokasi SN (${item.serialNumber}) berhasil diperbarui.`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah lokasi unit SN');
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
              <h2 className="text-lg font-bold text-slate-100">Mutasi Lokasi Storage</h2>
              <p className="text-xs text-slate-400">Pindahkan unit SN ke lokasi storage baru</p>
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
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-blue-400 font-bold">{item.itemCode}</span>
              <span className="font-mono text-xs text-slate-300 font-bold bg-slate-800 px-2 py-0.5 rounded">
                SN: {item.serialNumber}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-slate-200">{item.name}</h4>
            <div className="text-[11px] text-slate-400 flex items-center space-x-1 pt-1">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>Lokasi Saat Ini: <strong>{item.location.name}</strong></span>
            </div>
          </div>

          {/* Target Location */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Lokasi Storage Tujuan <span className="text-rose-400">*</span>
            </label>
            <select
              value={targetLocationId}
              onChange={(e) => setTargetLocationId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} {loc.id === item.locationId ? '(Lokasi Saat Ini)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Keterangan / Alasan Pindah Lokasi
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Dipindahkan untuk penugasan staff di Main Office"
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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-600/20 transition disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Proses Mutasi Lokasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

