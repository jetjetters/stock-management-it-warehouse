'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus, Sparkles, QrCode, CheckCircle2 } from 'lucide-react';
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

export type PresetItemData = {
  name: string;
  categoryId: string;
  brandId: string;
  locationId: string;
};

type ItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
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
  onSuccess: (msg?: string) => void;
};

export function ItemModal({
  isOpen,
  onClose,
  categories,
  brands: initialBrands,
  locations,
  presetItem,
  editItem,
  onSuccess,
}: ItemModalProps) {
  const snInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

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
    } else if (presetItem) {
      setName(presetItem.name);
      setCategoryId(presetItem.categoryId);
      setBrandId(presetItem.brandId);
      setLocationId(presetItem.locationId);
      setSerialNumberInput('');
      setStatus('TERSEDIA');
      setDescription('');
      setSkuPreview('');
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

    // Focus SN input when modal opens
    if (isOpen) {
      setTimeout(() => {
        snInputRef.current?.focus();
      }, 100);
    }
  }, [editItem, presetItem, isOpen, categories, locations]);

  // Update SKU preview & Filter brands when Category changes
  useEffect(() => {
    if (categoryId) {
      if (!editItem && !presetItem) {
        getItemNextSku(categoryId).then((code) => setSkuPreview(code));
      } else if (editItem && categoryId !== editItem.categoryId) {
        getItemNextSku(categoryId).then((code) => setSkuPreview(code));
      } else if (presetItem && categoryId !== presetItem.categoryId) {
        getItemNextSku(categoryId).then((code) => setSkuPreview(code));
      } else if (editItem) {
        setSkuPreview(editItem.itemCode);
      } else if (presetItem) {
        getItemNextSku(categoryId).then((code) => setSkuPreview(code));
      }

      // Filter brands for selected category
      const filtered = brandsList.filter((b) => b.categoryId === categoryId);
      if (filtered.length > 0) {
        setBrandId((prev) => (filtered.some((f) => f.id === prev) ? prev : filtered[0].id));
      } else {
        setBrandId('');
      }
    }
  }, [categoryId, editItem, presetItem, brandsList]);

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
        onSuccess(`Unit SN (${serialNumberInput.trim()}) berhasil diperbarui.`);
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
        onSuccess(
          presetItem
            ? `Unit Serial Number (SN) baru berhasil ditambahkan untuk ${name}.`
            : 'Unit Serial Number (SN) baru berhasil ditambahkan.'
        );
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-[#b90051]" />
              <span>
                {editItem
                  ? 'Edit Unit Serial Number (SN)'
                  : presetItem
                  ? `Tambah Unit SN (${presetItem.name})`
                  : 'Registrasi Unit Inventaris (SN)'}
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {editItem
                ? `Mengubah data unit SKU: ${editItem.itemCode}`
                : presetItem
                ? `Menambahkan unit SN baru untuk produk: ${presetItem.name}`
                : 'Tambahkan unit barang ber-Serial Number ke dalam sistem stok'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {/* Preset Product Banner Info if Preset */}
          {presetItem && (
            <div className="p-3 bg-[#fae2ea] border border-[#f5b8cc] rounded-xl flex items-center justify-between text-xs">
              <span className="text-[#b90051] font-semibold truncate">
                Produk Target: <strong className="text-gray-900">{name}</strong>
              </span>
              <span className="text-[10px] bg-white text-[#b90051] font-bold px-2.5 py-0.5 rounded border border-[#f5b8cc] shrink-0">
                PRE-SET
              </span>
            </div>
          )}

          {/* Auto SKU Preview Badge */}
          {categoryId && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[#b90051] text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>
                  {editItem && categoryId !== editItem.categoryId
                    ? 'Generasi SKU Baru'
                    : 'Kode SKU Sekelompok'}
                </span>
              </div>
              <span className="font-mono text-sm font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                {skuPreview || 'Generasi SKU...'}
              </span>
            </div>
          )}

          {/* Nama Item / Model */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Nama Barang / Model <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Mouse Wireless M170 / EcoTank L3210"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#b90051] focus:ring-1 focus:ring-[#b90051] transition"
            />
          </div>

          {/* Serial Number Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center space-x-1.5">
                <QrCode className="w-3.5 h-3.5 text-[#b90051]" />
                <span>
                  Serial Number (SN) <span className="text-rose-500">*</span>
                </span>
              </label>
              {!editItem && (
                <span className="text-[10px] text-[#b90051] font-mono bg-[#fae2ea] px-2 py-0.5 rounded border border-[#f5b8cc]">
                  Multi-SN: Pisahkan per baris / koma
                </span>
              )}
            </div>
            {editItem ? (
              <input
                ref={snInputRef as any}
                type="text"
                required
                value={serialNumberInput}
                onChange={(e) => setSerialNumberInput(e.target.value)}
                placeholder="Serial Number Unik (contoh: SN-LOGI-10293)"
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 font-mono focus:outline-none focus:border-[#b90051] transition"
              />
            ) : (
              <textarea
                ref={snInputRef as any}
                required
                rows={3}
                value={serialNumberInput}
                onChange={(e) => setSerialNumberInput(e.target.value)}
                placeholder={'Masukkan SN baru...\nContoh:\nSN-LOGI-001\nSN-LOGI-002'}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 font-mono placeholder-gray-400 focus:outline-none focus:border-[#b90051] transition"
              />
            )}
          </div>

          {/* Category Dropdown & Brand Dropdown */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Kategori <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#b90051] transition"
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
                <label className="text-xs font-bold text-gray-700">
                  Merk / Brand <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddBrand(!showAddBrand)}
                  className="text-[11px] text-[#b90051] hover:text-[#8a003b] flex items-center gap-0.5 font-semibold cursor-pointer"
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
                    className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1 text-xs text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={handleCreateInlineBrand}
                    className="px-2.5 bg-[#b90051] text-white rounded-xl text-xs font-medium hover:bg-[#a00045] shrink-0"
                  >
                    Simpan
                  </button>
                </div>
              ) : (
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#b90051] transition"
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
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Lokasi Storage <span className="text-rose-500">*</span>
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#b90051] transition"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Status Unit <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#b90051] transition"
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
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Spesifikasi / Catatan Tambahan
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Garansi 1 Tahun, Nota Pembelian #102"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#b90051] transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#b90051] hover:bg-[#a00045] text-white rounded-xl text-xs font-bold shadow-md shadow-[#b90051]/20 transition disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {editItem
                      ? 'Simpan Perubahan'
                      : presetItem
                      ? 'Simpan Unit SN Baru'
                      : 'Registrasi Unit SN'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
