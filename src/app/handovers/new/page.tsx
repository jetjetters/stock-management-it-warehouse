import { getOfficers } from '@/app/actions/officers';
import { getItems } from '@/app/actions/items';
import { HandoverFormClient } from './handover-form-client';

export const revalidate = 0;

type HandoverNewPageProps = {
  searchParams: Promise<{
    itemId?: string;
  }>;
};

export default async function HandoverNewPage({ searchParams }: HandoverNewPageProps) {
  const { itemId } = await searchParams;
  const officers = await getOfficers();
  const availableItems = await getItems({ status: 'TERSEDIA' });

  return (
    <HandoverFormClient
      officers={officers}
      availableItems={availableItems}
      presetItemId={itemId}
    />
  );
}
