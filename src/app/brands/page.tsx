import { getBrands, getCategories } from '@/app/actions/master-data';
import { BrandsClient } from '@/components/brands/brands-client';

export const revalidate = 0;

export default async function BrandsPage() {
  const [brands, categories] = await Promise.all([
    getBrands(),
    getCategories(),
  ]);

  return <BrandsClient initialBrands={brands} categories={categories} />;
}
