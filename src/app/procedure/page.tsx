import { Metadata } from 'next';
import { ProcedureClient } from '@/components/procedure/procedure-client';

export const metadata: Metadata = {
  title: 'Prosedur Input Barang | IT Warehouse',
  description: 'SOP dan panduan langkah demi langkah input master data dan unit inventaris barang IT PT Pertamina Trans Kontinental.',
};

export default function ProcedurePage() {
  return <ProcedureClient />;
}
