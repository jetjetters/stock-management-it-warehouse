'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Sparkles, QrCode, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { createItem, updateItem, getItemNextSku, type ItemCategoryType } from '@/app/actions/items';
import { createBrand } from '@/app/actions/master-data';

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
  const [description, setDescription] = useState(editItem?.description || '');
  const [skuPreview, setSkuPreview] = useState(editItem?.itemCode || '');

  // Dynamic Brands state
  const [brandsList, setBrandsList] = useState<BrandItem[]>(initialBrands);
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleCreateInlineBrand = async () => {
    if (!newBrandName.trim() || !categoryId) return;
    try {
      const created = await createBrand({ name: newBrandName, categoryId });
      setBrandsList((prev) => [...prev, created]);
      setBrandId(created.id);
      setNewBrandName('');
      setShowAddBrand(false);
    } catch (err: any) {
      setError(err.message || 'Gagal membuat brand baru');
    }
  };

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
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-slate-100 transition bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3.5 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 text-blue-400" />
          <span>Kembali ke Daftar Inventaris</span>
        </Link>
      </div>

      {/* Main Form Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="border-b border-slate-800 pb-6">
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center space-x-2.5">
            <QrCode className="w-5 h-5 text-blue-400" />
            <span>
              {editItem
                ? 'Edit Unit Serial Number (SN)'
                : presetItem?.name
                ? `Tambah Unit SN untuk (${presetItem.name})`
                : 'Registrasi Unit Inventaris (SN Baru)'}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {editItem
              ? `Mengubah rincian unit barang SKU: ${editItem.itemCode}`
              : presetItem?.name
              ? `Menambahkan unit Serial Number baru untuk model barang ${presetItem.name}`
              : 'Isi formulir di bawah ini untuk menambahkan barang ber-Serial Number ke dalam sistem inventaris.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-medium flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Preset Product Banner Info if Preset */}
          {presetItem?.name && (
            <div className="p-4 bg-blue-950/60 border border-blue-500/30 rounded-xl flex items-center justify-between text-xs">
              <span className="text-blue-300 font-semibold truncate">
                Produk Target: <strong className="text-white">{name}</strong>
              </span>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 font-bold px-2.5 py-0.5 rounded border border-blue-500/30 shrink-0">
                PRE-SET PRODUCT
              </span>
            </div>
          )}

          {/* Auto SKU Preview Badge */}
          {categoryId && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>
                  {editItem && categoryId !== editItem.categoryId
                    ? 'Generasi SKU Baru (Kategori Diubah)'
                    : 'Kode SKU Sekelompok Automatic'}
                </span>
              </div>
              <span className="font-mono text-sm font-bold tracking-wider text-blue-300 bg-blue-950 px-3 py-1 rounded-lg border border-blue-800">
                {skuPreview || 'Generasi SKU...'}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Item / Model */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Nama Barang / Model <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Mouse Wireless M170 / EcoTank L3210"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Serial Number Dynamic Inputs */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                  <QrCode className="w-4 h-4 text-blue-400" />
                  <span>
                    Serial Number (SN) <span className="text-rose-400">*</span>
                  </span>
                </label>
                {!editItem && (
                  <span className="text-[11px] text-blue-400 font-mono bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                    Total Input: {serialNumbers.filter((s) => s.trim()).length} Unit
                  </span>
                )}
              </div>

              {/* Dynamic SN Fields */}
              <div className="space-y-2.5">
                {serialNumbers.map((sn, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-mono font-semibold select-none">
                        SN #{idx + 1}
                      </span>
                      <input
                        type="text"
                        required
                        value={sn}
                        onChange={(e) => handleSnChange(idx, e.target.value)}
                        placeholder={`Masukkan Serial Number #${idx + 1} (contoh: SN-LOGI-${String(idx + 1).padStart(3, '0')})`}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-16 pr-4 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>
                    {!editItem && serialNumbers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSnField(idx)}
                        className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-slate-800 hover:border-rose-500/30 transition shrink-0 cursor-pointer"
                        title="Hapus baris SN ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add SN Row Button */}
              {!editItem && (
                <button
                  type="button"
                  onClick={handleAddSnField}
                  className="w-full py-2.5 border border-dashed border-slate-700 hover:border-blue-500/50 bg-slate-950/40 hover:bg-blue-500/5 text-blue-400 hover:text-blue-300 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Baris Input SN Baru</span>
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Kategori <span className="text-rose-400">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
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
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-300">
                  Merk / Brand <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddBrand(!showAddBrand)}
                  className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Brand
                </button>
              </div>

              {showAddBrand ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="Nama Merk Baru"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={handleCreateInlineBrand}
                    className="px-3 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-500 shrink-0 cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
              ) : (
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
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
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Lokasi Storage <span className="text-rose-400">*</span>
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
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
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Status Unit <span className="text-rose-400">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
              >
                <option value="TERSEDIA">TERSEDIA (Available)</option>
                <option value="TERPAKAI">TERPAKAI (In Use)</option>
                <option value="DIPINJAM">DIPINJAM (On Loan)</option>
                <option value="RUSAK">RUSAK (Damaged)</option>
              </select>
            </div>

            {/* Keterangan */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Spesifikasi / Catatan Tambahan
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Garansi 1 Tahun, Nota Pembelian #102"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-end space-x-3">
            <Link
              href="/items"
              className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-700 transition"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
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
