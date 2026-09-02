'use server';

import { prisma } from '@/lib/db';

export type ItemCategoryType = 'DEVICE' | 'BARANG';

import { revalidatePath } from 'next/cache';

// --- CATEGORY ACTIONS ---
export async function getCategories() {
  return await prisma.category.findMany({
    include: {
      brands: true,
      items: {
        include: {
          brand: true,
          location: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: { items: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function createCategory(data: {
  name: string;
  type: ItemCategoryType;
  codePrefix: string;
}) {
  const name = data.name.trim();
  const codePrefix = data.codePrefix.trim().toUpperCase();

  const existingName = await prisma.category.findFirst({
    where: { name: { equals: name } },
  });
  if (existingName) throw new Error('Kategori sudah ada');

  const existingPrefix = await prisma.category.findFirst({
    where: { codePrefix: { equals: codePrefix } },
  });
  if (existingPrefix) throw new Error('Prefix SKU sudah digunakan oleh kategori lain');

  const category = await prisma.category.create({
    data: {
      name,
      type: data.type,
      codePrefix,
    },
  });

  revalidatePath('/categories');
  revalidatePath('/items');
  return category;
}

export async function updateCategory(
  id: string,
  data: {
    name: string;
    type: ItemCategoryType;
    codePrefix: string;
  }
) {
  const name = data.name.trim();
  const codePrefix = data.codePrefix.trim().toUpperCase();

  const existingName = await prisma.category.findFirst({
    where: { name: { equals: name }, NOT: { id } },
  });
  if (existingName) throw new Error('Kategori sudah ada');

  const existingPrefix = await prisma.category.findFirst({
    where: { codePrefix: { equals: codePrefix }, NOT: { id } },
  });
  if (existingPrefix) throw new Error('Prefix SKU sudah digunakan oleh kategori lain');

  const category = await prisma.category.update({
    where: { id },
    data: {
      name,
      type: data.type,
      codePrefix,
    },
  });

  revalidatePath('/categories');
  revalidatePath('/items');
  return category;
}

export async function deleteCategory(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: { select: { items: true, brands: true } },
    },
  });

  if (!category) throw new Error('Kategori tidak ditemukan');

  if (category._count.items > 0) {
    throw new Error(
      `Tidak dapat menghapus kategori "${category.name}" karena masih menyimpan ${category._count.items} item barang. Pindahkan atau hapus item tersebut terlebih dahulu.`
    );
  }

  if (category._count.brands > 0) {
    throw new Error(
      `Tidak dapat menghapus kategori "${category.name}" karena masih memiliki ${category._count.brands} merk/brand terdaftar. Hapus atau ubah merk tersebut terlebih dahulu.`
    );
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath('/categories');
  revalidatePath('/items');
}

// --- BRAND ACTIONS ---
export async function getBrands(categoryId?: string) {
  const whereClause = categoryId ? { categoryId } : {};
  return await prisma.brand.findMany({
    where: whereClause,
    include: {
      category: true,
      items: {
        include: {
          location: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: { items: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function createBrand(data: { name: string; categoryId: string }) {
  const name = data.name.trim();

  const existing = await prisma.brand.findFirst({
    where: {
      name: { equals: name },
      categoryId: data.categoryId,
    },
  });

  if (existing) {
    throw new Error('Merk sudah ada');
  }

  const brand = await prisma.brand.create({
    data: {
      name,
      categoryId: data.categoryId,
    },
    include: {
      category: true,
    },
  });

  revalidatePath('/brands');
  revalidatePath('/items');
  return brand;
}

export async function updateBrand(
  id: string,
  data: { name: string; categoryId: string }
) {
  const name = data.name.trim();

  const existing = await prisma.brand.findFirst({
    where: {
      name: { equals: name },
      categoryId: data.categoryId,
      NOT: { id },
    },
  });

  if (existing) {
    throw new Error('Merk sudah ada');
  }

  const brand = await prisma.brand.update({
    where: { id },
    data: {
      name,
      categoryId: data.categoryId,
    },
    include: {
      category: true,
    },
  });

  revalidatePath('/brands');
  revalidatePath('/items');
  return brand;
}

export async function deleteBrand(id: string) {
  const brand = await prisma.brand.findUnique({
    where: { id },
    include: {
      _count: { select: { items: true } },
    },
  });

  if (!brand) throw new Error('Merk tidak ditemukan');

  if (brand._count.items > 0) {
    throw new Error(
      `Tidak dapat menghapus merk "${brand.name}" karena masih digunakan oleh ${brand._count.items} item barang. Ubah merk barang tersebut terlebih dahulu.`
    );
  }

  await prisma.brand.delete({ where: { id } });
  revalidatePath('/brands');
  revalidatePath('/items');
}

// --- LOCATION ACTIONS ---
export async function getLocations() {
  return await prisma.location.findMany({
    include: {
      items: {
        include: {
          brand: true,
          category: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: { items: true, stockLogs: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function createLocation(data: { name: string; description?: string }) {
  const name = data.name.trim();

  const existing = await prisma.location.findFirst({
    where: { name: { equals: name } },
  });

  if (existing) {
    throw new Error('Lokasi storage sudah ada');
  }

  const location = await prisma.location.create({
    data: {
      name,
      description: data.description?.trim() || null,
    },
  });

  revalidatePath('/locations');
  revalidatePath('/items');
  return location;
}

export async function updateLocation(
  id: string,
  data: { name: string; description?: string }
) {
  const name = data.name.trim();

  const existing = await prisma.location.findFirst({
    where: { name: { equals: name }, NOT: { id } },
  });

  if (existing) {
    throw new Error('Lokasi storage sudah ada');
  }

  const location = await prisma.location.update({
    where: { id },
    data: {
      name,
      description: data.description?.trim() || null,
    },
  });

  revalidatePath('/locations');
  revalidatePath('/items');
  return location;
}

export async function deleteLocation(id: string) {
  const location = await prisma.location.findUnique({
    where: { id },
    include: {
      _count: { select: { items: true, stockLogs: true } },
    },
  });

  if (!location) throw new Error('Lokasi tidak ditemukan');

  if (location._count.items > 0) {
    throw new Error(
      `Lokasi "${location.name}" masih menyimpan ${location._count.items} item stok barang di dalamnya. Pindahkan atau edit lokasi barang tersebut ke lokasi lain terlebih dahulu.`
    );
  }

  if (location._count.stockLogs > 0) {
    throw new Error(
      `Tidak dapat menghapus lokasi "${location.name}" karena memiliki riwayat audit trail mutasi stok.`
    );
  }

  await prisma.location.delete({ where: { id } });
  revalidatePath('/locations');
  revalidatePath('/items');
}
