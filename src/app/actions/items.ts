'use me';
'use server';

import { prisma } from '@/lib/db';
import { generateNextItemCode } from '@/lib/sku';

export type ItemCategoryType = 'DEVICE' | 'BARANG';
export type MutationType = 'IN' | 'OUT' | 'ADJUSTMENT';

import { revalidatePath } from 'next/cache';

export type ItemFilterParams = {
  search?: string;
  type?: ItemCategoryType | 'ALL';
  categoryId?: string;
  brandId?: string;
  locationId?: string;
};

export async function getItems(params?: ItemFilterParams) {
  const { search, type, categoryId, brandId, locationId } = params || {};

  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { name: { contains: search } },
      { itemCode: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (type && type !== 'ALL') {
    whereClause.type = type;
  }

  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  if (brandId) {
    whereClause.brandId = brandId;
  }

  if (locationId) {
    whereClause.locationId = locationId;
  }

  const items = await prisma.item.findMany({
    where: whereClause,
    include: {
      category: true,
      brand: true,
      location: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return items;
}

export async function getItemNextSku(categoryId: string) {
  if (!categoryId) return '';
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) return '';
  return await generateNextItemCode(category.codePrefix);
}

export async function createItem(data: {
  name: string;
  categoryId: string;
  brandId: string;
  locationId: string;
  initialStock: number;
  description?: string;
}) {
  const { name, categoryId, brandId, locationId, initialStock, description } = data;

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new Error('Kategori tidak ditemukan');
  }

  const itemCode = await generateNextItemCode(category.codePrefix);
  const stockQty = Math.max(0, Number(initialStock) || 0);

  const item = await prisma.$transaction(async (tx: any) => {
    const newItem = await tx.item.create({
      data: {
        itemCode,
        name: name.trim(),
        type: category.type,
        categoryId,
        brandId,
        locationId,
        currentStock: stockQty,
        description: description?.trim() || null,
      },
    });

    if (stockQty > 0) {
      await tx.stockLog.create({
        data: {
          itemId: newItem.id,
          locationId: newItem.locationId,
          mutation: stockQty,
          type: 'IN',
          notes: 'Pencatatan Stok Awal Item Baru',
        },
      });
    }

    return newItem;
  });

  revalidatePath('/items');
  revalidatePath('/');
  return item;
}

export async function updateItem(
  id: string,
  data: {
    name: string;
    categoryId: string;
    brandId: string;
    locationId: string;
    description?: string;
  }
) {
  const currentItem = await prisma.item.findUnique({
    where: { id },
  });

  if (!currentItem) throw new Error('Item tidak ditemukan');

  const newCategory = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!newCategory) throw new Error('Kategori tidak ditemukan');

  // If category changed, generate new SKU sequence for the new category
  let itemCode = currentItem.itemCode;
  if (currentItem.categoryId !== data.categoryId) {
    itemCode = await generateNextItemCode(newCategory.codePrefix);
  }

  const updated = await prisma.item.update({
    where: { id },
    data: {
      itemCode,
      name: data.name.trim(),
      categoryId: data.categoryId,
      brandId: data.brandId,
      locationId: data.locationId,
      type: newCategory.type,
      description: data.description?.trim() || null,
    },
  });

  revalidatePath('/items');
  revalidatePath('/');
  return updated;
}

export async function mutateStock(data: {
  itemId: string;
  mutation: number;
  type: MutationType;
  notes: string;
  locationId?: string;
}) {
  const { itemId, mutation, type, notes, locationId } = data;

  const item = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!item) throw new Error('Item tidak ditemukan');

  if (mutation === 0) {
    throw new Error('Jumlah mutasi stok tidak boleh 0');
  }

  const effectiveLocationId = locationId || item.locationId;
  const delta = type === 'OUT' ? -Math.abs(mutation) : Math.abs(mutation);

  const updatedItem = await prisma.$transaction(async (tx: any) => {
    const newStock = item.currentStock + delta;
    if (newStock < 0) {
      throw new Error(`Stok tidak mencukupi. Stok saat ini: ${item.currentStock}, pengeluaran: ${Math.abs(delta)}`);
    }

    const updated = await tx.item.update({
      where: { id: itemId },
      data: {
        currentStock: newStock,
        locationId: effectiveLocationId,
      },
    });

    await tx.stockLog.create({
      data: {
        itemId,
        locationId: effectiveLocationId,
        mutation: delta,
        type,
        notes: notes.trim() || (delta > 0 ? 'Penambahan Stok' : 'Pengurangan Stok'),
      },
    });

    return updated;
  });

  revalidatePath('/items');
  revalidatePath('/logs');
  revalidatePath('/');
  return updatedItem;
}

export async function stockOpnameAdjustment(data: {
  itemId: string;
  physicalStock: number;
  notes: string;
  locationId?: string;
}) {
  const { itemId, physicalStock, notes, locationId } = data;

  const item = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!item) throw new Error('Item tidak ditemukan');

  const targetStock = Math.max(0, physicalStock);
  const diff = targetStock - item.currentStock;

  if (diff === 0) {
    throw new Error('Jumlah stok fisik sama dengan stok sistem. Tidak ada koreksi yang dibuat.');
  }

  const effectiveLocationId = locationId || item.locationId;

  const updatedItem = await prisma.$transaction(async (tx: any) => {
    const updated = await tx.item.update({
      where: { id: itemId },
      data: {
        currentStock: targetStock,
        locationId: effectiveLocationId,
      },
    });

    const mutationType = diff > 0 ? 'IN' : 'OUT';
    const notesText = notes.trim()
      ? `Stock Opname: ${notes.trim()} (Stok Sistem: ${item.currentStock} -> Fisik: ${targetStock})`
      : `Koreksi Stock Opname (Stok Sistem: ${item.currentStock} -> Fisik: ${targetStock})`;

    await tx.stockLog.create({
      data: {
        itemId,
        locationId: effectiveLocationId,
        mutation: diff,
        type: mutationType,
        notes: notesText,
      },
    });

    return updated;
  });

  revalidatePath('/items');
  revalidatePath('/logs');
  revalidatePath('/');
  return updatedItem;
}

export async function deleteItem(id: string) {
  const item = await prisma.item.findUnique({
    where: { id },
  });

  if (!item) throw new Error('Item tidak ditemukan');

  if (item.currentStock > 0) {
    throw new Error(
      `Tidak dapat menghapus item "${item.name}" karena masih memiliki sisa stok (${item.currentStock} unit). Kosongkan stok terlebih dahulu via mutasi/opname.`
    );
  }

  await prisma.$transaction([
    prisma.stockLog.deleteMany({ where: { itemId: id } }),
    prisma.item.delete({ where: { id } }),
  ]);

  revalidatePath('/items');
  revalidatePath('/logs');
  revalidatePath('/');
}
