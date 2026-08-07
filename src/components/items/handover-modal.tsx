'use client';

import { useState, useEffect } from 'react';
import { X, Send, Plus, Trash2, UserCheck, FileText, Package } from 'lucide-react';
import { createHandover } from '@/app/actions/handovers';
import { getOfficers } from '@/app/actions/officers';
import { useRouter } from 'next/navigation';

type AvailableItemUnit = {
  id: string;
  serialNumber: string;
  itemCode: string;
  name: string;
  status: string;
  category: { name: string };
  brand: { name: string };
  location: { name: string };
};

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
  targetItem?: HandoverItemTarget | null;
  allItems: AvailableItemUnit[];
  officersList?: Array<{ id: string; name: string }>;
  onSuccess: (msg?: string) => void;
};

export function HandoverModal({
  isOpen,
  onClose,
  targetItem = null,
  allItems = [],
  officersList = [],
  onSuccess,
}: HandoverModalProps) {
  const router = useRouter();

  const [giverName, setGiverName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [locationName, setLocationName] = useState('PTK Shore Base Tanjung Batu');
  const [officers, setOfficers] = useState<Array<{ id: string; name: string }>>(officersList);

  // List of items selected in this handover document
  const [selectedItems, setSelectedItems] = useState<
    Array<{
      itemId: string;
      deviceName: string;
      serialNo: string;
      brandName: string;
    }>
  >([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter available items with status TERSEDIA
  const availableItems = allItems.filter((item) => item.status === 'TERSEDIA');

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

      if (targetItem) {
        setSelectedItems([
          {
            itemId: targetItem.id,
            deviceName: targetItem.name,
            serialNo: targetItem.serialNumber,
            brandName: targetItem.brandName,
          },
        ]);
      } else {
        setSelectedItems([
          {
            itemId: '',
            deviceName: '',
            serialNo: '',
            brandName: '',
          },
        ]);
      }
    }
  }, [isOpen, targetItem]);

  if (!isOpen) return null;

  const handleSelectItemChange = (index: number, selectedId: string) => {
    if (!selectedId) {
      setSelectedItems((prev) => {
        const copy = [...prev];
        copy[index] = { itemId: '', deviceName: '', serialNo: '', brandName: '' };
        return copy;
      });
      return;
    }

    const found = availableItems.find((i) => i.id === selectedId);
    if (!found) return;

    setSelectedItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        itemId: found.id,
        deviceName: found.name,
        serialNo: found.serialNumber,
        brandName: found.brand.name,
      };
      return copy;
    });
  };

  const handleAddAnotherItemRow = () => {
    setSelectedItems((prev) => [
      ...prev,
      {
        itemId: '',
        deviceName: '',
        serialNo: '',
        brandName: '',
      },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (selectedItems.length <= 1) return;
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (selectedItems.length === 0 || selectedItems.some((i) => !i.itemId)) {
      setError('Pilih setidaknya 1 unit barang yang tersedia untuk diserahkan.');
      setLoading(false);
      return;
    }

    try {
      const handover = await createHandover({
        giverName,
        recipientName,
        remarks,
        locationName,
        items: selectedItems.map((i) => ({
          itemId: i.itemId,
          deviceName: i.deviceName,
          serialNo: i.serialNo,
          brandName: i.brandName,
          recipient: recipientName,
          remarks: remarks,
        })),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg">Form Serah Terima Barang IT</h3>
              <p className="text-xs text-slate-400">
                Penerbitan surat serah terima fisik & cetak PDF resmi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Selection of Available Items & Serial Numbers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                <Package className="w-4 h-4 text-blue-400" />
                <span>Daftar Barang & SN Unit yang Diserahkan *</span>
              </label>
              <button
                type="button"
                onClick={handleAddAnotherItemRow}
                disabled={availableItems.length <= selectedItems.length}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Barang Lain</span>
              </button>
            </div>

            {availableItems.length === 0 ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs">
                Tidak ada unit Serial Number (SN) berstatus <strong>TERSEDIA</strong> untuk diserahkan saat ini.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {selectedItems.map((selItem, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2 bg-slate-950 p-3 rounded-xl border border-slate-800"
                  >
                    <span className="text-xs font-bold text-slate-500 font-mono w-6 text-center">
                      #{idx + 1}
                    </span>
                    <select
                      value={selItem.itemId}
                      onChange={(e) => handleSelectItemChange(idx, e.target.value)}
                      required
                      className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="" className="text-slate-500">
                        -- Pilih Barang & SN Unit (Tersedia) --
                      </option>
                      {availableItems.map((item) => (
                        <option
                          key={item.id}
                          value={item.id}
                          disabled={
                            selectedItems.some((s, sIdx) => sIdx !== idx && s.itemId === item.id)
                          }
                        >
                          {item.name} — SN: {item.serialNumber} ({item.brand.name})
                        </option>
                      ))}
                    </select>

                    {selectedItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        title="Hapus Baris Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Diberikan Oleh (Officer) Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Diberikan Oleh (Officer) *</span>
            </label>
            <select
              value={giverName}
              onChange={(e) => setGiverName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition font-medium"
            >
              {officers.map((off) => (
                <option key={off.id} value={off.name}>
                  {off.name}
                </option>
              ))}
            </select>
          </div>

          {/* Penerima (PIC) Text Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Penerima (PIC) *
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Nama Lengkap Penerima (contoh: Donatus)"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Catatan / Peruntukan (Remarks) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Catatan / Peruntukan (Remarks)
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Contoh: Untuk Pos 7"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Lokasi Dokumen / Base */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Lokasi Dokumen / Base
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || availableItems.length === 0}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/30 transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Memproses...' : 'Proses & Cetak PDF'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
