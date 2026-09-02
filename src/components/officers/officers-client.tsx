'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, UserCheck, Pencil, Trash2, ShieldCheck } from 'lucide-react';
import { deleteOfficer } from '@/app/actions/officers';
import { OfficerModal } from './officer-modal';
import { DeleteConfirmModal } from '@/components/ui/delete-confirm-modal';
import { SuccessModal } from '@/components/ui/success-modal';
import { useRouter, useSearchParams } from 'next/navigation';

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
  const searchParams = useSearchParams();
  const actionParam = searchParams.get('action');

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editOfficer, setEditOfficer] = useState<OfficerType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OfficerType | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (actionParam === 'new') {
      setEditOfficer(null);
      setIsModalOpen(true);
    }
  }, [actionParam]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (actionParam) {
      window.history.replaceState(null, '', '/officers');
    }
  };

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
    handleCloseModal();
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center space-x-2.5">
            <UserCheck className="w-6 h-6 text-[#b90051]" />
            <span>Petugas (Giver)</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Kelola daftar petugas penyerah barang IT yang tercantum pada dokumen Form Serah Terima.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-[#b90051] hover:bg-[#a00045] text-white font-semibold rounded-xl text-sm shadow-md shadow-[#b90051]/20 transition flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Petugas Baru</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama petugas atau jabatan..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#b90051] transition"
          />
        </div>
        <span className="text-xs text-gray-500 font-mono">
          Total: <strong className="text-gray-900 font-bold">{filteredOfficers.length}</strong> Petugas
        </span>
      </div>

      {/* Officers List Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#b90051] text-white text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Nama Petugas (Giver)</th>
                <th className="py-3.5 px-4">Jabatan / Role</th>
                <th className="py-3.5 px-4">Status Hak Akses</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOfficers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-400 text-sm">
                    Tidak ada petugas yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredOfficers.map((officer) => (
                  <tr key={officer.id} className="hover:bg-[#fff5f8] transition">
                    <td className="py-4 px-4 font-semibold text-gray-900 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#fae2ea] text-[#b90051] font-bold text-xs flex items-center justify-center shrink-0">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <span>{officer.name}</span>
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-600 font-medium">
                      {officer.role || 'IT Staff'}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Penyerah Resmi</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(officer)}
                          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                          title="Edit Petugas"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(officer)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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
        onClose={handleCloseModal}
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
