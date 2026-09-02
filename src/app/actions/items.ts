'use server';

import { prisma } from '@/lib/db';
import { generateNextItemCode } from '@/lib/sku';
import { revalidatePath } from 'next/cache';

export type ItemCategoryType = 'DEVICE' | 'BARANG';
export type MutationType = 'IN' | 'OUT' | 'ADJUSTMENT';

export type ItemFilterParams = {
  search?: string;
  type?: ItemCategoryType | 'ALL';
  categoryId?: string;
  brandId?: string;
  locationId?: string;
  status?: string;
  ownershipStatus?: string;
};

export async function getItems(params?: ItemFilterParams) {
  const { search, type, categoryId, brandId, locationId, status, ownershipStatus } = params || {};

  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { name: { contains: search } },
      { itemCode: { contains: search } },
      { serialNumber: { contains: search } },
      { description: { contains: search } },
      { brand: { name: { contains: search } } },
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

  if (status && status !== 'ALL') {
    whereClause.status = status;
  }

  if (ownershipStatus && ownershipStatus !== 'ALL') {
    whereClause.ownershipStatus = ownershipStatus;
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

export type GroupedStockItem = {
  key: string;
  name: string;
  categoryId: string;
  brandId: string;
  locationId: string;
  category: { id: string; name: string; codePrefix: string; type: ItemCategoryType };
  brand: { id: string; name: string };
  location: { id: string; name: string };
  totalStock: number;
  availableStock: number;
  items: Array<{
    id: string;
    serialNumber: string;
    itemCode: string;
    name: string;
    status: string;
    ownershipStatus: string | null;
    description: string | null;
    createdAt: Date;
  }>;
};

export async function getGroupedStock(params?: ItemFilterParams): Promise<GroupedStockItem[]> {
  const items = await getItems(params);

  const groupsMap = new Map<string, GroupedStockItem>();

  for (const item of items) {
    const groupKey = `${item.categoryId}_${item.brandId}_${item.locationId}_${item.name.toLowerCase().trim()}`;

    if (!groupsMap.has(groupKey)) {
      groupsMap.set(groupKey, {
        key: groupKey,
        name: item.name,
        categoryId: item.categoryId,
        brandId: item.brandId,
        locationId: item.locationId,
        category: item.category,
        brand: item.brand,
        location: item.location,
        totalStock: 0,
        availableStock: 0,
        items: [],
      });
    }

    const group = groupsMap.get(groupKey)!;
    group.totalStock += 1;
    if (item.status === 'TERSEDIA') {
      group.availableStock += 1;
    }
    group.items.push({
      id: item.id,
      serialNumber: item.serialNumber,
      itemCode: item.itemCode,
      name: item.name,
      status: item.status,
      ownershipStatus: item.ownershipStatus,
      description: item.description,
      createdAt: item.createdAt,
    });
  }

  return Array.from(groupsMap.values());
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
  serialNumberInput: string; // single or multi-line / comma separated
  status?: string;
  ownershipStatus?: string;
  description?: string;
}) {
  const { name, categoryId, brandId, locationId, serialNumberInput, status = 'TERSEDIA', ownershipStatus, description } = data;

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new Error('Kategori tidak ditemukan');
  }

  // Parse serial numbers (split by comma, space, or newline)
  const rawSns = serialNumberInput
    .split(/[\n,\r]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (rawSns.length === 0) {
    throw new Error('Wajib memasukkan setidaknya 1 Serial Number (SN).');
  }

  // Deduplicate input SNs
  const uniqueSns = Array.from(new Set(rawSns));

  // Check if any SN already exists in DB
  const existingItems = await prisma.item.findMany({
    where: {
      serialNumber: {
        in: uniqueSns,
      },
    },
    select: { serialNumber: true },
  });

  if (existingItems.length > 0) {
    const duplicates = existingItems.map((i) => i.serialNumber).join(', ');
    throw new Error(`Serial Number berikut sudah terdaftar di sistem: ${duplicates}`);
  }

  const itemCode = await generateNextItemCode(category.codePrefix);

  const createdItems = await prisma.$transaction(async (tx: any) => {
    const results = [];
    for (const sn of uniqueSns) {
      const newItem = await tx.item.create({
        data: {
          serialNumber: sn,
          itemCode,
          name: name.trim(),
          type: category.type,
          categoryId,
          brandId,
          locationId,
          status,
          ownershipStatus: category.type === 'DEVICE' ? (ownershipStatus || 'MILIK_IT') : null,
          description: description?.trim() || null,
        },
      });

      await tx.stockLog.create({
        data: {
          itemId: newItem.id,
          locationId: newItem.locationId,
          mutation: 1,
          type: 'IN',
          notes: `Pencatatan Unit Baru (SN: ${sn})`,
        },
      });

      results.push(newItem);
    }

    return results;
  });

  revalidatePath('/items');
  revalidatePath('/logs');
  revalidatePath('/');
  return createdItems;
}

export async function updateItem(
  id: string,
  data: {
    serialNumber: string;
    name: string;
    categoryId: string;
    brandId: string;
    locationId: string;
    status: string;
    ownershipStatus?: string;
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

  // Check SN uniqueness if SN changed
  const cleanSN = data.serialNumber.trim();
  if (cleanSN !== currentItem.serialNumber) {
    const existing = await prisma.item.findUnique({
      where: { serialNumber: cleanSN },
    });
    if (existing) {
      throw new Error(`Serial Number ${cleanSN} sudah digunakan oleh barang lain.`);
    }
  }

  let itemCode = currentItem.itemCode;
  if (currentItem.categoryId !== data.categoryId) {
    itemCode = await generateNextItemCode(newCategory.codePrefix);
  }

  const isLocationChanged = currentItem.locationId !== data.locationId;

  const updated = await prisma.$transaction(async (tx: any) => {
    const updatedItem = await tx.item.update({
      where: { id },
      data: {
        serialNumber: cleanSN,
        itemCode,
        name: data.name.trim(),
        categoryId: data.categoryId,
        brandId: data.brandId,
        locationId: data.locationId,
        status: data.status,
        ownershipStatus: newCategory.type === 'DEVICE' ? (data.ownershipStatus || 'MILIK_IT') : null,
        type: newCategory.type,
        description: data.description?.trim() || null,
      },
    });

    if (isLocationChanged) {
      await tx.stockLog.create({
        data: {
          itemId: id,
          locationId: data.locationId,
          mutation: 0,
          type: 'ADJUSTMENT',
          notes: `Perubahan Lokasi SN: ${cleanSN} ke lokasi baru`,
        },
      });
    }

    return updatedItem;
  });

  revalidatePath('/items');
  revalidatePath('/logs');
  revalidatePath('/');
  return updated;
}

export async function mutateItemLocation(data: {
  itemId: string;
  targetLocationId: string;
  notes?: string;
}) {
  const { itemId, targetLocationId, notes } = data;

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { location: true },
  });

  if (!item) throw new Error('Item tidak ditemukan');

  if (item.locationId === targetLocationId) {
    throw new Error('Lokasi tujuan sama dengan lokasi saat ini.');
  }

  const targetLocation = await prisma.location.findUnique({
    where: { id: targetLocationId },
  });

  if (!targetLocation) throw new Error('Lokasi tujuan tidak ditemukan');

  const updatedItem = await prisma.$transaction(async (tx: any) => {
    const updated = await tx.item.update({
      where: { id: itemId },
      data: {
        locationId: targetLocationId,
      },
    });

    await tx.stockLog.create({
      data: {
        itemId,
        locationId: targetLocationId,
        mutation: 0,
        type: 'ADJUSTMENT',
        notes: notes?.trim() || `Mutasi SN ${item.serialNumber} dari ${item.location.name} ke ${targetLocation.name}`,
      },
    });

    return updated;
  });

  revalidatePath('/items');
  revalidatePath('/logs');
  revalidatePath('/');
  return updatedItem;
}

export async function updateItemStatus(data: {
  itemId: string;
  status: string;
  notes?: string;
}) {
  const { itemId, status, notes } = data;

  const item = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!item) throw new Error('Item tidak ditemukan');

  const oldStatus = item.status;

  const updatedItem = await prisma.$transaction(async (tx: any) => {
    const updated = await tx.item.update({
      where: { id: itemId },
      data: { status },
    });

    await tx.stockLog.create({
      data: {
        itemId,
        locationId: item.locationId,
        mutation: status === 'RUSAK' || status === 'KELUAR' ? -1 : 0,
        type: status === 'KELUAR' ? 'OUT' : 'ADJUSTMENT',
        notes: notes?.trim() || `Status SN ${item.serialNumber} diubah: ${oldStatus} -> ${status}`,
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

  await prisma.$transaction([
    prisma.stockLog.deleteMany({ where: { itemId: id } }),
    prisma.item.delete({ where: { id } }),
  ]);

  revalidatePath('/items');
  revalidatePath('/logs');
  revalidatePath('/');
}

