import Link from 'next/link';
import { prisma } from '@/lib/db';
import {
  Boxes,
  Monitor,
  Package,
  AlertTriangle,
  XCircle,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ArrowRight,
  BellRing,
  ExternalLink,
} from 'lucide-react';

export const revalidate = 0;

export default async function DashboardPage() {
  const [
    totalItems,
    devicesCount,
    barangCount,
    lowStockCount,
    zeroStockCount,
    recentLogs,
    attentionItems,
  ] = await Promise.all([
    prisma.item.count(),
    prisma.item.count({ where: { type: 'DEVICE' } }),
    prisma.item.count({ where: { type: 'BARANG' } }),
    prisma.item.count({ where: { currentStock: { gt: 0, lte: 5 } } }),
    prisma.item.count({ where: { currentStock: 0 } }),
    prisma.stockLog.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        item: { include: { category: true } },
        location: true,
      },
    }),
    prisma.item.findMany({
      where: { currentStock: { lte: 5 } },
      take: 5,
      orderBy: { currentStock: 'asc' },
      include: {
        category: true,
        location: true,
        brand: true,
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
            Sistem pengawasan inventaris perangkat IT dan bahan habis pakai. Dilengkapi mutasi stok *real-time*, otomatisasi SKU, pengingat restock, serta jejak audit lengkap.
          </p>
        </div>
      </div>

      {/* Analytics Metric Cards (5 Grid Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Item */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total SKU Item
            </span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-100">{totalItems}</span>
            <span className="text-[11px] text-slate-500">Terdaftar</span>
          </div>
        </div>

        {/* Devices */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
              Perangkat (Devices)
            </span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Monitor className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-blue-400">{devicesCount}</span>
            <span className="text-[11px] text-slate-500">Aset IT</span>
          </div>
        </div>

        {/* Consumables */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
              Habis Pakai (Barang)
            </span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-purple-400">{barangCount}</span>
            <span className="text-[11px] text-slate-500">Consumables</span>
          </div>
        </div>

        {/* Low Stock Warning (Amber) */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
              Stok Menipis (1-5)
            </span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-400">{lowStockCount}</span>
            <span className="text-[11px] text-slate-400">Reorder</span>
          </div>
        </div>

        {/* Zero Stock Alert (Red Card) */}
        <div className="bg-slate-900 border border-rose-500/40 rounded-xl p-4 space-y-3 shadow-xl bg-rose-950/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
              Stok Kosong (0)
            </span>
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-rose-400">{zeroStockCount}</span>
            <span className="text-[11px] font-semibold text-rose-400/90">Habis Total</span>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
          <span>Tindakan & Pengawasan</span>
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

      {/* Reminder Panel & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reminder & Restock Attention Panel (Left 1 col on large screens) */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-xl overflow-hidden shadow-xl lg:col-span-1 flex flex-col">
          <div className="p-4 bg-amber-950/20 border-b border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Pengingat Stok & Reorder</h3>
                <p className="text-[11px] text-slate-400">Daftar item perlu tindakan segera</p>
              </div>
            </div>
            <Link
              href="/items"
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center space-x-1 font-semibold"
            >
              <span>Inventaris</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80 flex-1">
            {attentionItems.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                Semua stok barang dalam kondisi aman (&gt;5 unit).
              </div>
            ) : (
              attentionItems.map((item: any) => {
                const isZero = item.currentStock === 0;

                return (
                  <div
                    key={item.id}
                    className="p-3.5 hover:bg-slate-800/40 transition flex items-center justify-between"
                  >
                    <div className="space-y-1 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[11px] font-bold text-blue-400">
                          {item.itemCode}
                        </span>
                        <span className="text-xs font-semibold text-slate-200 truncate max-w-[140px]">
                          {item.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                        <span>{item.category.name}</span>
                        <span>•</span>
                        <span className="text-slate-500">{item.location.name}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold font-mono border ${
                          isZero
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {isZero ? '0 UNIT (HABIS)' : `${item.currentStock} Unit`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Stock Audit Feed (Right 2 cols on large screens) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl lg:col-span-2 flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
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

          <div className="divide-y divide-slate-800/80 flex-1">
            {recentLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                Belum ada riwayat mutasi stok recorded.
              </div>
            ) : (
              recentLogs.map((log: any) => {
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
    </div>
  );
}
