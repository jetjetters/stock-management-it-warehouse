import { getCategories } from '@/app/actions/master-data';
import { CategoriesClient } from '@/components/categories/categories-client';

export const revalidate = 0;

export default async function CategoriesPage() {
  const categories = await getCategories();
  return <CategoriesClient initialCategories={categories} />;
}
