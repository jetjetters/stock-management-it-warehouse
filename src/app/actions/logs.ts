'use server';

import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export type MutationType = 'IN' | 'OUT' | 'ADJUSTMENT';

export type LogFilterParams = {
  search?: string;
  locationId?: string;
  type?: MutationType | 'ALL';
  limit?: number;
};

export async function getStockLogs(params?: LogFilterParams) {
  const { search, locationId, type, limit = 1000 } = params || {};

  const whereClause: Prisma.StockLogWhereInput = {};

  if (search) {
    whereClause.OR = [
      { notes: { contains: search } },
      { item: { name: { contains: search } } },
      { item: { itemCode: { contains: search } } },
    ];
  }

  if (locationId) {
    whereClause.locationId = locationId;
  }

  if (type && type !== 'ALL') {
    whereClause.type = type;
  }

  const logs = await prisma.stockLog.findMany({
    where: whereClause,
    include: {
      item: {
        include: {
          category: true,
        },
      },
      location: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });

  return logs;
}

