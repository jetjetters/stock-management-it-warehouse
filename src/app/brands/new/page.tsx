import { getCategories } from '@/app/actions/master-data';
import { BrandForm } from '@/components/brands/brand-form';

export const revalidate = 0;

export default async function NewBrandPage() {
  const categories = await getCategories();
  return <BrandForm categories={categories} />;
}
