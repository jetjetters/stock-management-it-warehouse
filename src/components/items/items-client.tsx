'use client';

import { useState, useEffect, Fragment } from 'react';
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
  ChevronDown,
  ChevronRight,
  QrCode,
  Layers,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import { deleteItem, type ItemCategoryType } from '@/app/actions/items';
import { type PresetItemData } from '@/components/items/item-form';
import { StockOpnameModal } from '@/components/items/stock-opname-modal';
import { QuickMutateModal } from '@/components/items/quick-mutate-modal';
import { HandoverModal } from '@/components/items/handover-modal';
import { DeleteConfirmModal } from '@/components/ui/delete-confirm-modal';
import { SuccessModal } from '@/components/ui/success-modal';
import { useRouter, useSearchParams } from 'next/navigation';

type ItemType = {
  id: string;
  serialNumber: string;
  itemCode: string;
  name: string;
  type: ItemCategoryType;
  description?: string | null;
  status: string;
  categoryId: string;
  brandId: string;
  locationId: string;
  createdAt: Date | string;
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

type GroupedStock = {
  key: string;
  name: string;
  categoryId: string;
  brandId: string;
  locationId: string;
  type: ItemCategoryType;
  category: any;
  brand: any;
  location: any;
  totalStock: number;
  availableStock: number;
  items: ItemType[];
};

export function ItemsClient({
  initialItems,
  categories,
  brands,
  locations,
}: ItemsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // View Mode: 'GROUPED' (Stok Per Kategori/Merk/Lokasi) or 'FLAT_SN' (Semua Serial Number)
  const [viewMode, setViewMode] = useState<'GROUPED' | 'FLAT_SN'>('GROUPED');

  // Filters
  const [activeTab, setActiveTab] = useState<'ALL' | 'DEVICE' | 'BARANG'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Expanded Groups in Grouped View
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});


  // Handover (Serah Terima) modal state
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [handoverItem, setHandoverItem] = useState<any | null>(null);

  // Modals state
  const [isOpnameModalOpen, setIsOpnameModalOpen] = useState(false);
  const [opnameItem, setOpnameItem] = useState<ItemType | null>(null);

  const [isMutateModalOpen, setIsMutateModalOpen] = useState(false);
  const [mutateItem, setMutateItem] = useState<ItemType | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; sn: string } | null>(null);

  // Success modal state
  const [successMsg, setSuccessMsg] = useState('');

  const successParam = searchParams.get('success');

  useEffect(() => {
    if (successParam) {
      setSuccessMsg(successParam);
      window.history.replaceState(null, '', '/items');
    }
  }, [successParam]);

  // Open Item Page for Add New
  const handleOpenAddModal = (preset?: PresetItemData) => {
    if (preset) {
      const q = new URLSearchParams({
        name: preset.name || '',
        categoryId: preset.categoryId || '',
        brandId: preset.brandId || '',
        locationId: preset.locationId || '',
      }).toString();
      router.push(`/items/new?${q}`);
    } else {
      router.push('/items/new');
    }
  };

  // Open Item Page for Edit Existing SN Item
  const handleOpenEditModal = (item: ItemType) => {
    router.push(`/items/new?editId=${item.id}`);
  };

  // Filter raw items
  const filteredItems = initialItems.filter((item) => {
    // Type tab filter
    if (activeTab !== 'ALL' && item.type !== activeTab) return false;

    // Search query (SN, SKU, Name, Brand, Description)
    if (search) {
      const q = search.toLowerCase();
      const matchSN = item.serialNumber.toLowerCase().includes(q);
      const matchCode = item.itemCode.toLowerCase().includes(q);
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q) || false;
      const matchBrand = item.brand.name.toLowerCase().includes(q);
      if (!matchSN && !matchCode && !matchName && !matchDesc && !matchBrand) return false;
    }

    // Category filter
    if (selectedCategory && item.categoryId !== selectedCategory) return false;

    // Location filter
    if (selectedLocation && item.locationId !== selectedLocation) return false;

    // Status filter
    if (selectedStatus && item.status !== selectedStatus) return false;

    return true;
  });

  // Group items by Category + Brand + Name (unifying all SN units of the same model)
  const groupedStockMap = new Map<string, GroupedStock>();
  filteredItems.forEach((item) => {
    const key = `${item.categoryId}_${item.brandId}_${item.name.toLowerCase().trim()}`;
    if (!groupedStockMap.has(key)) {
      groupedStockMap.set(key, {
        key,
        name: item.name,
        categoryId: item.categoryId,
        brandId: item.brandId,
        locationId: item.locationId,
        type: item.type,
        category: item.category,
        brand: item.brand,
        location: item.location,
        totalStock: 0,
        availableStock: 0,
        items: [],
      });
    }
    const group = groupedStockMap.get(key)!;
    group.totalStock += 1;
    if (item.status === 'TERSEDIA') {
      group.availableStock += 1;
    }
    group.items.push(item);
  });

  const groupedStockList = Array.from(groupedStockMap.values());

  const toggleGroupExpand = (key: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSuccess = (msg?: string) => {
    setSuccessMsg(msg || 'Data berhasil disimpan!');
    router.refresh();
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteItem(deleteTarget.id);
      setDeleteTarget(null);
      setSuccessMsg(`Unit SN ${deleteTarget.sn} berhasil dihapus dari sistem.`);
      router.refresh();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'TERSEDIA':
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            TERSEDIA
          </span>
        );
      case 'TERPAKAI':
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400">
            TERPAKAI
          </span>
        );
      case 'DIPINJAM':
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400">
            DIPINJAM
          </span>
        );
      case 'RUSAK':
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400">
            RUSAK
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Inventaris Stok IT (SN)</h1>
          <p className="text-xs text-slate-400">
            Kelola stok otomatis per Kategori, Merk, & Lokasi Storage berbasis Unit Serial Number (SN)
          </p>
        </div>

        <Link
          href="/items/new"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-600/25 transition flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Unit (SN Baru)</span>
        </Link>
      </div>

      {/* Tabs & Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        {/* Type Tabs & View Switcher */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-3 gap-3">
          <div className="flex space-x-2">
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

          {/* Mode Switcher Buttons */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-stretch sm:self-auto justify-center space-x-1">
            <button
              type="button"
              onClick={() => setViewMode('GROUPED')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                viewMode === 'GROUPED'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Stok Agregasi (Kategori/Merk/Lokasi)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('FLAT_SN')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                viewMode === 'FLAT_SN'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Semua Unit SN</span>
            </button>
          </div>
        </div>

        {/* Search & Select Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari SN, SKU, nama, merk..."
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

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="">Semua Status Unit</option>
              <option value="TERSEDIA">TERSEDIA (Available)</option>
              <option value="TERPAKAI">TERPAKAI (In Use)</option>
              <option value="DIPINJAM">DIPINJAM (On Loan)</option>
              <option value="RUSAK">RUSAK (Damaged)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grouped Stock View Table */}
      {viewMode === 'GROUPED' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 w-10"></th>
                  <th className="p-4">Nama Barang / Model</th>
                  <th className="p-4 whitespace-nowrap">Tipe</th>
                  <th className="p-4 whitespace-nowrap">Kategori & Brand</th>
                  <th className="p-4 whitespace-nowrap">Lokasi Storage</th>
                  <th className="p-4 text-center whitespace-nowrap">Total Stok Unit (SN)</th>
                  <th className="p-4 text-right whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {groupedStockList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-500 text-sm">
                      Tidak ada data stok yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  groupedStockList.map((group) => {
                    const isExpanded = !!expandedGroups[group.key];
                    const isDevice = group.type === 'DEVICE';

                    return (
                      <Fragment key={group.key}>
                        <tr
                          onClick={() => toggleGroupExpand(group.key)}
                          className="hover:bg-slate-800/40 transition cursor-pointer select-none"
                        >
                          <td className="p-4 text-slate-500 w-10">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-blue-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </td>

                          {/* Model Name */}
                          <td className="p-4">
                            <div className="font-semibold text-slate-100 text-sm flex items-center space-x-2">
                              <span>{group.name}</span>
                            </div>
                          </td>

                          {/* Type */}
                          <td className="p-4 whitespace-nowrap">
                            <span
                              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                                isDevice
                                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                  : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                              }`}
                            >
                              {group.type}
                            </span>
                          </td>

                          {/* Category & Brand */}
                          <td className="p-4 whitespace-nowrap">
                            <div className="text-xs font-medium text-slate-200">
                              {group.category.name}
                            </div>
                            <div className="text-[11px] text-slate-400">{group.brand.name}</div>
                          </td>

                          {/* Location */}
                          <td className="p-4 whitespace-nowrap">
                            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700 font-medium">
                              {group.location.name}
                            </span>
                          </td>

                          {/* Total Stock Count Badge */}
                          <td className="p-4 text-center whitespace-nowrap">
                            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-950 text-slate-100 border border-slate-700 font-mono text-sm font-bold shadow-inner">
                              <span className="text-blue-400">{group.totalStock}</span>
                              <span
                                className={`text-[10px] font-sans whitespace-nowrap ${
                                  group.availableStock === 0 ? 'text-rose-400 font-semibold' : 'text-slate-400'
                                }`}
                              >
                                ({group.availableStock} Tersedia)
                              </span>
                            </div>
                          </td>

                          {/* Action Buttons */}
                          <td className="p-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end space-x-2">
                              {/* + Tambah SN Button for specific product */}
                              <Link
                                href={`/items/new?name=${encodeURIComponent(group.name)}&categoryId=${group.categoryId}&brandId=${group.brandId}&locationId=${group.locationId}`}
                                className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold rounded-lg transition flex items-center space-x-1 whitespace-nowrap shadow"
                                title={`Tambah unit SN baru untuk ${group.name}`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah SN</span>
                              </Link>

                              <button
                                onClick={() => toggleGroupExpand(group.key)}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition flex items-center space-x-1 whitespace-nowrap"
                              >
                                <QrCode className="w-3.5 h-3.5 text-blue-400" />
                                <span>{isExpanded ? 'Sembunyikan SN' : `Lihat ${group.totalStock} SN`}</span>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Serial Numbers Nested Row */}
                        {isExpanded && (
                          <tr className="bg-slate-950/60">
                            <td colSpan={7} className="p-4 border-t border-slate-800/80">
                              <div className="space-y-3 pl-6 pr-2">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                                  <span className="flex items-center space-x-1.5 text-blue-400">
                                    <QrCode className="w-4 h-4" />
                                    <span>Daftar Serial Number Unit ({group.items.length} Registered SN)</span>
                                  </span>

                                  {/* Direct + Tambah SN Produk Ini button inside expanded header */}
                                  <button
                                    onClick={() =>
                                      handleOpenAddModal({
                                        name: group.name,
                                        categoryId: group.categoryId,
                                        brandId: group.brandId,
                                        locationId: group.locationId,
                                      })
                                    }
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1 shadow"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>+ Tambah Unit SN ({group.name})</span>
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {group.items.map((item) => (
                                    <div
                                      key={item.id}
                                      className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg space-y-2 relative group shadow transition"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs font-bold text-slate-100 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                          SN: {item.serialNumber}
                                        </span>
                                        {getStatusBadge(item.status)}
                                      </div>

                                      <div className="text-xs text-slate-400 flex items-center justify-between font-mono">
                                        <span>SKU: {item.itemCode}</span>
                                        <span className="text-[10px] text-slate-500">
                                          {new Date(item.createdAt).toLocaleDateString('id-ID')}
                                        </span>
                                      </div>

                                      {item.description && (
                                        <p className="text-[11px] text-slate-400 truncate border-t border-slate-800/60 pt-1.5">
                                          {item.description}
                                        </p>
                                      )}

                                      {/* SN Action Buttons */}
                                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                                        <div className="flex items-center space-x-1">
                                          {/* Serah Terima Barang IT - Active only if status is TERSEDIA */}
                                          {item.status === 'TERSEDIA' ? (
                                            <button
                                              title="Serah Terima Barang IT"
                                              onClick={() => {
                                                setHandoverItem({
                                                  id: item.id,
                                                  serialNumber: item.serialNumber,
                                                  itemCode: item.itemCode,
                                                  name: item.name,
                                                  categoryName: group.category.name,
                                                  brandName: group.brand.name,
                                                  locationName: group.location.name,
                                                });
                                                setIsHandoverModalOpen(true);
                                              }}
                                              className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 text-[11px] font-semibold transition flex items-center space-x-1 cursor-pointer shadow-sm"
                                            >
                                              <Send className="w-3 h-3 text-blue-400" />
                                              <span>Serah</span>
                                            </button>
                                          ) : (
                                            <span className="text-[10px] font-medium text-slate-500 italic px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                                              {item.status === 'TERPAKAI'
                                                ? 'Sudah Diserahkan'
                                                : item.status === 'DIPINJAM'
                                                ? 'Sedang Dipinjam'
                                                : 'Unit Rusak'}
                                            </span>
                                          )}

                                          {/* Stock Opname / Audit Status */}
                                          <button
                                            title="Audit Status Unit"
                                            onClick={() => {
                                              setOpnameItem(item);
                                              setIsOpnameModalOpen(true);
                                            }}
                                            className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded border border-amber-500/30 text-[11px] font-medium transition flex items-center space-x-1"
                                          >
                                            <ClipboardCheck className="w-3 h-3" />
                                            <span>Audit</span>
                                          </button>
                                        </div>

                                        <div className="flex items-center space-x-1">
                                          {/* Edit Modal trigger - Opens ItemModal directly without needing Enter or page reload */}
                                          <button
                                            onClick={() => handleOpenEditModal(item)}
                                            title="Edit SN Unit"
                                            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
                                          >
                                            <Pencil className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            title="Hapus Unit SN"
                                            onClick={() =>
                                              setDeleteTarget({
                                                id: item.id,
                                                name: item.name,
                                                sn: item.serialNumber,
                                              })
                                            }
                                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Flat Serial Number Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 whitespace-nowrap">Serial Number (SN)</th>
                  <th className="p-4 whitespace-nowrap">Kode SKU & Model</th>
                  <th className="p-4 whitespace-nowrap">Kategori & Brand</th>
                  <th className="p-4 whitespace-nowrap">Lokasi Storage</th>
                  <th className="p-4 text-center whitespace-nowrap">Status Unit</th>
                  <th className="p-4 text-right whitespace-nowrap">Aksi Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500 text-sm">
                      Tidak ada Serial Number (SN) yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      {/* Serial Number */}
                      <td className="p-4 font-mono font-bold text-slate-100 whitespace-nowrap">
                        <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                          {item.serialNumber}
                        </span>
                      </td>

                      {/* Item Code & Model Name */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-100">{item.name}</div>
                        <div className="text-xs font-mono text-blue-400">SKU: {item.itemCode}</div>
                      </td>

                      {/* Category & Brand */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="text-xs font-medium text-slate-200">
                          {item.category.name} ({item.type})
                        </div>
                        <div className="text-[11px] text-slate-400">{item.brand.name}</div>
                      </td>

                      {/* Location */}
                      <td className="p-4 whitespace-nowrap">
                        <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
                          {item.location.name}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          {item.status === 'TERSEDIA' ? (
                            <button
                              title="Serah Terima Barang IT"
                              onClick={() => {
                                setHandoverItem({
                                  id: item.id,
                                  serialNumber: item.serialNumber,
                                  itemCode: item.itemCode,
                                  name: item.name,
                                  categoryName: item.category.name,
                                  brandName: item.brand.name,
                                  locationName: item.location.name,
                                });
                                setIsHandoverModalOpen(true);
                              }}
                              className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded border border-blue-500/20 transition cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                              {item.status === 'TERPAKAI'
                                ? 'Diserahkan'
                                : item.status === 'DIPINJAM'
                                ? 'Dipinjam'
                                : 'Rusak'}
                            </span>
                          )}

                          <button
                            title="Audit Status"
                            onClick={() => {
                              setOpnameItem(item);
                              setIsOpnameModalOpen(true);
                            }}
                            className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded border border-amber-500/20 transition"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Item via Modal */}
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit SN Unit"
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title="Hapus Unit SN"
                            onClick={() =>
                              setDeleteTarget({
                                id: item.id,
                                name: item.name,
                                sn: item.serialNumber,
                              })
                            }
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* Handover (Serah Terima) Modal */}
      <HandoverModal
        isOpen={isHandoverModalOpen}
        onClose={() => setIsHandoverModalOpen(false)}
        targetItem={handoverItem}
        onSuccess={handleSuccess}
      />

      {/* Stock Opname Status Audit Modal */}
      <StockOpnameModal
        isOpen={isOpnameModalOpen}
        onClose={() => setIsOpnameModalOpen(false)}
        item={opnameItem}
        locations={locations}
        onSuccess={handleSuccess}
      />

      {/* Quick Mutate Location Modal */}
      <QuickMutateModal
        isOpen={isMutateModalOpen}
        onClose={() => setIsMutateModalOpen(false)}
        item={mutateItem}
        locations={locations}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Hapus Unit Serial Number (SN)"
        itemName={deleteTarget ? `${deleteTarget.name} (SN: ${deleteTarget.sn})` : ''}
        itemType="unit SN"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={!!successMsg}
        message={successMsg}
        onClose={() => setSuccessMsg('')}
      />
    </div>
  );
}
