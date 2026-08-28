import Link from 'next/link';
import { prisma } from '@/lib/db';
import {
  Boxes,
  Monitor,
  Package,
  CheckCircle2,
  AlertTriangle,
  History,
  Plus,
  ArrowRight,
  Bell,
  ExternalLink,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  Wrench,
} from 'lucide-react';

export const revalidate = 0;

function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Baru saja';
  if (diffMinutes < 60) return `${diffMinutes} mnt lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 30) return `${diffDays} hari lalu`;
  return past.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export default async function DashboardPage() {
  const [
    totalSNUnits,
    devicesCount,
    barangCount,
    availableCount,
    inUseCount,
    damagedCount,
    recentLogs,
    recentUnits,
  ] = await Promise.all([
    prisma.item.count(),
    prisma.item.count({ where: { type: 'DEVICE' } }),
    prisma.item.count({ where: { type: 'BARANG' } }),
    prisma.item.count({ where: { status: 'TERSEDIA' } }),
    prisma.item.count({ where: { status: { in: ['TERPAKAI', 'DIPINJAM'] } } }),
    prisma.item.count({ where: { status: 'RUSAK' } }),
    prisma.stockLog.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        item: { include: { category: true } },
        location: true,
      },
    }),
    prisma.item.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        location: true,
        brand: true,
      },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Banner with Pertamina Crimson / Rose Gradient */}
      <div className="bg-gradient-to-r from-[#d84d7d] via-[#bd245a] to-[#a80e4b] rounded-3xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            IT Warehouse Management & Stock Taking
          </h1>
          <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-2xl">
            Sistem pengawasan inventaris berbasis Serial Number (SN). Pengelompokan stok otomatis per Kategori, Merk, dan Lokasi dengan mutasi real-time & audit trail lengkap.
          </p>
        </div>
      </div>

      {/* 5 Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* TOTAL ASET */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              TOTAL ASET
            </span>
            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Monitor className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold text-gray-900 font-mono">{totalSNUnits.toLocaleString()}</div>
            <div className="text-xs text-gray-400 flex items-center space-x-1">
              <span className="text-emerald-600 font-medium">↗ Terdaftar</span>
              <span>di gudang</span>
            </div>
          </div>
        </div>

        {/* ASET TERSEDIA (Featured Solid Magenta Card) */}
        <div className="bg-[#b90051] text-white border border-[#a00045] rounded-2xl p-5 space-y-3 shadow-md shadow-[#b90051]/20 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider">
              ASET TERSEDIA
            </span>
            <div className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold text-white font-mono">{availableCount.toLocaleString()}</div>
            <div className="text-xs text-white/90">Siap di ruang IT</div>
          </div>
        </div>

        {/* ASET DIPAKAI */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              ASET DIPAKAI
            </span>
            <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold text-gray-900 font-mono">{inUseCount.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Dipinjam Oleh Karyawan</div>
          </div>
        </div>

        {/* ASET RUSAK */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              ASET RUSAK
            </span>
            <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold text-gray-900 font-mono">{damagedCount.toLocaleString()}</div>
            <div className="text-xs text-rose-500 font-medium">Menunggu Perbaikan</div>
          </div>
        </div>

        {/* HABIS PAKAI (BARANG) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              HABIS PAKAI (BARANG)
            </span>
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold text-gray-900 font-mono">{barangCount.toLocaleString()}</div>
            <div className="text-xs text-emerald-600 font-medium">Consumables</div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="flex items-center justify-end space-x-3 pt-2">
        <Link
          href="/items"
          className="px-4 py-2.5 bg-[#b90051] hover:bg-[#a00045] text-white text-sm font-semibold rounded-xl shadow-sm shadow-[#b90051]/20 transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Kelola Inventaris SN</span>
        </Link>
        <Link
          href="/logs"
          className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-semibold rounded-xl transition flex items-center space-x-2 shadow-sm"
        >
          <History className="w-4 h-4 text-[#b90051]" />
          <span>History</span>
        </Link>
      </div>

      {/* Bottom Grid: 2 Columns (Terbaru & Aktivitas Terakhir) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: "Terbaru" Card (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {/* Header Bar Solid Magenta */}
          <div className="p-4 bg-[#b90051] text-white flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-white/20 rounded-lg text-white">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Terbaru</h3>
                <p className="text-[11px] text-white/80">Daftar unit terdaftar terbaru</p>
              </div>
            </div>
            <Link
              href="/items"
              className="text-xs font-semibold text-white/90 hover:text-white flex items-center space-x-1 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition"
            >
              <span>Semua</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* List of Recent Items */}
          <div className="divide-y divide-gray-100 flex-1 p-2">
            {recentUnits.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                Belum ada unit Serial Number terdaftar.
              </div>
            ) : (
              recentUnits.map((item: any) => {
                return (
                  <div
                    key={item.id}
                    className="p-3 hover:bg-gray-50 rounded-xl transition flex items-center justify-between gap-2"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-blue-600 shrink-0">
                          {item.itemCode}
                        </span>
                        <span className="text-xs font-semibold text-gray-900 truncate">
                          {item.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center space-x-1.5 font-mono truncate">
                        <span className="text-gray-700 font-semibold">SN: {item.serialNumber}</span>
                        <span>•</span>
                        <span className="text-gray-400">{item.location?.name || '-'}</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono bg-[#fae2ea] border border-[#f5b8cc] text-[#b90051]">
                        {item.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: "Aktivitas Terakhir" Card (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-base">Aktivitas Terakhir</h3>
            <Link
              href="/logs"
              className="text-xs font-semibold text-[#b90051] bg-[#fae2ea] hover:bg-[#f8c0d3] px-3.5 py-1.5 rounded-full transition flex items-center space-x-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 pr-4">ACTIVITY</th>
                  <th className="pb-3 px-4">ACTION</th>
                  <th className="pb-3 px-4">ASSET</th>
                  <th className="pb-3 pl-4 text-right">TIME</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400 text-xs">
                      Belum ada riwayat mutasi recorded.
                    </td>
                  </tr>
                ) : (
                  recentLogs.map((log: any) => {
                    const isPositive = log.mutation > 0;
                    const isDamage = log.type === 'ADJUSTMENT' && log.notes?.toLowerCase().includes('rusak');

                    // Determine activity label (Pencatatan / Serah / etc.)
                    const activityName = log.notes?.toLowerCase().startsWith('serah')
                      ? 'Serah'
                      : log.notes?.toLowerCase().startsWith('pencatatan') || log.notes?.toLowerCase().startsWith('registrasi')
                      ? 'Pencatatan'
                      : log.notes?.split(' ')[0] || 'Pencatatan';

                    const relativeTime = formatRelativeTime(log.createdAt);

                    return (
                      <tr key={log.id} className="hover:bg-gray-50 transition">
                        {/* ACTIVITY */}
                        <td className="py-3.5 pr-4 whitespace-nowrap">
                          <span className="font-semibold text-xs text-gray-900">
                            {activityName}
                          </span>
                        </td>

                        {/* ACTION */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isDamage ? (
                            <span className="inline-flex items-center space-x-1 text-xs font-semibold text-rose-600">
                              <Wrench className="w-3.5 h-3.5" />
                              <span>Melaporkan Rusak</span>
                            </span>
                          ) : isPositive ? (
                            <span className="inline-flex items-center space-x-1 text-xs font-semibold text-gray-600">
                              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Mengembalikan</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-xs font-semibold text-[#b90051]">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              <span>Meminjam</span>
                            </span>
                          )}
                        </td>

                        {/* ASSET */}
                        <td className="py-3.5 px-4">
                          <div className="text-xs font-medium text-gray-800 max-w-[180px] truncate">
                            {log.item.name}
                          </div>
                        </td>

                        {/* TIME */}
                        <td className="py-3.5 pl-4 text-right whitespace-nowrap text-xs text-gray-400">
                          {relativeTime}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

