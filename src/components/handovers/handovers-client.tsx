'use client';

import { useState, Fragment } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Search,
  Printer,
  Trash2,
  UserCheck,
  User,
  ChevronDown,
  ChevronRight,
  Package,
  Calendar,
  Plus,
} from 'lucide-react';
import { deleteHandover } from '@/app/actions/handovers';
import { DeleteConfirmModal } from '@/components/ui/delete-confirm-modal';
import { SuccessModal } from '@/components/ui/success-modal';

type HandoverItem = {
  id: string;
  deviceName: string;
  serialNo: string;
  brandName: string;
  recipient: string;
  remarks: string | null;
};

type HandoverDocument = {
  id: string;
  documentNo: string;
  locationName: string;
  giverName: string;
  recipientName: string;
  remarks: string | null;
  handoverDate: Date | string;
  items: HandoverItem[];
  createdAt: Date | string;
};

type HandoversClientProps = {
  initialHandovers: HandoverDocument[];
};

export function HandoversClient({ initialHandovers }: HandoversClientProps) {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [expandedDocs, setExpandedDocs] = useState<Record<string, boolean>>({});
  const [deleteTarget, setDeleteTarget] = useState<HandoverDocument | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const filteredHandovers = initialHandovers.filter((doc) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const matchDocNo = doc.documentNo.toLowerCase().includes(q);
    const matchGiver = doc.giverName.toLowerCase().includes(q);
    const matchRecipient = doc.recipientName.toLowerCase().includes(q);
    const matchRemarks = doc.remarks?.toLowerCase().includes(q) || false;
    const matchItems = doc.items.some(
      (i) =>
        i.deviceName.toLowerCase().includes(q) ||
        i.serialNo.toLowerCase().includes(q) ||
        i.brandName.toLowerCase().includes(q)
    );
    return matchDocNo || matchGiver || matchRecipient || matchRemarks || matchItems;
  });

  const toggleExpand = (id: string) => {
    setExpandedDocs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteHandover(deleteTarget.id);
      setDeleteTarget(null);
      setSuccessMsg(`Dokumen "${deleteTarget.documentNo}" berhasil dihapus.`);
      router.refresh();
    }
  };

  const totalItemsHandedOver = initialHandovers.reduce((acc, d) => acc + d.items.length, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center space-x-2.5">
            <FileText className="w-6 h-6 text-blue-400" />
            <span>Surat Serah Terima Barang IT</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Riwayat arsip dan cetak dokumen resmi Form Serah Terima Barang IT (PTK Shore Base Tanjung Batu)
          </p>
        </div>

        <Link
          href="/items"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-600/25 transition flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Serah Terima Baru</span>
        </Link>
      </div>

      {/* Search & Statistics Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari No. Dokumen, Penerima (PIC), Penyerah, atau SN..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono self-end sm:self-auto">
          <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            Dokumen: <strong className="text-blue-400">{filteredHandovers.length}</strong>
          </span>
          <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            Total Unit Diserahkan: <strong className="text-emerald-400">{totalItemsHandedOver}</strong>
          </span>
        </div>
      </div>

      {/* Main Documents Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4 w-10"></th>
                <th className="p-4">No. Dokumen & Tanggal</th>
                <th className="p-4">Diberikan Oleh (Officer)</th>
                <th className="p-4">Penerima (PIC)</th>
                <th className="p-4">Remarks / Peruntukan</th>
                <th className="p-4 text-center">Jumlah Barang</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredHandovers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 text-sm">
                    {search ? 'Tidak ada surat serah terima yang sesuai pencarian.' : 'Belum ada dokumen serah terima yang dibuat.'}
                  </td>
                </tr>
              ) : (
                filteredHandovers.map((doc) => {
                  const isExpanded = !!expandedDocs[doc.id];
                  const formattedDate = new Date(doc.handoverDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <Fragment key={doc.id}>
                      <tr
                        onClick={() => toggleExpand(doc.id)}
                        className="hover:bg-slate-800/40 transition cursor-pointer select-none"
                      >
                        <td className="p-4 text-slate-500 w-10">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-blue-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </td>

                        {/* Document No & Date */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="font-mono text-xs font-bold text-blue-400 bg-blue-950 px-2.5 py-1 rounded border border-blue-800/60 inline-block mb-1">
                            {doc.documentNo}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>{formattedDate}</span>
                          </div>
                        </td>

                        {/* Giver Officer */}
                        <td className="p-4 whitespace-nowrap font-medium text-slate-200">
                          <div className="flex items-center space-x-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                            <span>{doc.giverName}</span>
                          </div>
                        </td>

                        {/* Recipient PIC */}
                        <td className="p-4 whitespace-nowrap font-semibold text-slate-100">
                          <div className="flex items-center space-x-1.5">
                            <User className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{doc.recipientName}</span>
                          </div>
                        </td>

                        {/* Remarks */}
                        <td className="p-4 text-xs text-slate-300 max-w-xs truncate">
                          {doc.remarks || '-'}
                        </td>

                        {/* Items Count Badge */}
                        <td className="p-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-950 text-slate-200 border border-slate-800">
                            <Package className="w-3.5 h-3.5 text-blue-400" />
                            <span>{doc.items.length} Perangkat</span>
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="p-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/handovers/${doc.id}/print`}
                              className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold rounded-lg transition flex items-center space-x-1 shadow"
                              title="Lihat / Cetak PDF"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Cetak PDF</span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(doc)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition border border-slate-800 hover:border-rose-500/30"
                              title="Hapus Dokumen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Sub-Table for Handed Over Items */}
                      {isExpanded && (
                        <tr className="bg-slate-950/60 border-b border-slate-800">
                          <td colSpan={7} className="p-4 pl-12">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-inner">
                              <div className="text-xs font-semibold text-slate-300 flex items-center justify-between border-b border-slate-800 pb-2">
                                <span>Rincian Barang yang Diserahkan pada {doc.documentNo}:</span>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  Lokasi Dokumen: {doc.locationName}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {doc.items.map((item, idx) => (
                                  <div
                                    key={item.id || idx}
                                    className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5 text-xs"
                                  >
                                    <div className="font-bold text-slate-100 flex items-center justify-between">
                                      <span>{item.deviceName}</span>
                                      <span className="text-[10px] text-slate-400 font-normal">#{idx + 1}</span>
                                    </div>
                                    <div className="font-mono text-blue-400 font-semibold text-[11px]">
                                      SN: {item.serialNo}
                                    </div>
                                    <div className="text-slate-400 text-[11px] flex justify-between">
                                      <span>Merk: <strong className="text-slate-300">{item.brandName}</strong></span>
                                      <span>PIC: <strong className="text-slate-300">{item.recipient}</strong></span>
                                    </div>
                                    {item.remarks && (
                                      <div className="text-[10px] text-slate-500 border-t border-slate-800/80 pt-1">
                                        Catatan: {item.remarks}
                                      </div>
                                    )}
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Hapus Surat Serah Terima"
        itemName={deleteTarget ? `Dokumen No. ${deleteTarget.documentNo} (Penerima: ${deleteTarget.recipientName})` : ''}
        itemType="dokumen serah terima"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Success Notification Modal */}
      <SuccessModal
        isOpen={!!successMsg}
        message={successMsg}
        onClose={() => setSuccessMsg('')}
      />
    </div>
  );
}
