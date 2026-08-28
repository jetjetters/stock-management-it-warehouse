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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#fae2ea] text-[#b90051] rounded-xl border border-[#f5b8cc]">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Mutasi Lokasi Storage</h2>
              <p className="text-xs text-gray-500">Pindahkan unit SN ke lokasi storage baru</p>
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

          {/* Item Info Summary */}
          <div className="p-3.5 bg-[#fff8fa] border border-[#f5b8cc] rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#b90051] font-bold">SKU: {item.itemCode}</span>
              <span className="font-mono text-xs text-[#b90051] font-bold bg-[#fae2ea] px-2 py-0.5 rounded border border-[#f5b8cc]">
                SN: {item.serialNumber}
              </span>
            </div>
            <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
            <div className="text-[11px] text-gray-500 flex items-center space-x-1 pt-1">
              <MapPin className="w-3.5 h-3.5 text-[#b90051]" />
              <span>Lokasi Saat Ini: <strong className="text-gray-800">{item.location.name}</strong></span>
            </div>
          </div>

          {/* Target Location */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Lokasi Storage Tujuan <span className="text-rose-500">*</span>
            </label>
            <select
              value={targetLocationId}
              onChange={(e) => setTargetLocationId(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#b90051]"
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
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Keterangan / Alasan Pindah Lokasi
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Dipindahkan untuk penugasan staff di Main Office"
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
              className="px-5 py-2 bg-[#b90051] hover:bg-[#a00045] text-white rounded-xl text-sm font-semibold shadow-md shadow-[#b90051]/20 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Menyimpan...' : 'Proses Mutasi Lokasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

