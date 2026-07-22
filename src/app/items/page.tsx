import { prisma } from '@/lib/db';
import { ItemsClient } from '@/components/items/items-client';

export const revalidate = 0;

export default async function ItemsPage() {
  const [items, categories, brands, locations] = await Promise.all([
    prisma.item.findMany({
      include: {
        category: true,
        brand: true,
        location: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.brand.findMany({ orderBy: { name: 'asc' } }),
    prisma.location.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return (
    <ItemsClient
      initialItems={items}
      categories={categories}
      brands={brands}
      locations={locations}
    />
  );
}
