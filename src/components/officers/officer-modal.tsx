'use client';

import { useState, useEffect } from 'react';
import { X, UserCheck, CheckCircle2 } from 'lucide-react';
import { createOfficer, updateOfficer } from '@/app/actions/officers';

type OfficerItem = {
  id: string;
  name: string;
  role?: string | null;
};

type OfficerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  editOfficer?: OfficerItem | null;
  onSuccess: (msg?: string) => void;
};

export function OfficerModal({
  isOpen,
  onClose,
  editOfficer,
  onSuccess,
}: OfficerModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('IT Officer / Penanggung Jawab');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editOfficer) {
      setName(editOfficer.name);
      setRole(editOfficer.role || 'IT Officer / Penanggung Jawab');
    } else {
      setName('');
      setRole('IT Officer / Penanggung Jawab');
    }
    setError('');
  }, [editOfficer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editOfficer) {
        await updateOfficer(editOfficer.id, { name, role });
        onSuccess(`Petugas "${name}" berhasil diperbarui.`);
      } else {
        await createOfficer({ name, role });
        onSuccess(`Petugas baru "${name}" berhasil ditambahkan.`);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data petugas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {editOfficer ? 'Edit Petugas (Diberikan Oleh)' : 'Tambah Petugas Baru'}
              </h2>
              <p className="text-xs text-slate-400">Petugas penyerah dokumen Serah Terima IT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Nama Lengkap Petugas <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Robby Nainggolan / Muhammad Zosel Ridho Putra"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Jabatan / Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Contoh: IT Support / Penanggung Jawab"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-medium hover:bg-slate-700 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Data</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
