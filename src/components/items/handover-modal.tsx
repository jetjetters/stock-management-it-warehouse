'use client';

import { useState, useEffect } from 'react';
import { X, Send, Printer, UserCheck, MapPin, FileText } from 'lucide-react';
import { createHandover } from '@/app/actions/handovers';
import { getOfficers } from '@/app/actions/officers';
import { useRouter } from 'next/navigation';

type HandoverItemTarget = {
  id: string;
  serialNumber: string;
  itemCode: string;
  name: string;
  categoryName: string;
  brandName: string;
  locationName: string;
};

type HandoverModalProps = {
  isOpen: boolean;
  onClose: () => void;
  targetItem: HandoverItemTarget | null;
  officersList?: Array<{ id: string; name: string }>;
  onSuccess: (msg?: string) => void;
};

export function HandoverModal({
  isOpen,
  onClose,
  targetItem,
  officersList = [],
  onSuccess,
}: HandoverModalProps) {
  const router = useRouter();

  const [giverName, setGiverName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [locationName, setLocationName] = useState('PTK Shore Base Tanjung Batu');
  const [officers, setOfficers] = useState<Array<{ id: string; name: string }>>(officersList);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (officersList && officersList.length > 0) {
      setOfficers(officersList);
      setGiverName(officersList[0].name);
    } else {
      getOfficers().then((data) => {
        setOfficers(data);
        if (data.length > 0) {
          setGiverName((prev) => prev || data[0].name);
        }
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setRecipientName('');
      setRemarks('Untuk Pos 7');
    }
  }, [isOpen]);

  if (!isOpen || !targetItem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const handover = await createHandover({
        giverName,
        recipientName,
        remarks,
        locationName,
        items: [
          {
            itemId: targetItem.id,
            deviceName: targetItem.name,
            serialNo: targetItem.serialNumber,
            brandName: targetItem.brandName,
            recipient: recipientName,
            remarks: remarks,
          },
        ],
      });

      onSuccess(`Dokumen Serah Terima (${handover.documentNo}) berhasil dibuat.`);
      onClose();
      // Navigate to printable PDF view page
      router.push(`/handovers/${handover.id}/print`);
    } catch (err: any) {
      setError(err.message || 'Gagal memproses dokumen serah terima.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>Form Serah Terima Barang IT</span>
              </h2>
              <p className="text-xs text-slate-400">Penerbitan surat serah terima fisik & cetak PDF</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {/* Target Item Summary Badge */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800 font-bold">
                SN: {targetItem.serialNumber}
              </span>
              <span className="text-xs text-slate-400">SKU: {targetItem.itemCode}</span>
            </div>
            <div className="text-sm font-semibold text-slate-100">{targetItem.name}</div>
            <div className="text-xs text-slate-400 flex items-center space-x-4">
              <span>Merk: <strong className="text-slate-200">{targetItem.brandName}</strong></span>
              <span>Lokasi: <strong className="text-slate-200">{targetItem.locationName}</strong></span>
            </div>
          </div>

          {/* Giver Name (Diberikan Oleh) Dropdown */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Diberikan Oleh (Officer) <span className="text-rose-400">*</span></span>
            </label>
            <select
              required
              value={giverName}
              onChange={(e) => setGiverName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition"
            >
              {officers.length === 0 ? (
                <>
                  <option value="Robby Nainggolan">Robby Nainggolan</option>
                  <option value="Muhammad Zosel Ridho Putra">Muhammad Zosel Ridho Putra</option>
                </>
              ) : (
                officers.map((off) => (
                  <option key={off.id} value={off.name}>
                    {off.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Recipient Name (PIC Penerima) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Penerima (PIC) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Nama Lengkap Penerima (contoh: Donatus)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Remarks (Catatan / Peruntukan) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Catatan / Peruntukan (Remarks)
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Contoh: Untuk Pos 7 / Penugasan Staff"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Location Header */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>Lokasi Dokumen / Base</span>
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="PTK Shore Base Tanjung Batu"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-medium hover:bg-slate-700 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/30 transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>{loading ? 'Memproses...' : 'Proses & Cetak PDF'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
