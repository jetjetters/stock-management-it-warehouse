'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownRight, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { MutationType } from '@prisma/client';
import { useRouter } from 'next/navigation';

type LogType = {
  id: string;
  mutation: number;
  type: MutationType;
  notes: string;
  createdAt: Date | string;
  item: {
    itemCode: string;
    name: string;
    category: { name: string };
  };
  location: {
    name: string;
  };
};

type LogsClientProps = {
  initialLogs: LogType[];
  locations: { id: string; name: string }[];
};

const ITEMS_PER_PAGE = 10;

export function LogsClient({ initialLogs, locations }: LogsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredLogs = useMemo(() => {
    return initialLogs.filter((log) => {
      if (search) {
        const q = search.toLowerCase();
        const matchCode = log.item.itemCode.toLowerCase().includes(q);
        const matchName = log.item.name.toLowerCase().includes(q);
        const matchNotes = log.notes.toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchNotes) return false;
      }

      if (selectedLocation && log.location.name !== selectedLocation) return false;

      if (selectedType !== 'ALL' && log.type !== selectedType) return false;

      return true;
    });
  }, [initialLogs, search, selectedLocation, selectedType]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);

  const paginatedLogs = useMemo(() => {
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    return filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLogs, validPage]);

  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleLocationChange = (val: string) => {
    setSelectedLocation(val);
    setCurrentPage(1);
  };

  const handleTypeChange = (val: string) => {
    setSelectedType(val);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Audit Trail (Log)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Jejak historis tidak terbatas untuk semua penambahan, pengurangan, dan penyesuaian stok
          </p>
        </div>

        <button
          onClick={() => router.refresh()}
          className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-xs transition flex items-center space-x-1.5 border border-gray-200 shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#b90051]" />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari kode SKU, barang, aktivitas..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#b90051] focus:ring-1 focus:ring-[#b90051]"
          />
        </div>

        {/* Location Select */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={selectedLocation}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#b90051]"
          >
            <option value="">Semua Lokasi Storage</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type Select */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#b90051]"
          >
            <option value="ALL">Semua Jenis Mutasi (IN / OUT / ADJUSTMENT)</option>
            <option value="IN">Stok Masuk (IN)</option>
            <option value="OUT">Stok Keluar (OUT)</option>
            <option value="ADJUSTMENT">Koreksi Opname (ADJUSTMENT)</option>
          </select>
        </div>
      </div>

      {/* Audit Log Card Feed */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-[#b90051] text-white flex items-center justify-between text-xs font-bold uppercase tracking-wider">
          <span>Riwayat Mutasi & Audit Trail</span>
          <div className="flex items-center space-x-2 font-mono text-white/90">
            <span>{filteredLogs.length} Catatan Ditemukan</span>
            {filteredLogs.length > ITEMS_PER_PAGE && (
              <span className="text-white/80">
                (Hal {validPage}/{totalPages})
              </span>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              Tidak ada log mutasi yang cocok dengan filter.
            </div>
          ) : (
            paginatedLogs.map((log) => {
              const d = new Date(log.createdAt);
              const dateStr = d.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              });
              const timeStr = d.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              });

              const isPositive = log.mutation > 0;

              return (
                <div
                  key={log.id}
                  className="p-4 hover:bg-[#fff5f8] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start space-x-3.5">
                    <div
                      className={`p-2 rounded-xl border mt-0.5 shrink-0 ${
                        isPositive
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          : 'bg-rose-50 border-rose-200 text-rose-600'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-gray-900 flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-xs text-gray-400 font-normal">
                          {dateStr}:
                        </span>
                        <span className="font-mono text-xs font-bold text-[#b90051] bg-[#fae2ea] px-2 py-0.5 rounded border border-[#f5b8cc]">
                          {log.item.itemCode}
                        </span>
                        <span className="text-gray-900 font-bold">{log.item.name}</span>
                        <span className="text-gray-400 text-xs">dari</span>
                        <span className="text-xs font-semibold text-[#b90051] bg-[#fae2ea] px-2.5 py-0.5 rounded-md border border-[#f5b8cc]">
                          {log.location.name}
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 flex items-center space-x-2">
                        <span>Keterangan: <strong className="text-gray-700 font-semibold">{log.notes}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                    <span
                      className={`font-mono text-base font-bold ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      ({isPositive ? `+${log.mutation}` : log.mutation})
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">Pukul {timeStr}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Footer */}
        {filteredLogs.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-gray-500">
              Menampilkan{' '}
              <span className="font-semibold text-gray-900">
                {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredLogs.length)}
              </span>{' '}
              dari{' '}
              <span className="font-semibold text-gray-900">{filteredLogs.length}</span>{' '}
              catatan
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={validPage <= 1}
                className="p-2 rounded-xl bg-white hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed border border-gray-200 text-gray-700 transition flex items-center justify-center cursor-pointer shadow-sm"
                title="Halaman Sebelumnya"
                aria-label="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-mono text-xs flex items-center space-x-1 shadow-sm">
                <span className="font-bold text-[#b90051]">{validPage}</span>
                <span className="text-gray-400">/</span>
                <span>{totalPages}</span>
              </div>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={validPage >= totalPages}
                className="p-2 rounded-xl bg-white hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed border border-gray-200 text-gray-700 transition flex items-center justify-center cursor-pointer shadow-sm"
                title="Halaman Selanjutnya"
                aria-label="Halaman Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
