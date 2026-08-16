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
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Audit Trail — Log Mutasi & Opname
          </h1>
          <p className="text-xs text-slate-400">
            Jejak historis tidak terbatas untuk semua penambahan, pengurangan, dan penyesuaian stok
          </p>
        </div>

        <button
          onClick={() => router.refresh()}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition flex items-center space-x-1.5 border border-slate-700 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari kode SKU, barang, aktivitas..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Location Select */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={selectedLocation}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
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
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Semua Jenis Mutasi (IN / OUT / ADJUSTMENT)</option>
            <option value="IN">Stok Masuk (IN)</option>
            <option value="OUT">Stok Keluar (OUT)</option>
            <option value="ADJUSTMENT">Koreksi Opname (ADJUSTMENT)</option>
          </select>
        </div>
      </div>

      {/* Audit Log Card Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>Formatted Audit Trail Feed</span>
          <div className="flex items-center space-x-2 font-mono">
            <span>{filteredLogs.length} Catatan Ditemukan</span>
            {filteredLogs.length > ITEMS_PER_PAGE && (
              <span className="text-slate-500">
                (Halaman {validPage} dari {totalPages})
              </span>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
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
                  className="p-4 hover:bg-slate-800/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start space-x-3.5">
                    <div
                      className={`p-2 rounded-lg border mt-0.5 shrink-0 ${
                        isPositive
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-1">
                      {/* Formatted Audit String as specified in Product Context:
                          DD-MM-YYYY: [Kode Item] dari [Lokasi] [Aktivitas/Keterangan] ([+|-][Jumlah])
                      */}
                      <div className="text-sm font-semibold text-slate-100 flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-xs text-slate-400 font-normal">
                          {dateStr}:
                        </span>
                        <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                          {log.item.itemCode}
                        </span>
                        <span className="text-slate-300">({log.item.name})</span>
                        <span className="text-slate-400 text-xs">dari</span>
                        <span className="text-xs font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                          {log.location.name}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 flex items-center space-x-2">
                        <span>Aktivitas: <strong className="text-slate-200">{log.notes}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                    <span
                      className={`font-mono text-base font-bold ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      ({isPositive ? `+${log.mutation}` : log.mutation})
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">Pukul {timeStr}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Footer */}
        {filteredLogs.length > 0 && (
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-400">
              Menampilkan{' '}
              <span className="font-semibold text-slate-200">
                {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredLogs.length)}
              </span>{' '}
              dari{' '}
              <span className="font-semibold text-slate-200">{filteredLogs.length}</span>{' '}
              catatan
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={validPage <= 1}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 disabled:cursor-not-allowed border border-slate-700 text-slate-200 transition flex items-center justify-center cursor-pointer"
                title="Halaman Sebelumnya"
                aria-label="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs flex items-center space-x-1">
                <span className="font-bold text-blue-400">{validPage}</span>
                <span className="text-slate-500">/</span>
                <span>{totalPages}</span>
              </div>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={validPage >= totalPages}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 disabled:cursor-not-allowed border border-slate-700 text-slate-200 transition flex items-center justify-center cursor-pointer"
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
