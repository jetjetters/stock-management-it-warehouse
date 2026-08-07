'use client';

import { useState } from 'react';
import { Plus, Search, UserCheck, Pencil, Trash2, ShieldCheck } from 'lucide-react';
import { deleteOfficer } from '@/app/actions/officers';
import { OfficerModal } from './officer-modal';
import { DeleteConfirmModal } from '@/components/ui/delete-confirm-modal';
import { SuccessModal } from '@/components/ui/success-modal';
import { useRouter } from 'next/navigation';

type OfficerType = {
  id: string;
  name: string;
  role?: string | null;
  createdAt: Date | string;
};

type OfficersClientProps = {
  initialOfficers: OfficerType[];
};

export function OfficersClient({ initialOfficers }: OfficersClientProps) {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editOfficer, setEditOfficer] = useState<OfficerType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OfficerType | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const filteredOfficers = initialOfficers.filter((off) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return off.name.toLowerCase().includes(q) || (off.role && off.role.toLowerCase().includes(q));
  });

  const handleOpenAddModal = () => {
    setEditOfficer(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (officer: OfficerType) => {
    setEditOfficer(officer);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteOfficer(deleteTarget.id);
      setDeleteTarget(null);
      setSuccessMsg(`Petugas "${deleteTarget.name}" telah dihapus.`);
      router.refresh();
    }
  };

  const handleSuccess = (msg?: string) => {
    setSuccessMsg(msg || 'Data petugas berhasil disimpan!');
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center space-x-2.5">
            <UserCheck className="w-6 h-6 text-blue-400" />
            <span>Manajemen Petugas (Diberikan Oleh)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Kelola daftar petugas penyerah barang IT yang tercantum pada dokumen Form Serah Terima.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-600/25 transition flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Petugas Baru</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama petugas atau jabatan..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Total: <strong className="text-slate-100">{filteredOfficers.length}</strong> Petugas
        </span>
      </div>

      {/* Officers List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Nama Petugas (Giver)</th>
                <th className="p-4">Jabatan / Role</th>
                <th className="p-4">Status Hak Akses</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredOfficers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-500 text-sm">
                    Tidak ada petugas yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredOfficers.map((officer) => (
                  <tr key={officer.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-semibold text-slate-100 flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <span>{officer.name}</span>
                    </td>
                    <td className="p-4 text-xs text-slate-300">
                      {officer.role || 'IT Staff'}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Penyerah Resmi</span>
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(officer)}
                          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
                          title="Edit Petugas"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(officer)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          title="Hapus Petugas"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modals */}
      <OfficerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editOfficer={editOfficer}
        onSuccess={handleSuccess}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Hapus Petugas (Diberikan Oleh)"
        itemName={deleteTarget?.name || ''}
        itemType="petugas"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      <SuccessModal
        isOpen={!!successMsg}
        message={successMsg}
        onClose={() => setSuccessMsg('')}
      />
    </div>
  );
}
