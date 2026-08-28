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
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#fae2ea] border border-[#f5b8cc] text-[#b90051]">
            TERSEDIA
          </span>
        );
      case 'TERPAKAI':
        return (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-700">
            TERPAKAI
          </span>
        );
      case 'DIPINJAM':
        return (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700">
            DIPINJAM
          </span>
        );
      case 'RUSAK':
        return (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700">
            RUSAK
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inventaris Stok Ruangan IT</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Kelola stok per Kategori, Merk, & Lokasi Storage
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <Link
            href="/handovers/new"
            className="px-4 py-2.5 bg-[#fad2df] hover:bg-[#f8c0d3] text-[#b90051] font-semibold rounded-xl text-xs sm:text-sm transition flex items-center space-x-2 cursor-pointer shadow-sm"
          >
            <Send className="w-4 h-4 text-[#b90051]" />
            <span>Form Serah Terima (PDF)</span>
          </Link>

          <Link
            href="/items/new"
            className="px-4 py-2.5 bg-[#b90051] hover:bg-[#a00045] text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md shadow-[#b90051]/20 transition flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Unit</span>
          </Link>
        </div>
      </div>

      {/* Tabs & Filters Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
        {/* Type Tabs & View Switcher */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'ALL'
                  ? 'bg-[#b90051] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>SEMUA INVENTARIS</span>
            </button>

            <button
              onClick={() => setActiveTab('DEVICE')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'DEVICE'
                  ? 'bg-[#b90051] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>PERANGKAT (DEVICE)</span>
            </button>

            <button
              onClick={() => setActiveTab('BARANG')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'BARANG'
                  ? 'bg-[#b90051] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>COMSUMABLES (BARANG)</span>
            </button>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex bg-gray-100 p-1 rounded-xl self-stretch sm:self-auto justify-center space-x-1">
            <button
              type="button"
              onClick={() => setViewMode('GROUPED')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                viewMode === 'GROUPED'
                  ? 'bg-[#b90051] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Stok (Kategori/Merk/Lokasi)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('FLAT_SN')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                viewMode === 'FLAT_SN'
                  ? 'bg-[#b90051] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
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
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari SN, SKU, nama, merk..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#b90051] focus:ring-1 focus:ring-[#b90051]"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#b90051]"
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
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#b90051]"
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
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#b90051]"
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
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#b90051] text-white text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 pl-4 pr-2 w-10"></th>
                  <th className="py-3.5 px-4">Nama Barang / Model</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Tipe</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Kategori & Brand</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Lokasi Storage</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">Total Stok Unit (SN)</th>
                  <th className="py-3.5 pr-4 pl-2 text-right whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {groupedStockList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-400 text-sm">
                      Tidak ada data stok yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  groupedStockList.map((group) => {
                    const isExpanded = !!expandedGroups[group.key];

                    return (
                      <Fragment key={group.key}>
                        <tr
                          onClick={() => toggleGroupExpand(group.key)}
                          className="hover:bg-[#fff5f8] transition cursor-pointer select-none"
                        >
                          <td className="py-4 pl-4 pr-2 text-gray-400 w-10">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-[#b90051]" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </td>

                          {/* Model Name */}
                          <td className="py-4 px-4">
                            <div className="font-bold text-gray-900 text-sm">
                              {group.name}
                            </div>
                          </td>

                          {/* Type */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#fae2ea] border border-[#f5b8cc] text-[#b90051] uppercase">
                              {group.type}
                            </span>
                          </td>

                          {/* Category & Brand */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="text-xs font-semibold text-gray-900">
                              {group.category.name}
                            </div>
                            <div className="text-[11px] text-blue-600 font-medium">{group.brand.name}</div>
                          </td>

                          {/* Location */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="text-xs bg-[#fae2ea] text-gray-700 px-3 py-1 rounded-lg border border-[#e8b5c4] font-medium">
                              {group.location.name}
                            </span>
                          </td>

                          {/* Total Stock Count Badge */}
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#fae2ea] text-[#b90051] border border-[#f5b8cc] font-mono text-xs font-bold">
                              <span>{group.totalStock}</span>
                              <span
                                className={`font-sans font-semibold ${
                                  group.availableStock === 0 ? 'text-rose-600' : 'text-[#b90051]'
                                }`}
                              >
                                ({group.availableStock > 0 ? `${group.availableStock} Tersedia` : 'Tidak Tersedia'})
                              </span>
                            </div>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-4 pr-4 pl-2 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end space-x-2">
                              {/* + Tambah SN Button for specific product */}
                              <Link
                                href={`/items/new?name=${encodeURIComponent(group.name)}&categoryId=${group.categoryId}&brandId=${group.brandId}&locationId=${group.locationId}`}
                                className="px-3 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition flex items-center space-x-1 whitespace-nowrap shadow-sm"
                                title={`Tambah unit SN baru untuk ${group.name}`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah SN</span>
                              </Link>

                              <button
                                onClick={() => toggleGroupExpand(group.key)}
                                className="px-3 py-1.5 bg-[#b90051] hover:bg-[#a00045] text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1 whitespace-nowrap shadow-sm"
                              >
                                <span>{isExpanded ? 'Tutup' : 'Lihat'}</span>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Serial Numbers Nested Row */}
                        {isExpanded && (
                          <tr className="bg-[#fafbfc]">
                            <td colSpan={7} className="p-4 sm:p-5 border-t border-gray-200">
                              <div className="space-y-3 pl-4 pr-2">
                                <div className="flex items-center justify-between text-xs font-bold text-gray-600 uppercase tracking-wider">
                                  <span className="flex items-center space-x-1.5 text-[#b90051]">
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
                                    className="px-3 py-1 bg-[#b90051] hover:bg-[#a00045] text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1 shadow-sm"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>+ Tambah Unit SN ({group.name})</span>
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                                  {group.items.map((item) => (
                                    <div
                                      key={item.id}
                                      className="p-3.5 bg-white border border-gray-200 hover:border-[#f5b8cc] rounded-xl space-y-2 relative group shadow-sm transition"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                          SN: {item.serialNumber}
                                        </span>
                                        {getStatusBadge(item.status)}
                                      </div>

                                      <div className="text-xs text-gray-500 flex items-center justify-between font-mono">
                                        <span>SKU: <strong className="text-blue-600">{item.itemCode}</strong></span>
                                        <span className="text-[10px] text-gray-400">
                                          {new Date(item.createdAt).toLocaleDateString('id-ID')}
                                        </span>
                                      </div>

                                      {item.description && (
                                        <p className="text-[11px] text-gray-500 truncate border-t border-gray-100 pt-1.5">
                                          {item.description}
                                        </p>
                                      )}

                                      {/* SN Action Buttons */}
                                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center space-x-1.5">
                                          {/* Serah Terima Barang IT */}
                                          {item.status === 'TERSEDIA' ? (
                                            <Link
                                              href={`/handovers/new?itemId=${item.id}`}
                                              title="Serah Terima Barang IT"
                                              className="px-2.5 py-1 bg-[#fae2ea] hover:bg-[#f8c0d3] text-[#b90051] rounded-lg border border-[#f5b8cc] text-[11px] font-semibold transition flex items-center space-x-1 cursor-pointer shadow-sm"
                                            >
                                              <Send className="w-3 h-3 text-[#b90051]" />
                                              <span>Serah</span>
                                            </Link>
                                          ) : (
                                            <span className="text-[10px] font-medium text-gray-400 italic px-2 py-0.5 rounded bg-gray-50 border border-gray-200">
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
                                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200 text-[11px] font-medium transition flex items-center space-x-1"
                                          >
                                            <ClipboardCheck className="w-3 h-3" />
                                            <span>Audit</span>
                                          </button>
                                        </div>

                                        <div className="flex items-center space-x-1">
                                          <button
                                            onClick={() => handleOpenEditModal(item)}
                                            title="Edit SN Unit"
                                            className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition"
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
                                            className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
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
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#b90051] text-white text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 whitespace-nowrap">Serial Number (SN)</th>
                  <th className="p-4 whitespace-nowrap">Kode SKU & Model</th>
                  <th className="p-4 whitespace-nowrap">Kategori & Brand</th>
                  <th className="p-4 whitespace-nowrap">Lokasi Storage</th>
                  <th className="p-4 text-center whitespace-nowrap">Status Unit</th>
                  <th className="p-4 text-right whitespace-nowrap">Aksi Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-400 text-sm">
                      Tidak ada Serial Number (SN) yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#fff5f8] transition">
                      {/* Serial Number */}
                      <td className="p-4 font-mono font-bold text-gray-900 whitespace-nowrap">
                        <span className="bg-gray-100 px-2.5 py-1 rounded border border-gray-200">
                          {item.serialNumber}
                        </span>
                      </td>

                      {/* Item Code & Model Name */}
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">{item.name}</div>
                        <div className="text-xs font-mono text-blue-600 font-medium">SKU: {item.itemCode}</div>
                      </td>

                      {/* Category & Brand */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="text-xs font-medium text-gray-900">
                          {item.category.name} ({item.type})
                        </div>
                        <div className="text-[11px] text-gray-500">{item.brand.name}</div>
                      </td>

                      {/* Location */}
                      <td className="p-4 whitespace-nowrap">
                        <span className="text-xs bg-[#fae2ea] text-gray-700 px-2.5 py-1 rounded border border-[#e8b5c4]">
                          {item.location.name}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          {item.status === 'TERSEDIA' ? (
                            <Link
                              href={`/handovers/new?itemId=${item.id}`}
                              title="Serah Terima Barang IT"
                              className="p-1.5 text-[#b90051] hover:bg-[#fae2ea] rounded-lg border border-[#f5b8cc] transition cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </Link>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic font-mono px-2 py-0.5 rounded bg-gray-50 border border-gray-200">
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
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg border border-amber-200 transition"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Item via Modal */}
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit SN Unit"
                            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition"
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
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
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
        allItems={initialItems}
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
