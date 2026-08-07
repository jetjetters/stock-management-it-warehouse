import { getHandovers } from '@/app/actions/handovers';
import { HandoversClient } from '@/components/handovers/handovers-client';

export const revalidate = 0;

export default async function HandoversPage() {
  const handovers = await getHandovers();

  return <HandoversClient initialHandovers={handovers} />;
}
