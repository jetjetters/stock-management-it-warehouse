import { Suspense } from 'react';
import { getCategories } from '@/app/actions/master-data';
import { CategoriesClient } from '@/components/categories/categories-client';

export const revalidate = 0;

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-400">Memuat kategori...</div>}>
      <CategoriesClient initialCategories={categories} />
    </Suspense>
  );
}
