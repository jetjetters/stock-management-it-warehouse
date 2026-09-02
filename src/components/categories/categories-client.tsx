'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Tags,
  Pencil,
  Trash2,
  ChevronDown,
  Package,
  ArrowRight,
  Search,
  Filter,
  Monitor,
  Boxes,
  RotateCcw,
} from 'lucide-react';
import { deleteCategory } from '@/app/actions/master-data';
import { CategoryModal } from '@/components/categories/category-modal';
import { DeleteConfirmModal } from '@/components/ui/delete-confirm-modal';
import { SuccessModal } from '@/components/ui/success-modal';
import type { ItemCategoryType } from '@/app/actions/items';
import { useRouter, useSearchParams } from 'next/navigation';

type ItemSummary = {
  id: string;
  name: string;
  itemCode: string;
  serialNumber: string;
  status: string;
  ownershipStatus?: string | null;
  brand?: { name: string };
  location?: { name: string };
};

type CategoryType = {
  id: string;
  name: string;
  type: ItemCategoryType;
  codePrefix: string;
  items?: ItemSummary[];
  _count: { items: number };
};

type CategoriesClientProps = {
  initialCategories: CategoryType[];
};

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actionParam = searchParams.get('action');

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'DEVICE' | 'BARANG'>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'HAS_ITEMS' | 'EMPTY'>('ALL');

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<CategoryType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown-container]')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (actionParam === 'new') {
      setEditCategory(null);
      setIsModalOpen(true);
    }
  }, [actionParam]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (actionParam) {
      window.history.replaceState(null, '', '/categories');
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
      setSuccessMsg('Kategori master telah berhasil dihapus.');
      router.refresh();
    }
  };

  const handleSuccess = (msg?: string) => {
    setSuccessMsg(msg || 'Data berhasil disimpan!');
    handleCloseModal();
    router.refresh();
  };

  // Filter categories
  const filteredCategories = initialCategories.filter((cat) => {
    // Type Filter
    if (typeFilter !== 'ALL' && cat.type !== typeFilter) return false;

    // Stock Filter
    if (stockFilter === 'HAS_ITEMS' && cat._count.items === 0) return false;
    if (stockFilter === 'EMPTY' && cat._count.items > 0) return false;

    // Search Query (Category Name, SKU Prefix, or items inside)
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchName = cat.name.toLowerCase().includes(q);
      const matchPrefix = cat.codePrefix.toLowerCase().includes(q);
      const matchItems = cat.items?.some((i) => i.name.toLowerCase().includes(q) || i.serialNumber.toLowerCase().includes(q));
      if (!matchName && !matchPrefix && !matchItems) return false;
    }

    return true;
  });

  const isFilterActive = search !== '' || typeFilter !== 'ALL' || stockFilter !== 'ALL';

  const resetFilters = () => {
    setSearch('');
    setTypeFilter('ALL');
    setStockFilter('ALL');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kategori</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Kelola klasifikasi jenis barang (Device vs Consumable) dan inisial kode SKU
          </p>
        </div>

        <Link
          href="/categories/new"
          className="px-4 py-2.5 bg-[#b90051] hover:bg-[#a00045] text-white font-semibold rounded-xl text-sm shadow-md shadow-[#b90051]/20 transition flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori Baru</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama kategori, prefix SKU (MOS, PRN), atau barang..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#b90051] focus:ring-1 focus:ring-[#b90051] transition"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#b90051] transition font-medium"
            >
              <option value="ALL">Semua Tipe (Device & Barang)</option>
              <option value="DEVICE">DEVICE (Aset Perangkat)</option>
              <option value="BARANG">BARANG (Consumables)</option>
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#b90051] transition font-medium"
            >
              <option value="ALL">Semua Status Stok</option>
              <option value="HAS_ITEMS">Memiliki Barang Tersimpan (&gt;0)</option>
              <option value="EMPTY">Belum Ada Barang (0 item)</option>
            </select>
          </div>
        </div>

        {/* Filter Stats & Reset */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
          <div>
            Menampilkan <strong className="text-gray-900 font-bold">{filteredCategories.length}</strong> dari{' '}
            <strong className="text-gray-900 font-bold">{initialCategories.length}</strong> kategori
          </div>

          {isFilterActive && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center space-x-1.5 text-[#b90051] hover:underline font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Cards Grid */}
      {filteredCategories.length === 0 ? (
        <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#fae2ea] text-[#b90051] flex items-center justify-center mx-auto">
            <Tags className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">Tidak ada kategori yang sesuai</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Coba gunakan kata kunci pencarian yang lain atau reset filter yang sedang aktif.
          </p>
          {isFilterActive && (
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 bg-[#fae2ea] hover:bg-[#fad2df] text-[#b90051] text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filteredCategories.map((category) => {
            const isOpen = openDropdownId === category.id;
            const itemsList = category.items || [];
            const previewItems = itemsList.slice(0, 5);

            return (
              <div
                key={category.id}
                className={`bg-[#fce7ee] border border-[#f5b8cc] rounded-2xl p-5 space-y-4 shadow-sm hover:shadow transition flex flex-col justify-between relative ${
                  isOpen ? 'z-30 ring-2 ring-[#b90051]/30 shadow-md' : 'z-10'
                }`}
              >
                {/* Card Top Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#f5b8cc]/60 text-[#b90051] flex items-center justify-center shrink-0">
                        <Tags className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">{category.name}</h3>
                        <span className="font-mono text-xs text-[#b90051] font-bold block mt-0.5">
                          Stock Keeping Unit : [{category.codePrefix}]
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditCategory(category);
                          setIsModalOpen(true);
                        }}
                        title="Edit Kategori"
                        className="p-1.5 text-[#b90051] hover:text-[#8a003b] hover:bg-[#f5b8cc]/40 rounded-lg transition cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: category.id, name: category.name })}
                        title="Hapus Kategori"
                        className="p-1.5 text-[#b90051] hover:text-[#8a003b] hover:bg-[#f5b8cc]/40 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Classification & Total Count */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#f0a8bf]/70 text-xs">
                    <span className="font-bold px-3 py-0.5 rounded-full bg-[#f0a8bf] text-[#8a003b] text-[11px] tracking-wide uppercase">
                      {category.type}
                    </span>

                    <span className="text-gray-600 text-xs">
                      Total <strong className="text-gray-900 font-bold">{category._count.items}</strong> Item SKU
                    </span>
                  </div>
                </div>

                {/* Floating Dropdown Section */}
                <div className="pt-2 relative" data-dropdown-container>
                  <button
                    type="button"
                    onClick={() => setOpenDropdownId(isOpen ? null : category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 border rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isOpen
                        ? 'bg-white border-[#b90051] text-[#b90051] shadow-xs'
                        : 'bg-white/70 hover:bg-white border-[#f5b8cc] text-gray-700'
                    }`}
                  >
                    <span className="flex items-center space-x-1.5">
                      <Package className="w-3.5 h-3.5 text-[#b90051]" />
                      <span>Daftar Barang ({category._count.items})</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#b90051] transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Absolute Floating Menu with internal scroll */}
                  {isOpen && (
                    <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-white border-2 border-[#f5b8cc] rounded-2xl shadow-xl p-3.5 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-700 border-b border-gray-100 pb-1.5">
                        <span>Rincian Barang (Maks. 5 item)</span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {Math.min(previewItems.length, 5)} dari {category._count.items}
                        </span>
                      </div>

                      {previewItems.length > 0 ? (
                        <div className="space-y-2">
                          {/* Scrollable list inside dropdown */}
                          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                            {previewItems.map((item) => (
                              <div
                                key={item.id}
                                className="p-2 bg-gray-50/80 hover:bg-white rounded-lg border border-gray-200 text-xs space-y-0.5 shadow-2xs hover:border-[#f5b8cc] transition"
                              >
                                <div className="flex items-center justify-between">
                                  <span
                                    className="font-bold text-gray-900 truncate max-w-[150px]"
                                    title={item.name}
                                  >
                                    {item.name}
                                  </span>
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                                      item.status === 'TERSEDIA'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                    }`}
                                  >
                                    {item.status}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                                  <span>SKU: {item.itemCode}</span>
                                  <span className="text-[#b90051] font-semibold">SN: {item.serialNumber}</span>
                                </div>
                                {(item.brand?.name || item.location?.name) && (
                                  <div className="flex items-center justify-between text-[9.5px] text-gray-400 pt-0.5 border-t border-gray-100">
                                    <span>{item.brand?.name || '-'}</span>
                                    <span>📍 {item.location?.name || '-'}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Button Lihat Lebih Banyak */}
                          <Link
                            href={`/items?categoryId=${category.id}`}
                            className="w-full py-2 px-3 bg-[#b90051] hover:bg-[#a00045] text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm shadow-[#b90051]/20 cursor-pointer text-center"
                          >
                            <span>Lihat Lebih Banyak ({category._count.items} Barang)</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-center space-y-1.5">
                          <p className="text-[11px] text-gray-500">Belum ada barang di kategori ini.</p>
                          <Link
                            href={`/items/new?categoryId=${category.id}`}
                            className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#b90051] hover:underline"
                          >
                            <Plus className="w-3 h-3" />
                            <span>+ Tambah Unit Pertama</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editCategory={editCategory}
        onSuccess={handleSuccess}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Kategori Master"
        itemName={deleteTarget?.name || ''}
        itemType="kategori"
        onConfirm={handleConfirmDelete}
      />

      <SuccessModal
        isOpen={!!successMsg}
        onClose={() => setSuccessMsg('')}
        message={successMsg}
      />
    </div>
  );
}
