import { Suspense } from 'react';
import { getOfficers } from '@/app/actions/officers';
import { OfficersClient } from '@/components/officers/officers-client';

export const revalidate = 0;

export default async function OfficersPage() {
  const officers = await getOfficers();

  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-400">Memuat petugas...</div>}>
      <OfficersClient initialOfficers={officers} />
    </Suspense>
  );
}
