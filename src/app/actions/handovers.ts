'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getHandovers() {
  return await prisma.handover.findMany({
    include: {
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getHandoverById(id: string) {
  return await prisma.handover.findUnique({
    where: { id },
    include: {
      items: true,
    },
  });
}

export async function createHandover(data: {
  giverName: string;
  recipientName: string;
  remarks?: string;
  locationName?: string;
  items: Array<{
    itemId?: string;
    deviceName: string;
    serialNo: string;
    brandName: string;
    recipient: string;
    remarks?: string;
  }>;
}) {
  const { giverName, recipientName, remarks, locationName = 'PTK Shore Base Tanjung Batu', items } = data;

  if (!giverName.trim()) throw new Error('Nama penyerah (Diberikan Oleh) wajib dipilih/diisi.');
  if (!recipientName.trim()) throw new Error('Nama penerima (PIC) wajib diisi.');
  if (!items || items.length === 0) throw new Error('Wajib memilih setidaknya 1 item barang untuk diserahkan.');

  const count = await prisma.handover.count();
  const documentNo = `ST-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

  const handover = await prisma.$transaction(async (tx) => {
    const createdHandover = await tx.handover.create({
      data: {
        documentNo,
        locationName,
        giverName: giverName.trim(),
        recipientName: recipientName.trim(),
        remarks: remarks?.trim() || null,
        items: {
          create: items.map((item) => ({
            itemId: item.itemId || null,
            deviceName: item.deviceName,
            serialNo: item.serialNo,
            brandName: item.brandName,
            recipient: item.recipient || recipientName.trim(),
            remarks: item.remarks || remarks?.trim() || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Update item status & create stock logs for associated items
    for (const item of items) {
      if (item.itemId) {
        const dbItem = await tx.item.findUnique({ where: { id: item.itemId } });
        if (dbItem) {
          await tx.item.update({
            where: { id: item.itemId },
            data: { status: 'TERPAKAI' },
          });

          await tx.stockLog.create({
            data: {
              itemId: item.itemId,
              locationId: dbItem.locationId,
              mutation: 0,
              type: 'OUT',
              notes: `Serah Terima Barang ke ${recipientName.trim()} (Dokumen: ${documentNo}, Diberikan oleh: ${giverName.trim()})`,
            },
          });
        }
      }
    }

    return createdHandover;
  });

  revalidatePath('/items');
  revalidatePath('/handovers');
  revalidatePath('/logs');
  return handover;
}

export async function deleteHandover(id: string) {
  const handover = await prisma.handover.findUnique({
    where: { id },
  });

  if (!handover) throw new Error('Dokumen serah terima tidak ditemukan');

  await prisma.handover.delete({ where: { id } });

  revalidatePath('/items');
  revalidatePath('/handovers');
  revalidatePath('/logs');
}

