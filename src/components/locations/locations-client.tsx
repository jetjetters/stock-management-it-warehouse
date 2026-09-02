'use client';

import { useState, useEffect } from 'react';
import { Plus, MapPin, Pencil, Trash2 } from 'lucide-react';
import { deleteLocation } from '@/app/actions/master-data';
import { LocationModal } from '@/components/locations/location-modal';
import { DeleteConfirmModal } from '@/components/ui/delete-confirm-modal';
import { SuccessModal } from '@/components/ui/success-modal';
import { useRouter, useSearchParams } from 'next/navigation';

type LocationType = {
  id: string;
  name: string;
  description?: string | null;
  _count: { items: number; stockLogs: number };
};

type LocationsClientProps = {
  initialLocations: LocationType[];
};

export function LocationsClient({ initialLocations }: LocationsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actionParam = searchParams.get('action');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editLocation, setEditLocation] = useState<LocationType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (actionParam === 'new') {
      setEditLocation(null);
      setIsModalOpen(true);
    }
  }, [actionParam]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (actionParam) {
      window.history.replaceState(null, '', '/locations');
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteLocation(deleteTarget.id);
      setDeleteTarget(null);
      setSuccessMsg('Lokasi storage telah berhasil dihapus.');
      router.refresh();
    }
  };

  const handleSuccess = (msg?: string) => {
    setSuccessMsg(msg || 'Data berhasil disimpan!');
    handleCloseModal();
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Lokasi Storage</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Daftar pos area penyimpanan inventaris IT dan lokasi pergerakan barang
          </p>
        </div>

        <button
          onClick={() => {
            setEditLocation(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-[#b90051] hover:bg-[#a00045] text-white font-semibold rounded-xl text-sm shadow-md shadow-[#b90051]/20 transition flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Lokasi Baru</span>
        </button>
      </div>

      {/* Locations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {initialLocations.map((loc) => (
          <div
            key={loc.id}
            className="bg-[#fce7ee] border border-[#f5b8cc] rounded-2xl p-5 space-y-3 shadow-sm hover:shadow transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#f5b8cc]/60 text-[#b90051] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{loc.name}</h3>
                  {loc.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{loc.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setEditLocation(loc);
                    setIsModalOpen(true);
                  }}
                  title="Edit Lokasi"
                  className="p-1.5 text-[#b90051] hover:text-[#8a003b] hover:bg-[#f5b8cc]/40 rounded-lg transition"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: loc.id, name: loc.name })}
                  title="Hapus Lokasi"
                  className="p-1.5 text-[#b90051] hover:text-[#8a003b] hover:bg-[#f5b8cc]/40 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-[#f0a8bf]/70 text-xs text-gray-600 flex items-center justify-between">
              <span>Item Tersimpan: <strong className="text-gray-900 font-bold">{loc._count.items}</strong></span>
              <span>Audit Mutasi: <strong className="text-gray-900 font-bold">{loc._count.stockLogs}</strong></span>
            </div>
          </div>
        ))}
      </div>

      <LocationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editLocation={editLocation}
        onSuccess={handleSuccess}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Lokasi Storage"
        itemName={deleteTarget?.name || ''}
        itemType="lokasi storage"
        onConfirm={handleConfirmDelete}
      />

      <SuccessModal
        isOpen={!!successMsg}
        onClose={() => setSuccessMsg('')}
        message={successMsg}
      />
    </div>
  );
}
