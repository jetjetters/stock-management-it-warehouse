import { getOfficers } from '@/app/actions/officers';
import { OfficersClient } from '@/components/officers/officers-client';

export const revalidate = 0;

export default async function OfficersPage() {
  const officers = await getOfficers();

  return <OfficersClient initialOfficers={officers} />;
}
