import Link from 'next/link';
import { prisma } from '@/lib/db';
import { ItemCategoryType, MutationType } from '@prisma/client';
import {
  Boxes,
  Monitor,
  Package,
  AlertTriangle,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ArrowRight,
} from 'lucide-react';

export const revalidate = 0;

export default async function DashboardPage() {
  const [totalItems, devicesCount, barangCount, lowStockCount, recentLogs] = await Promise.all([
    prisma.item.count(),
    prisma.item.count({ where: { type: ItemCategoryType.DEVICE } }),
    prisma.item.count({ where: { type: ItemCategoryType.BARANG } }),
    prisma.item.count({ where: { currentStock: { lte: 5 } } }),
    prisma.stockLog.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        item: { include: { category: true } },
        location: true,
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <span>Control Center & Stock Audit</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            IT Warehouse Management & Stock Taking
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Sistem pengawasan inventaris perangkat IT dan bahan habis pakai. Dilengkapi mutasi stok *real-time*, otomatisasi SKU, serta jejak audit lengkap (*Audit Trail*).
          </p>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Total Item */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total SKU Item
            </span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-slate-100">{totalItems}</span>
            <span className="text-xs text-slate-400">Barang terdaftar</span>
          </div>
        </div>

        {/* Devices */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Perangkat (Devices)
            </span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Monitor className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-blue-400">{devicesCount}</span>
            <span className="text-xs text-slate-400">Aset fisik IT</span>
          </div>
        </div>

        {/* Consumables */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
              Habis Pakai (Barang)
            </span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-purple-400">{barangCount}</span>
            <span className="text-xs text-slate-400">Consumables</span>
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Stok Menipis (≤5)
            </span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-amber-400">{lowStockCount}</span>
            <span className="text-xs text-slate-400">Perlu reorder</span>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
          <span>Tindakan Cepat</span>
        </h2>
        <div className="flex space-x-3">
          <Link
            href="/items"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-600/20 transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Kelola Inventaris</span>
          </Link>
          <Link
            href="/logs"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition flex items-center space-x-2"
          >
            <History className="w-4 h-4 text-blue-400" />
            <span>Jejak Audit</span>
          </Link>
        </div>
      </div>

      {/* Recent Stock Audit Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-slate-200 text-base">Riwayat Mutasi Stok Terbaru</h3>
          </div>
          <Link
            href="/logs"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
          >
            <span>Lihat Semua Audit Trail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-800/80">
          {recentLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Belum ada riwayat mutasi stok recorded.
            </div>
          ) : (
            recentLogs.map((log) => {
              const formattedDate = new Date(log.createdAt).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              const isPositive = log.mutation > 0;

              return (
                <div
                  key={log.id}
                  className="p-4 hover:bg-slate-800/40 transition flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-lg border ${
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
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-blue-400">
                          {log.item.itemCode}
                        </span>
                        <span className="text-xs font-semibold text-slate-300">
                          {log.item.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {log.location.name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{log.notes}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-mono text-sm font-bold ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? `+${log.mutation}` : log.mutation}
                    </span>
                    <div className="text-[11px] text-slate-500">{formattedDate}</div>
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
