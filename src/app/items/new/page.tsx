import { prisma } from '@/lib/db';
import { ItemForm } from '@/components/items/item-form';

export const revalidate = 0;

type NewItemPageProps = {
  searchParams: Promise<{
    name?: string;
    categoryId?: string;
    brandId?: string;
    locationId?: string;
    editId?: string;
  }>;
};

export default async function NewItemPage({ searchParams }: NewItemPageProps) {
  const params = await searchParams;

  const [categories, brands, locations, editItem] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.brand.findMany({ orderBy: { name: 'asc' } }),
    prisma.location.findMany({ orderBy: { name: 'asc' } }),
    params.editId
      ? prisma.item.findUnique({
          where: { id: params.editId },
        })
      : null,
  ]);

  const presetItem = params.name
    ? {
        name: params.name,
        categoryId: params.categoryId,
        brandId: params.brandId,
        locationId: params.locationId,
      }
    : null;

  return (
    <ItemForm
      categories={categories}
      brands={brands}
      locations={locations}
      presetItem={presetItem}
      editItem={editItem}
    />
  );
}
