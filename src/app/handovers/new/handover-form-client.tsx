'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Send,
  Plus,
  Trash2,
  UserCheck,
  Package,
  MapPin,
  FileText,
} from 'lucide-react';
import { createHandover } from '@/app/actions/handovers';

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

type OfficerItem = {
  id: string;
  name: string;
};

type HandoverFormClientProps = {
  officers: OfficerItem[];
  availableItems: AvailableItemUnit[];
  presetItemId?: string;
};

export function HandoverFormClient({
  officers = [],
  availableItems = [],
  presetItemId,
}: HandoverFormClientProps) {
  const router = useRouter();

  const [giverName, setGiverName] = useState(officers[0]?.name || '');
  const [recipientName, setRecipientName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [locationName, setLocationName] = useState('PTK Shore Base Tanjung Batu');

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

  useEffect(() => {
    if (presetItemId) {
      const found = availableItems.find((i) => i.id === presetItemId);
      if (found) {
        setSelectedItems([
          {
            itemId: found.id,
            deviceName: found.name,
            serialNo: found.serialNumber,
            brandName: found.brand.name,
          },
        ]);
        return;
      }
    }

    // Default: Start with 1 empty row so user explicitly chooses item from dropdown
    setSelectedItems([
      {
        itemId: '',
        deviceName: '',
        serialNo: '',
        brandName: '',
      },
    ]);
  }, [presetItemId, availableItems]);

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

      // Redirect to printable PDF view page
      router.push(`/handovers/${handover.id}/print`);
    } catch (err: any) {
      setError(err.message || 'Gagal memproses dokumen serah terima.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header & Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/handovers"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-3.5 py-2 rounded-xl transition mb-2 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-[#b90051]" />
            <span>Kembali ke Surat Serah Terima</span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center space-x-2.5">
            <Send className="w-6 h-6 text-[#b90051]" />
            <span>Form Serah Terima Barang IT</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Penerbitan surat serah terima fisik & cetak PDF resmi PTK Shore Base Tanjung Batu
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white border-2 border-[#b90051] rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Barang & SN Selection */}
          <div className="space-y-3 bg-[#fce7ee]/60 p-5 rounded-2xl border border-[#f5b8cc]">
            <div className="flex items-center justify-between border-b border-[#f5b8cc]/80 pb-3">
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-2">
                <Package className="w-4 h-4 text-[#b90051]" />
                <span>Daftar Barang & Serial Number (SN) Unit yang Diserahkan *</span>
              </label>
              <button
                type="button"
                onClick={handleAddAnotherItemRow}
                disabled={availableItems.length <= selectedItems.length}
                className="text-xs text-[#b90051] hover:text-[#8a003b] font-bold flex items-center space-x-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Barang / SN Lain</span>
              </button>
            </div>

            {availableItems.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium">
                Tidak ada unit Serial Number (SN) berstatus <strong>TERSEDIA</strong> untuk diserahkan saat ini. Silakan tambahkan unit baru atau ubah status melalui Audit.
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {selectedItems.map((selItem, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm"
                  >
                    <span className="text-xs font-bold text-gray-600 font-mono w-7 text-center bg-gray-100 py-1.5 rounded border border-gray-200">
                      #{idx + 1}
                    </span>

                    <select
                      value={selItem.itemId}
                      onChange={(e) => handleSelectItemChange(idx, e.target.value)}
                      required
                      className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#b90051] font-medium"
                    >
                      <option value="" className="text-gray-400">
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
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition border border-gray-200"
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

          {/* Section 2: Penyerah & Penerima Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Diberikan Oleh (Officer) Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-900 flex items-center space-x-1.5">
                <UserCheck className="w-4 h-4 text-[#b90051]" />
                <span>Diberikan Oleh (Officer) *</span>
              </label>
              <select
                value={giverName}
                onChange={(e) => setGiverName(e.target.value)}
                required
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#b90051] transition font-medium"
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
              <label className="block text-xs font-bold text-gray-900">
                Penerima (PIC) *
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Nama Lengkap Penerima (contoh: Donatus)"
                required
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#b90051] transition"
              />
            </div>
          </div>

          {/* Section 3: Catatan & Lokasi Base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Catatan / Peruntukan (Remarks) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">
                Catatan / Peruntukan (Remarks)
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Contoh: Untuk Pos 7"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#b90051] transition"
              />
            </div>

            {/* Lokasi Dokumen / Base */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">
                Lokasi Dokumen / Base
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#b90051] transition"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-end space-x-3">
            <Link
              href="/handovers"
              className="px-5 py-2.5 bg-white hover:bg-[#b90051] border border-gray-200 hover:border-[#a00045] text-gray-700 hover:text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading || availableItems.length === 0}
              className="px-7 py-3 bg-[#b90051] hover:bg-[#8f003e] text-white font-bold rounded-xl text-xs shadow-md shadow-[#b90051]/20 hover:shadow-lg hover:shadow-[#b90051]/30 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Memproses Dokumen...' : 'Proses & Cetak PDF Resmi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
