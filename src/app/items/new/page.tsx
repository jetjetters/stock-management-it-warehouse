import { prisma } from '@/lib/db';
import { ItemForm } from '@/components/items/item-form';

export const revalidate = 0;

export default async function NewItemPage() {
  const [categories, brands, locations] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.brand.findMany({ orderBy: { name: 'asc' } }),
    prisma.location.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return (
    <ItemForm
      categories={categories}
      brands={brands}
      locations={locations}
    />
  );
}
