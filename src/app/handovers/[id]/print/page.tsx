import { getHandoverById } from '@/app/actions/handovers';
import { notFound } from 'next/navigation';
import { HandoverPrintClient } from './print-client';

export const revalidate = 0;

type HandoverPrintPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function HandoverPrintPage({ params }: HandoverPrintPageProps) {
  const { id } = await params;
  const handover = await getHandoverById(id);

  if (!handover) {
    notFound();
  }

  return <HandoverPrintClient handover={handover} />;
}
