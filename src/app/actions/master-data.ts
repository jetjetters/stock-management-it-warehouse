'use server';

import { prisma } from '@/lib/db';
import { ItemCategoryType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// --- CATEGORY ACTIONS ---
export async function getCategories() {
  return await prisma.category.findMany({
    include: {
      brands: true,
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
      _count: {
        select: { items: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function createBrand(data: { name: string; categoryId: string }) {
  const name = data.name.trim();
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
  await prisma.brand.delete({ where: { id } });
  revalidatePath('/brands');
  revalidatePath('/items');
}

// --- LOCATION ACTIONS ---
export async function getLocations() {
  return await prisma.location.findMany({
    include: {
      _count: {
        select: { items: true, stockLogs: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function createLocation(data: { name: string; description?: string }) {
  const name = data.name.trim();
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
  await prisma.location.delete({ where: { id } });
  revalidatePath('/locations');
  revalidatePath('/items');
}
