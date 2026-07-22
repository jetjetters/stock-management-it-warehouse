import { prisma } from './db';

/**
 * Generates the next sequential item code / SKU based on category prefix.
 * Example: For prefix 'MOS', returns 'MOS0001' if no items exist, or 'MOS0004' if 'MOS0003' exists.
 */
export async function generateNextItemCode(codePrefix: string): Promise<string> {
  const cleanPrefix = codePrefix.trim().toUpperCase();
  if (!cleanPrefix) {
    throw new Error('Code prefix category tidak boleh kosong.');
  }

  // Find all items with itemCode starting with cleanPrefix
  const items = await prisma.item.findMany({
    where: {
      itemCode: {
        startsWith: cleanPrefix,
      },
    },
    select: {
      itemCode: true,
    },
  });

  let maxNum = 0;
  for (const item of items) {
    const numPart = item.itemCode.slice(cleanPrefix.length);
    const parsedNum = parseInt(numPart, 10);
    if (!isNaN(parsedNum) && parsedNum > maxNum) {
      maxNum = parsedNum;
    }
  }

  const nextNum = maxNum + 1;
  const formattedSeq = nextNum.toString().padStart(4, '0');
  return `${cleanPrefix}${formattedSeq}`;
}
