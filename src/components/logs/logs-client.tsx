'use client';

import { useState } from 'react';
import { Search, Filter, History, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
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

export function LogsClient({ initialLogs, locations }: LogsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const filteredLogs = initialLogs.filter((log) => {
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
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition flex items-center space-x-1.5 border border-slate-700"
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode SKU, barang, aktivitas..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Location Select */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
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
            onChange={(e) => setSelectedType(e.target.value)}
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
          <span className="font-mono">{filteredLogs.length} Catatan Ditemukan</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              Tidak ada log mutasi yang cocok dengan filter.
            </div>
          ) : (
            filteredLogs.map((log) => {
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
      </div>
    </div>
  );
}
