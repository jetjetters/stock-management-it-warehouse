import { prisma } from '@/lib/db';
import { ItemForm } from '@/components/items/item-form';
import { notFound } from 'next/navigation';

export const revalidate = 0;

type EditItemPageProps = {
  params: {
    id: string;
  };
};

export default async function EditItemPage({ params }: EditItemPageProps) {
  const [item, categories, brands, locations] = await Promise.all([
    prisma.item.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        brand: true,
        location: true,
      },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.brand.findMany({ orderBy: { name: 'asc' } }),
    prisma.location.findMany({ orderBy: { name: 'asc' } }),
  ]);

  if (!item) {
    notFound();
  }

  return (
    <ItemForm
      categories={categories}
      brands={brands}
      locations={locations}
      editItem={item}
    />
  );
}
