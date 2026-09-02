'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Sparkles, QrCode, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { createItem, updateItem, getItemNextSku, type ItemCategoryType } from '@/app/actions/items';

type CategoryItem = {
  id: string;
  name: string;
  type: ItemCategoryType;
  codePrefix: string;
};

type BrandItem = {
  id: string;
  name: string;
  categoryId: string;
};

type LocationItem = {
  id: string;
  name: string;
};

export type PresetItemData = {
  name?: string;
  categoryId?: string;
  brandId?: string;
  locationId?: string;
};

type ItemFormProps = {
  categories: CategoryItem[];
  brands: BrandItem[];
  locations: LocationItem[];
  presetItem?: PresetItemData | null;
  editItem?: {
    id: string;
    serialNumber: string;
    itemCode: string;
    name: string;
    categoryId: string;
    brandId: string;
    locationId: string;
    status: string;
    ownershipStatus?: string | null;
    description?: string | null;
  } | null;
};

export function ItemForm({
  categories,
  brands: initialBrands,
  locations,
  presetItem,
  editItem,
}: ItemFormProps) {
  const router = useRouter();

  const [name, setName] = useState(editItem?.name || presetItem?.name || '');
  const [categoryId, setCategoryId] = useState(
    editItem?.categoryId || presetItem?.categoryId || categories[0]?.id || ''
  );
  const [brandId, setBrandId] = useState(editItem?.brandId || presetItem?.brandId || '');
  const [locationId, setLocationId] = useState(
    editItem?.locationId || presetItem?.locationId || locations[0]?.id || ''
  );

  // Dynamic individual Serial Number fields state
  const [serialNumbers, setSerialNumbers] = useState<string[]>(
    editItem ? [editItem.serialNumber] : ['']
  );

  const [status, setStatus] = useState(editItem?.status || 'TERSEDIA');
  const [ownershipStatus, setOwnershipStatus] = useState(
    editItem?.ownershipStatus || 'MILIK_IT'
  );
  const [description, setDescription] = useState(editItem?.description || '');
  const [skuPreview, setSkuPreview] = useState(editItem?.itemCode || '');

  // Brands list state
  const [brandsList, setBrandsList] = useState<BrandItem[]>(initialBrands);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);
  const isDevice = selectedCategoryObj?.type === 'DEVICE';

  useEffect(() => {
    setBrandsList(initialBrands);
  }, [initialBrands]);

  // Update SKU preview & Filter brands when Category changes
  useEffect(() => {
    if (categoryId) {
      if (!editItem || categoryId !== editItem.categoryId) {
        getItemNextSku(categoryId).then((code) => setSkuPreview(code));
      } else {
        setSkuPreview(editItem.itemCode);
      }

      // Filter brands for selected category
      const filtered = brandsList.filter((b) => b.categoryId === categoryId);
      if (filtered.length > 0) {
        setBrandId((prev) => (filtered.some((f) => f.id === prev) ? prev : filtered[0].id));
      } else {
        setBrandId('');
      }
    }
  }, [categoryId, editItem, brandsList]);

  const availableBrands = categoryId
    ? brandsList.filter((b) => b.categoryId === categoryId)
    : brandsList;

  const handleSnChange = (index: number, value: string) => {
    setSerialNumbers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleAddSnField = () => {
    setSerialNumbers((prev) => [...prev, '']);
  };

  const handleRemoveSnField = (index: number) => {
    if (serialNumbers.length <= 1) return;
    setSerialNumbers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Clean & validate SN inputs
    const cleanSns = serialNumbers.map((s) => s.trim()).filter(Boolean);

    if (cleanSns.length === 0) {
      setError('Wajib mengisikan setidaknya 1 Serial Number (SN).');
      setLoading(false);
      return;
    }

    // Check for duplicate SN entries inside current form
    const duplicates = cleanSns.filter((sn, idx) => cleanSns.indexOf(sn) !== idx);
    if (duplicates.length > 0) {
      setError(`Terdapat Serial Number duplikat pada formulir: ${Array.from(new Set(duplicates)).join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      if (editItem) {
        await updateItem(editItem.id, {
          serialNumber: cleanSns[0],
          name,
          categoryId,
          brandId,
          locationId,
          status,
          ownershipStatus: isDevice ? ownershipStatus : undefined,
          description,
        });
        router.push('/items?success=' + encodeURIComponent(`Unit SN ${cleanSns[0]} berhasil diperbarui.`));
      } else {
        await createItem({
          name,
          categoryId,
          brandId,
          locationId,
          serialNumberInput: cleanSns.join('\n'),
          status,
          ownershipStatus: isDevice ? ownershipStatus : undefined,
          description,
        });
        router.push(
          '/items?success=' +
            encodeURIComponent(
              cleanSns.length > 1
                ? `${cleanSns.length} Unit Serial Number (SN) baru berhasil ditambahkan.`
                : 'Unit Serial Number (SN) baru berhasil ditambahkan.'
            )
        );
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data barang');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/items"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition bg-white hover:bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-[#b90051]" />
          <span>Kembali ke Daftar Inventaris</span>
        </Link>
      </div>

      {/* Main Form Card */}
      <div className="bg-white border-2 border-[#b90051] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-gray-100 pb-6">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center space-x-2.5">
            <QrCode className="w-5 h-5 text-[#b90051]" />
            <span>
              {editItem
                ? 'Edit Unit Serial Number (SN)'
                : presetItem?.name
                ? `Tambah Unit SN untuk (${presetItem.name})`
                : 'Registrasi Unit Inventaris (SN Baru)'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {editItem
              ? `Mengubah rincian unit barang SKU: ${editItem.itemCode}`
              : presetItem?.name
              ? `Menambahkan unit Serial Number baru untuk model barang ${presetItem.name}`
              : 'Isi formulir di bawah ini untuk menambahkan barang ber-Serial Number ke dalam sistem inventaris.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Preset Product Banner Info if Preset */}
          {presetItem?.name && (
            <div className="p-4 bg-[#fae2ea] border border-[#f5b8cc] rounded-xl flex items-center justify-between text-xs">
              <span className="text-[#b90051] font-semibold truncate">
                Produk Target: <strong className="text-gray-900">{name}</strong>
              </span>
              <span className="text-[10px] bg-white text-[#b90051] font-bold px-2.5 py-0.5 rounded border border-[#f5b8cc] shrink-0">
                PRE-SET PRODUCT
              </span>
            </div>
          )}

          {/* Auto SKU Preview Badge */}
          {categoryId && (
            <div className="p-4 bg-[#fdf2f6] border border-[#f5b8cc] rounded-xl flex items-center justify-between">
              <div className="text-xs font-bold text-[#b90051] uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>
                  {editItem && categoryId !== editItem.categoryId
                    ? 'Generasi SKU Baru (Kategori Diubah)'
                    : 'Kode SKU Sekelompok Automatic'}
                </span>
              </div>
              <span className="font-mono text-sm font-bold tracking-wider text-[#b90051] bg-[#fae2ea] px-3 py-1 rounded-lg border border-[#f5b8cc]">
                {skuPreview || 'Generasi SKU...'}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Item / Model */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Nama Barang / Model <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Mouse Wireless M170 / EcoTank L3210 / Kabel Belden Cat6"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#b90051] focus:ring-1 focus:ring-[#b90051] transition"
                required
              />
            </div>

            {/* Serial Numbers (SN) Multi-unit Inputs */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 flex items-center space-x-2">
                  <QrCode className="w-4 h-4 text-[#b90051]" />
                  <span>Serial Number (SN) <span className="text-rose-500">*</span></span>
                </label>
                <span className="text-xs font-mono font-bold text-[#b90051] bg-[#fae2ea] px-2.5 py-0.5 rounded-full border border-[#f5b8cc]">
                  Total Input: {serialNumbers.filter((s) => s.trim()).length} Unit
                </span>
              </div>

              {/* Dynamic SN rows */}
              <div className="space-y-2.5">
                {serialNumbers.map((sn, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-gray-400 select-none pointer-events-none">
                        SN #{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={sn}
                        onChange={(e) => handleSnChange(idx, e.target.value)}
                        placeholder={`Masukkan Serial Number #${idx + 1} (contoh: SN-LOGI-001)`}
                        className="w-full bg-white border border-gray-200 rounded-xl pl-20 pr-4 py-2.5 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#b90051] focus:ring-1 focus:ring-[#b90051] transition"
                        required
                      />
                    </div>
                    {!editItem && serialNumbers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSnField(idx)}
                        className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-gray-200 transition"
                        title="Hapus baris SN ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {!editItem && (
                <button
                  type="button"
                  onClick={handleAddSnField}
                  className="w-full py-2.5 border-2 border-dashed border-[#f5b8cc] hover:border-[#b90051] bg-[#fae2ea]/40 hover:bg-[#fae2ea] text-[#b90051] rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Baris Input SN Baru</span>
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Kategori <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#b90051] transition"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.type}) [{cat.codePrefix}]
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Dropdown */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Merk / Brand <span className="text-rose-500">*</span>
              </label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#b90051] transition"
              >
                <option value="" disabled>
                  -- Pilih Merk --
                </option>
                {availableBrands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Kepemilikan (Khusus Jenis Perangkat / DEVICE) */}
            {isDevice && (
              <div className="md:col-span-2 p-4 bg-[#fff8fa] border border-[#f5b8cc] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#b90051]"></span>
                    <span>Status Kepemilikan Perangkat <span className="text-rose-500">*</span></span>
                  </label>
                  <span className="text-[10px] uppercase font-bold text-[#b90051] bg-[#fae2ea] px-2.5 py-0.5 rounded-full border border-[#f5b8cc]">
                    Khusus Device
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Milik IT */}
                  <button
                    type="button"
                    onClick={() => setOwnershipStatus('MILIK_IT')}
                    className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                      ownershipStatus === 'MILIK_IT'
                        ? 'border-[#b90051] bg-white shadow-sm ring-2 ring-[#b90051]/20'
                        : 'border-gray-200 bg-white/70 hover:bg-white text-gray-600'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-xs font-bold text-gray-900">Milik IT</span>
                      </div>
                      <p className="text-[11px] text-gray-500">Aset inventaris internal milik IT / Kantor</p>
                    </div>
                    {ownershipStatus === 'MILIK_IT' && (
                      <CheckCircle2 className="w-4 h-4 text-[#b90051] shrink-0" />
                    )}
                  </button>

                  {/* Option 2: Sewa */}
                  <button
                    type="button"
                    onClick={() => setOwnershipStatus('SEWA')}
                    className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                      ownershipStatus === 'SEWA'
                        ? 'border-[#b90051] bg-white shadow-sm ring-2 ring-[#b90051]/20'
                        : 'border-gray-200 bg-white/70 hover:bg-white text-gray-600'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-xs font-bold text-gray-900">Sewa (Rental)</span>
                      </div>
                      <p className="text-[11px] text-gray-500">Perangkat vendor sewa operasional</p>
                    </div>
                    {ownershipStatus === 'SEWA' && (
                      <CheckCircle2 className="w-4 h-4 text-[#b90051] shrink-0" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Lokasi Storage <span className="text-rose-500">*</span>
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#b90051] transition"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Status Unit <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#b90051] transition"
              >
                <option value="TERSEDIA">TERSEDIA (Available)</option>
                <option value="TERPAKAI">TERPAKAI (In Use)</option>
                <option value="DIPINJAM">DIPINJAM (On Loan)</option>
                <option value="RUSAK">RUSAK (Damaged)</option>
              </select>
            </div>

            {/* Keterangan */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Spesifikasi / Catatan Tambahan
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Garansi 1 Tahun, Nota Pembelian #102"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#b90051] transition"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-end space-x-3">
            <Link
              href="/items"
              className="px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#b90051] text-white rounded-xl text-sm font-semibold hover:bg-[#a00045] shadow-md shadow-[#b90051]/20 transition disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editItem ? 'Simpan Perubahan' : 'Registrasi Unit SN'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
