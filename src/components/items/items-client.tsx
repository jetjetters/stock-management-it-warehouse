'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  ClipboardCheck,
  Repeat,
  Pencil,
  Trash2,
  Boxes,
  Monitor,
  Package,
} from 'lucide-react';
import { deleteItem, type ItemCategoryType } from '@/app/actions/items';
import { ItemModal } from '@/components/items/item-modal';
import { StockOpnameModal } from '@/components/items/stock-opname-modal';
import { QuickMutateModal } from '@/components/items/quick-mutate-modal';
import { DeleteConfirmModal } from '@/components/ui/delete-confirm-modal';
import { useRouter } from 'next/navigation';

type ItemType = {
  id: string;
  itemCode: string;
  name: string;
  type: ItemCategoryType;
  description?: string | null;
  currentStock: number;
  categoryId: string;
  brandId: string;
  locationId: string;
  category: { id: string; name: string; codePrefix: string; type: ItemCategoryType };
  brand: { id: string; name: string; categoryId: string };
  location: { id: string; name: string };
};

type ItemsClientProps = {
  initialItems: ItemType[];
  categories: any[];
  brands: any[];
  locations: any[];
};

export function ItemsClient({
  initialItems,
  categories,
  brands,
  locations,
}: ItemsClientProps) {
  const router = useRouter();

  // Filters
  const [activeTab, setActiveTab] = useState<'ALL' | 'DEVICE' | 'BARANG'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ItemType | null>(null);

  const [isOpnameModalOpen, setIsOpnameModalOpen] = useState(false);
  const [opnameItem, setOpnameItem] = useState<ItemType | null>(null);

  const [isMutateModalOpen, setIsMutateModalOpen] = useState(false);
  const [mutateItem, setMutateItem] = useState<ItemType | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Filter items
  const filteredItems = initialItems.filter((item) => {
    // Type tab filter
    if (activeTab !== 'ALL' && item.type !== activeTab) return false;

    // Search query
    if (search) {
      const q = search.toLowerCase();
      const matchCode = item.itemCode.toLowerCase().includes(q);
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q) || false;
      const matchBrand = item.brand.name.toLowerCase().includes(q);
      if (!matchCode && !matchName && !matchDesc && !matchBrand) return false;
    }

    // Category filter
    if (selectedCategory && item.categoryId !== selectedCategory) return false;

    // Location filter
    if (selectedLocation && item.locationId !== selectedLocation) return false;

    return true;
  });

  const handleRefresh = () => {
    router.refresh();
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteItem(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Inventaris Stok IT</h1>
          <p className="text-xs text-slate-400">
            Kelola inventaris Perangkat (Device) & Barang Habis Pakai (Consumables)
          </p>
        </div>

        <button
          onClick={() => {
            setEditItem(null);
            setIsItemModalOpen(true);
          }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm shadow-lg shadow-blue-600/20 transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Item Inventaris</span>
        </button>
      </div>

      {/* Tabs & Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        {/* Type Tabs */}
        <div className="flex border-b border-slate-800 pb-3 space-x-2">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'ALL'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>SEMUA INVENTARIS</span>
          </button>

          <button
            onClick={() => setActiveTab('DEVICE')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'DEVICE'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>PERANGKAT (DEVICE)</span>
          </button>

          <button
            onClick={() => setActiveTab('BARANG')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'BARANG'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>CONSUMABLES (BARANG)</span>
          </button>
        </div>

        {/* Search & Select Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode SKU, nama, merk..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="">Semua Lokasi Storage</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Items Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Kode SKU</th>
                <th className="p-4">Nama Barang & Specs</th>
                <th className="p-4">Tipe</th>
                <th className="p-4">Kategori & Brand</th>
                <th className="p-4">Lokasi Storage</th>
                <th className="p-4 text-center">Stok Terkini</th>
                <th className="p-4 text-right">Aksi & Mutasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 text-sm">
                    Tidak ada data item yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isDevice = item.type === 'DEVICE';
                  const isLowStock = item.currentStock <= 5;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      {/* SKU Code */}
                      <td className="p-4">
                        <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded border border-blue-800/80">
                          {item.itemCode}
                        </span>
                      </td>

                      {/* Item Name */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-100">{item.name}</div>
                        {item.description && (
                          <div className="text-xs text-slate-400 truncate max-w-xs">
                            {item.description}
                          </div>
                        )}
                      </td>

                      {/* Type Badge */}
                      <td className="p-4">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            isDevice
                              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                              : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>

                      {/* Category & Brand */}
                      <td className="p-4">
                        <div className="text-xs font-medium text-slate-200">
                          {item.category.name}
                        </div>
                        <div className="text-[11px] text-slate-400">{item.brand.name}</div>
                      </td>

                      {/* Location */}
                      <td className="p-4">
                        <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
                          {item.location.name}
                        </span>
                      </td>

                      {/* Current Stock */}
                      <td className="p-4 text-center">
                        <div
                          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg font-mono text-sm font-bold ${
                            isLowStock
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-100 border border-slate-700'
                          }`}
                        >
                          <span>{item.currentStock}</span>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Stock Opname Adjustment button */}
                          <button
                            title="Stock Opname (Adjustment)"
                            onClick={() => {
                              setOpnameItem(item);
                              setIsOpnameModalOpen(true);
                            }}
                            className="p-1.5 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-xs font-medium transition flex items-center space-x-1"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">Opname</span>
                          </button>

                          {/* Quick Mutate button */}
                          <button
                            title="Mutasi Stok Instant"
                            onClick={() => {
                              setMutateItem(item);
                              setIsMutateModalOpen(true);
                            }}
                            className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs font-medium transition flex items-center space-x-1"
                          >
                            <Repeat className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">Mutasi</span>
                          </button>

                          {/* Edit Item button */}
                          <button
                            title="Edit Item"
                            onClick={() => {
                              setEditItem(item);
                              setIsItemModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Delete Item button */}
                          <button
                            title="Hapus Item"
                            onClick={() => setDeleteTarget({ id: item.id, name: item.name })}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Modal */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        categories={categories}
        brands={brands}
        locations={locations}
        editItem={editItem}
        onSuccess={handleRefresh}
      />

      {/* Opname Modal */}
      <StockOpnameModal
        isOpen={isOpnameModalOpen}
        onClose={() => setIsOpnameModalOpen(false)}
        item={opnameItem}
        locations={locations}
        onSuccess={handleRefresh}
      />

      {/* Quick Mutate Modal */}
      <QuickMutateModal
        isOpen={isMutateModalOpen}
        onClose={() => setIsMutateModalOpen(false)}
        item={mutateItem}
        locations={locations}
        onSuccess={handleRefresh}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Item Inventaris"
        itemName={deleteTarget?.name || ''}
        itemType="item inventaris"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
