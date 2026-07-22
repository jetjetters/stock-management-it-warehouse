'use client';

import { useState } from 'react';
import { Plus, MapPin, Pencil, Trash2 } from 'lucide-react';
import { deleteLocation } from '@/app/actions/master-data';
import { LocationModal } from '@/components/locations/location-modal';
import { DeleteConfirmModal } from '@/components/ui/delete-confirm-modal';
import { useRouter } from 'next/navigation';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editLocation, setEditLocation] = useState<LocationType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteLocation(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Master Lokasi Storage</h1>
          <p className="text-xs text-slate-400">
            Daftar pos area penyimpanan inventaris IT dan lokasi pergerakan barang
          </p>
        </div>

        <button
          onClick={() => {
            setEditLocation(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm shadow-lg shadow-blue-600/20 transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Lokasi Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {initialLocations.map((loc) => (
          <div
            key={loc.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-slate-700 transition shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">{loc.name}</h3>
                  {loc.description && (
                    <p className="text-xs text-slate-400 mt-0.5">{loc.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setEditLocation(loc);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: loc.id, name: loc.name })}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Item Tersimpan: <strong className="text-slate-200">{loc._count.items}</strong></span>
              <span>Audit Mutasi: <strong className="text-slate-200">{loc._count.stockLogs}</strong></span>
            </div>
          </div>
        ))}
      </div>

      <LocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editLocation={editLocation}
        onSuccess={() => router.refresh()}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Lokasi Storage"
        itemName={deleteTarget?.name || ''}
        itemType="lokasi storage"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
