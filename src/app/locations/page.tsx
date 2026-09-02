import { Suspense } from 'react';
import { getLocations } from '@/app/actions/master-data';
import { LocationsClient } from '@/components/locations/locations-client';

export const revalidate = 0;

export default async function LocationsPage() {
  const locations = await getLocations();
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-400">Memuat lokasi...</div>}>
      <LocationsClient initialLocations={locations} />
    </Suspense>
  );
}
