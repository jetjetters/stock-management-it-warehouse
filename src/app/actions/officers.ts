'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getOfficers() {
  return await prisma.officer.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function createOfficer(data: { name: string; role?: string }) {
  const name = data.name.trim();
  if (!name) throw new Error('Nama petugas wajib diisi');

  const existing = await prisma.officer.findFirst({
    where: { name: { equals: name } },
  });

  if (existing) {
    throw new Error(`Petugas dengan nama "${name}" sudah terdaftar`);
  }

  const officer = await prisma.officer.create({
    data: {
      name,
      role: data.role?.trim() || 'IT Staff / Penanggung Jawab',
    },
  });

  revalidatePath('/officers');
  revalidatePath('/items');
  return officer;
}

export async function updateOfficer(
  id: string,
  data: { name: string; role?: string }
) {
  const name = data.name.trim();
  if (!name) throw new Error('Nama petugas wajib diisi');

  const existing = await prisma.officer.findFirst({
    where: { name: { equals: name }, NOT: { id } },
  });

  if (existing) {
    throw new Error(`Petugas dengan nama "${name}" sudah terdaftar`);
  }

  const officer = await prisma.officer.update({
    where: { id },
    data: {
      name,
      role: data.role?.trim() || 'IT Staff / Penanggung Jawab',
    },
  });

  revalidatePath('/officers');
  revalidatePath('/items');
  return officer;
}

export async function deleteOfficer(id: string) {
  const officer = await prisma.officer.findUnique({
    where: { id },
  });

  if (!officer) throw new Error('Petugas tidak ditemukan');

  await prisma.officer.delete({ where: { id } });
  revalidatePath('/officers');
  revalidatePath('/items');
}
