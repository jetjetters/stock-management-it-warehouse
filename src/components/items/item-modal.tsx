'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Sparkles, QrCode } from 'lucide-react';
import { createItem, updateItem, getItemNextSku } from '@/app/actions/items';
import { createBrand } from '@/app/actions/master-data';

export type ItemCategoryType = 'DEVICE' | 'BARANG';

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

type ItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
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
  onSuccess: (msg?: string) => void;
};

export function ItemModal({
  isOpen,
  onClose,
  categories,
  brands: initialBrands,
  locations,
  editItem,
  onSuccess,
}: ItemModalProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [serialNumberInput, setSerialNumberInput] = useState('');
  const [status, setStatus] = useState('TERSEDIA');
  const [description, setDescription] = useState('');
  const [skuPreview, setSkuPreview] = useState('');

  // Dynamic Brands state
  const [brandsList, setBrandsList] = useState<BrandItem[]>(initialBrands);
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setBrandsList(initialBrands);
  }, [initialBrands]);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setCategoryId(editItem.categoryId);
      setBrandId(editItem.brandId);
      setLocationId(editItem.locationId);
      setSerialNumberInput(editItem.serialNumber);
      setStatus(editItem.status || 'TERSEDIA');
      setDescription(editItem.description || '');
      setSkuPreview(editItem.itemCode);
    } else {
      setName('');
      setCategoryId(categories[0]?.id || '');
      setBrandId('');
      setLocationId(locations[0]?.id || '');
      setSerialNumberInput('');
      setStatus('TERSEDIA');
      setDescription('');
      setSkuPreview('');
    }
    setError('');
  }, [editItem, isOpen, categories, locations]);

  // Update SKU preview & Filter brands when Category changes
  useEffect(() => {
    if (categoryId) {
      if (!editItem) {
        getItemNextSku(categoryId).then((code) => setSkuPreview(code));
      } else if (editItem && categoryId !== editItem.categoryId) {
        getItemNextSku(categoryId).then((code) => setSkuPreview(code));
      } else {
        setSkuPreview(editItem.itemCode);
      }

      // Filter brands for selected category
      const filtered = brandsList.filter((b) => b.categoryId === categoryId);
      if (filtered.length > 0) {
        setBrandId(filtered[0].id);
      } else {
        setBrandId('');
      }
    }
  }, [categoryId, editItem, brandsList]);

  if (!isOpen) return null;

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
        onSuccess('Data item unit (SN) berhasil diperbarui.');
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
        onSuccess('Unit Serial Number (SN) baru berhasil ditambahkan.');
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              {editItem ? 'Edit Unit Serial Number (SN)' : 'Registrasi Unit Inventaris (SN)'}
            </h2>
            <p className="text-xs text-slate-400">
              {editItem ? `Kode SKU: ${editItem.itemCode}` : 'Tambahkan unit barang ber-Serial Number ke stok'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Auto SKU Preview Badge */}
          {categoryId && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>
                  {editItem && categoryId !== editItem.categoryId
                    ? 'Generasi SKU Baru'
                    : 'Kode SKU Sekelompok'}
                </span>
              </div>
              <span className="font-mono text-sm font-bold tracking-wider text-blue-300 bg-blue-950 px-2.5 py-1 rounded border border-blue-800">
                {skuPreview || 'Generasi SKU...'}
              </span>
            </div>
          )}

          {/* Nama Item / Model */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Nama Barang / Model <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Mouse Wireless M170 / EcoTank L3210"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Serial Number Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
                <QrCode className="w-3.5 h-3.5 text-blue-400" />
                <span>Serial Number (SN) <span className="text-rose-400">*</span></span>
              </label>
              {!editItem && (
                <span className="text-[10px] text-slate-400 font-mono">
                  Multi-SN: Pisahkan per baris / koma
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              />
            ) : (
              <textarea
                required
                rows={3}
                value={serialNumberInput}
                onChange={(e) => setSerialNumberInput(e.target.value)}
                placeholder={'Contoh:\nSN-LOGI-001\nSN-LOGI-002\nSN-LOGI-003'}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            )}
          </div>

          {/* Category Dropdown */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Kategori <span className="text-rose-400">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Merk / Brand <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddBrand(!showAddBrand)}
                  className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" /> Tambah
                </button>
              </div>

              {showAddBrand ? (
                <div className="flex space-x-1.5">
                  <input
                    type="text"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="Nama Merk Baru"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={handleCreateInlineBrand}
                    className="px-2.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-500"
                  >
                    Simpan
                  </button>
                </div>
              ) : (
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
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
          </div>

          {/* Location & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Lokasi Storage <span className="text-rose-400">*</span>
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Status Unit <span className="text-rose-400">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="TERSEDIA">TERSEDIA (Available)</option>
                <option value="TERPAKAI">TERPAKAI (In Use)</option>
                <option value="DIPINJAM">DIPINJAM (On Loan)</option>
                <option value="RUSAK">RUSAK (Damaged)</option>
              </select>
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Spesifikasi / Catatan Tambahan
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Garansi 1 Tahun, Nota Pembelian #102"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Action Buttons */}
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
              {loading ? 'Menyimpan...' : editItem ? 'Simpan Perubahan' : 'Registrasi Unit SN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

