'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Layers,
  Pencil,
  Trash2,
  ChevronDown,
  Package,
  ArrowRight,
  Search,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { deleteBrand } from '@/app/actions/master-data';
import { BrandModal } from '@/components/brands/brand-modal';
import { DeleteConfirmModal } from '@/components/ui/delete-confirm-modal';
import { SuccessModal } from '@/components/ui/success-modal';
import { useRouter, useSearchParams } from 'next/navigation';

type ItemSummary = {
  id: string;
  name: string;
  itemCode: string;
  serialNumber: string;
  status: string;
  ownershipStatus?: string | null;
  location?: { name: string };
};

type BrandType = {
  id: string;
  name: string;
  categoryId: string;
  category: { name: string };
  items?: ItemSummary[];
  _count: { items: number };
};

type BrandsClientProps = {
  initialBrands: BrandType[];
  categories: any[];
};

export function BrandsClient({ initialBrands, categories }: BrandsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actionParam = searchParams.get('action');

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'HAS_ITEMS' | 'EMPTY'>('ALL');

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editBrand, setEditBrand] = useState<BrandType | null>(null);
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
      setEditBrand(null);
      setIsModalOpen(true);
    }
  }, [actionParam]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (actionParam) {
      window.history.replaceState(null, '', '/brands');
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteBrand(deleteTarget.id);
      setDeleteTarget(null);
      setSuccessMsg('Merk / brand telah berhasil dihapus.');
      router.refresh();
    }
  };

  const handleSuccess = (msg?: string) => {
    setSuccessMsg(msg || 'Data berhasil disimpan!');
    handleCloseModal();
    router.refresh();
  };

  // Filter brands
  const filteredBrands = initialBrands.filter((brand) => {
    // Category Filter
    if (selectedCategory && brand.categoryId !== selectedCategory) return false;

    // Stock Filter
    if (stockFilter === 'HAS_ITEMS' && brand._count.items === 0) return false;
    if (stockFilter === 'EMPTY' && brand._count.items > 0) return false;

    // Search Query (Brand Name, Category Name, or items inside)
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchBrand = brand.name.toLowerCase().includes(q);
      const matchCategory = brand.category.name.toLowerCase().includes(q);
      const matchItems = brand.items?.some((i) => i.name.toLowerCase().includes(q) || i.serialNumber.toLowerCase().includes(q));
      if (!matchBrand && !matchCategory && !matchItems) return false;
    }

    return true;
  });

  const isFilterActive = search !== '' || selectedCategory !== '' || stockFilter !== 'ALL';

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setStockFilter('ALL');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Merk / Brand</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Daftar produsen & merk terintegrasi dengan kategori barang
          </p>
        </div>

        <Link
          href="/brands/new"
          className="px-4 py-2.5 bg-[#b90051] hover:bg-[#a00045] text-white font-semibold rounded-xl text-sm shadow-md shadow-[#b90051]/20 transition flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Merk Baru</span>
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
              placeholder="Cari merk (Logitech, Dell, Epson), kategori, atau barang..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#b90051] focus:ring-1 focus:ring-[#b90051] transition"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#b90051] transition font-medium"
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
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
              <option value="HAS_ITEMS">Memiliki Barang (&gt;0)</option>
              <option value="EMPTY">Belum Ada Barang (0 item)</option>
            </select>
          </div>
        </div>

        {/* Filter Stats & Reset */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
          <div>
            Menampilkan <strong className="text-gray-900 font-bold">{filteredBrands.length}</strong> dari{' '}
            <strong className="text-gray-900 font-bold">{initialBrands.length}</strong> merk/brand
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

      {/* Brands Cards Grid */}
      {filteredBrands.length === 0 ? (
        <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#fae2ea] text-[#b90051] flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">Tidak ada merk yang sesuai</h3>
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredBrands.map((brand) => {
            const isOpen = openDropdownId === brand.id;
            const itemsList = brand.items || [];
            const previewItems = itemsList.slice(0, 5);

            return (
              <div
                key={brand.id}
                className={`bg-[#fce7ee] border border-[#f5b8cc] rounded-2xl p-5 space-y-3 shadow-sm hover:shadow transition flex flex-col justify-between relative ${
                  isOpen ? 'z-30 ring-2 ring-[#b90051]/30 shadow-md' : 'z-10'
                }`}
              >
                {/* Card Top Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-[#f5b8cc]/60 text-[#b90051] flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{brand.name}</h3>
                        <span className="text-xs text-[#b90051] font-semibold block">{brand.category.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditBrand(brand);
                          setIsModalOpen(true);
                        }}
                        title="Edit Merk"
                        className="p-1.5 text-[#b90051] hover:text-[#8a003b] hover:bg-[#f5b8cc]/40 rounded-lg transition cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: brand.id, name: brand.name })}
                        title="Hapus Merk"
                        className="p-1.5 text-[#b90051] hover:text-[#8a003b] hover:bg-[#f5b8cc]/40 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-[#f0a8bf]/70 text-[11px] text-gray-600 flex justify-between items-center">
                    <span>Digunakan oleh:</span>
                    <strong className="text-gray-900 font-mono font-bold">{brand._count.items} Barang</strong>
                  </div>
                </div>

                {/* Floating Dropdown Section */}
                <div className="pt-2 relative" data-dropdown-container>
                  <button
                    type="button"
                    onClick={() => setOpenDropdownId(isOpen ? null : brand.id)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 border rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isOpen
                        ? 'bg-white border-[#b90051] text-[#b90051] shadow-xs'
                        : 'bg-white/70 hover:bg-white border-[#f5b8cc] text-gray-700'
                    }`}
                  >
                    <span className="flex items-center space-x-1.5">
                      <Package className="w-3.5 h-3.5 text-[#b90051]" />
                      <span>Daftar Barang ({brand._count.items})</span>
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
                          {Math.min(previewItems.length, 5)} dari {brand._count.items}
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
                                    className="font-bold text-gray-900 truncate max-w-[130px]"
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
                                {item.location?.name && (
                                  <div className="text-[9.5px] text-gray-400 pt-0.5 border-t border-gray-50">
                                    <span>📍 {item.location.name}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Button Lihat Lebih Banyak */}
                          <Link
                            href={`/items?brandId=${brand.id}`}
                            className="w-full py-2 px-3 bg-[#b90051] hover:bg-[#a00045] text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm shadow-[#b90051]/20 cursor-pointer text-center"
                          >
                            <span>Lihat Lebih Banyak ({brand._count.items} Barang)</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-center space-y-1.5">
                          <p className="text-[11px] text-gray-500">Belum ada barang dengan merk ini.</p>
                          <Link
                            href={`/items/new?brandId=${brand.id}&categoryId=${brand.categoryId}`}
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

      <BrandModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        categories={categories}
        editBrand={editBrand}
        onSuccess={handleSuccess}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Merk / Brand"
        itemName={deleteTarget?.name || ''}
        itemType="merk/brand"
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
