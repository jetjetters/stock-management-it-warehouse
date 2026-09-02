import { Suspense } from 'react';
import { getBrands, getCategories } from '@/app/actions/master-data';
import { BrandsClient } from '@/components/brands/brands-client';

export const revalidate = 0;

export default async function BrandsPage() {
  const [brands, categories] = await Promise.all([
    getBrands(),
    getCategories(),
  ]);

  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-400">Memuat merk...</div>}>
      <BrandsClient initialBrands={brands} categories={categories} />
    </Suspense>
  );
}
