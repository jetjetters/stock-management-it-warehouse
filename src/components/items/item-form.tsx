'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Sparkles, QrCode, CheckCircle2, AlertCircle } from 'lucide-react';
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

type ItemFormProps = {
  categories: CategoryItem[];
  brands: BrandItem[];
  locations: LocationItem[];
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
  editItem,
}: ItemFormProps) {
  const router = useRouter();

  const [name, setName] = useState(editItem?.name || '');
  const [categoryId, setCategoryId] = useState(editItem?.categoryId || categories[0]?.id || '');
  const [brandId, setBrandId] = useState(editItem?.brandId || '');
  const [locationId, setLocationId] = useState(editItem?.locationId || locations[0]?.id || '');
  const [serialNumberInput, setSerialNumberInput] = useState(editItem?.serialNumber || '');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editItem) {
        await updateItem(editItem.id, {
          serialNumber: serialNumberInput.trim(),
          name,
          categoryId,
          brandId,
          locationId,
          status,
          description,
        });
        router.push('/items?success=' + encodeURIComponent(`Unit SN ${serialNumberInput.trim()} berhasil diperbarui.`));
      } else {
        await createItem({
          name,
          categoryId,
          brandId,
          locationId,
          serialNumberInput,
          status,
          description,
        });
        router.push('/items?success=' + encodeURIComponent('Unit Serial Number (SN) baru berhasil ditambahkan.'));
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
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-slate-100 transition bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4 text-blue-400" />
          <span>Kembali ke Inventaris Stok</span>
        </Link>
      </div>

      {/* Main Form Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="border-b border-slate-800 pb-6 mb-6">
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center space-x-2.5">
            <QrCode className="w-5 h-5 text-blue-400" />
            <span>{editItem ? 'Edit Unit Serial Number (SN)' : 'Registrasi Unit Inventaris (SN Baru)'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {editItem
              ? `Mengubah rincian unit barang SKU: ${editItem.itemCode}`
              : 'Isi formulir di bawah ini untuk menambahkan barang ber-Serial Number ke dalam sistem inventaris.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Auto SKU Preview Badge */}
          {categoryId && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-between">
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

            {/* Serial Number Input */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
                  <QrCode className="w-4 h-4 text-blue-400" />
                  <span>Serial Number (SN) <span className="text-rose-400">*</span></span>
                </label>
                {!editItem && (
                  <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    Multi-SN: Pisahkan per baris atau koma
                  </span>
                )}
              </div>
              {editItem ? (
                <input
                  type="text"
                  required
                  value={serialNumberInput}
                  onChange={(e) => setSerialNumberInput(e.target.value)}
                  placeholder="Serial Number Unik (contoh: SN-LOGI-10293)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-blue-500 transition"
                />
              ) : (
                <textarea
                  required
                  rows={4}
                  value={serialNumberInput}
                  onChange={(e) => setSerialNumberInput(e.target.value)}
                  placeholder={'Contoh:\nSN-LOGI-001\nSN-LOGI-002\nSN-LOGI-003'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                />
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
                  className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
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
                    className="px-3 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-500 shrink-0"
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
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition disabled:opacity-50 flex items-center space-x-2"
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
