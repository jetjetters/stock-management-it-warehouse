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
            href="/items"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-slate-100 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl transition mb-2"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400" />
            <span>Kembali ke Inventaris</span>
          </Link>

          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center space-x-2.5">
            <Send className="w-6 h-6 text-blue-400" />
            <span>Form Serah Terima Barang IT</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Penerbitan surat serah terima fisik & cetak PDF resmi PTK Shore Base Tanjung Batu
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Barang & SN Selection */}
          <div className="space-y-3 bg-slate-950 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <label className="block text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
                <Package className="w-4 h-4 text-blue-400" />
                <span>Daftar Barang & Serial Number (SN) Unit yang Diserahkan *</span>
              </label>
              <button
                type="button"
                onClick={handleAddAnotherItemRow}
                disabled={availableItems.length <= selectedItems.length}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Barang / SN Lain</span>
              </button>
            </div>

            {availableItems.length === 0 ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-medium">
                Tidak ada unit Serial Number (SN) berstatus <strong>TERSEDIA</strong> untuk diserahkan saat ini. Silakan tambahkan unit baru atau ubah status melalui Audit.
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {selectedItems.map((selItem, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800"
                  >
                    <span className="text-xs font-bold text-slate-400 font-mono w-7 text-center bg-slate-950 py-1.5 rounded border border-slate-800">
                      #{idx + 1}
                    </span>

                    <select
                      value={selItem.itemId}
                      onChange={(e) => handleSelectItemChange(idx, e.target.value)}
                      required
                      className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
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
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition border border-slate-800"
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
              <label className="block text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                <UserCheck className="w-4 h-4 text-blue-400" />
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
              <label className="block text-xs font-bold text-slate-200">
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
          </div>

          {/* Section 3: Catatan & Lokasi Base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-end space-x-3">
            <Link
              href="/items"
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading || availableItems.length === 0}
              className="px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/30 transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
