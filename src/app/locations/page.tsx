import { getLocations } from '@/app/actions/master-data';
import { LocationsClient } from '@/components/locations/locations-client';

export const revalidate = 0;

export default async function LocationsPage() {
  const locations = await getLocations();
  return <LocationsClient initialLocations={locations} />;
}
