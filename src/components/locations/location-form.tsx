'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, AlertCircle } from 'lucide-react';
import { createLocation, updateLocation } from '@/app/actions/master-data';

type LocationFormProps = {
  editLocation?: {
    id: string;
    name: string;
    description?: string | null;
  } | null;
};

export function LocationForm({ editLocation }: LocationFormProps) {
  const router = useRouter();

  const [name, setName] = useState(editLocation?.name || '');
  const [description, setDescription] = useState(editLocation?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama Lokasi Storage wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (editLocation) {
        await updateLocation(editLocation.id, { name, description });
      } else {
        await createLocation({ name, description });
      }
      router.push('/locations');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan lokasi storage');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header & Back Button */}
      <div className="flex items-center space-x-4">
        <Link
          href="/locations"
          className="p-2.5 bg-white border border-gray-200 hover:border-[#b90051] hover:text-[#b90051] rounded-xl transition text-gray-600 shadow-2xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <span>{editLocation ? 'Edit Master Lokasi Storage' : 'Tambah Lokasi Storage Baru'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {editLocation
              ? `Mengubah rincian area lokasi: ${editLocation.name}`
              : 'Daftarkan pos area penyimpanan inventaris IT dan pos pergerakan barang'}
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#fae2ea] text-[#b90051] border border-[#f5b8cc] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Formulir Master Lokasi Storage</h2>
              <p className="text-xs text-gray-500">Lengkapi informasi pos lokasi penyimpanan barang</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Nama Lokasi */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Nama Lokasi Storage <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Warehouse IT, Main Office, Server Room, Logistic Yard"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#b90051] focus:ring-1 focus:ring-[#b90051] transition"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Deskripsi Area / Detail Lokasi
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Rak A1 - Zona Perangkat, Gedung Utama PTK Tanjung Batu Lantai 2"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#b90051] focus:ring-1 focus:ring-[#b90051] transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-end space-x-3">
            <Link
              href="/locations"
              className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#b90051] hover:bg-[#a00045] text-white rounded-xl text-xs font-bold shadow-md shadow-[#b90051]/20 transition disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
            >
              <span>{loading ? 'Menyimpan...' : editLocation ? 'Perbarui Lokasi' : 'Simpan Lokasi Baru'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
