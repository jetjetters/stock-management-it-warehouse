import { PrismaClient, ItemCategoryType, MutationType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding IT Warehouse database...');

  // 1. Create Locations
  const warehouseIT = await prisma.location.upsert({
    where: { name: 'Warehouse IT' },
    update: {},
    create: {
      name: 'Warehouse IT',
      description: 'Gudang Utama Inventaris Perangkat & Barang IT',
    },
  });

  const mainOffice = await prisma.location.upsert({
    where: { name: 'Main Office' },
    update: {},
    create: {
      name: 'Main Office',
      description: 'Area Operasional Perkantoran',
    },
  });

  const serverRoom = await prisma.location.upsert({
    where: { name: 'Server Room' },
    update: {},
    create: {
      name: 'Server Room',
      description: 'Ruang Server & Ruang Jaringan',
    },
  });

  const rackA1 = await prisma.location.upsert({
    where: { name: 'Rack A1' },
    update: {},
    create: {
      name: 'Rack A1',
      description: 'Rak Penyimpanan Komponen Kecil',
    },
  });

  // 2. Create Categories
  const catMouse = await prisma.category.upsert({
    where: { codePrefix: 'MOS' },
    update: {},
    create: {
      name: 'Mouse',
      type: ItemCategoryType.DEVICE,
      codePrefix: 'MOS',
    },
  });

  const catKeyboard = await prisma.category.upsert({
    where: { codePrefix: 'KBD' },
    update: {},
    create: {
      name: 'Keyboard',
      type: ItemCategoryType.DEVICE,
      codePrefix: 'KBD',
    },
  });

  const catPrinter = await prisma.category.upsert({
    where: { codePrefix: 'PRN' },
    update: {},
    create: {
      name: 'Printer',
      type: ItemCategoryType.DEVICE,
      codePrefix: 'PRN',
    },
  });

  const catTinta = await prisma.category.upsert({
    where: { codePrefix: 'TNT' },
    update: {},
    create: {
      name: 'Tinta Printer',
      type: ItemCategoryType.BARANG,
      codePrefix: 'TNT',
    },
  });

  const catKabel = await prisma.category.upsert({
    where: { codePrefix: 'KBL' },
    update: {},
    create: {
      name: 'Kabel UTP & Jaringan',
      type: ItemCategoryType.BARANG,
      codePrefix: 'KBL',
    },
  });

  // 3. Create Brands
  const brandLogitechMouse = await prisma.brand.upsert({
    where: { name_categoryId: { name: 'Logitech', categoryId: catMouse.id } },
    update: {},
    create: { name: 'Logitech', categoryId: catMouse.id },
  });

  const brandLogitechKeyboard = await prisma.brand.upsert({
    where: { name_categoryId: { name: 'Logitech', categoryId: catKeyboard.id } },
    update: {},
    create: { name: 'Logitech', categoryId: catKeyboard.id },
  });

  const brandEpsonPrinter = await prisma.brand.upsert({
    where: { name_categoryId: { name: 'Epson', categoryId: catPrinter.id } },
    update: {},
    create: { name: 'Epson', categoryId: catPrinter.id },
  });

  const brandEpsonTinta = await prisma.brand.upsert({
    where: { name_categoryId: { name: 'Epson', categoryId: catTinta.id } },
    update: {},
    create: { name: 'Epson', categoryId: catTinta.id },
  });

  const brandBeldenKabel = await prisma.brand.upsert({
    where: { name_categoryId: { name: 'Belden', categoryId: catKabel.id } },
    update: {},
    create: { name: 'Belden', categoryId: catKabel.id },
  });

  // 4. Create Initial Items & Audit Stock Logs
  const itemsData = [
    {
      itemCode: 'MOS0001',
      name: 'Mouse Wireless M170 Silent',
      type: ItemCategoryType.DEVICE,
      description: 'Mouse wireless 2.4GHz standar kantor',
      currentStock: 15,
      categoryId: catMouse.id,
      brandId: brandLogitechMouse.id,
      locationId: warehouseIT.id,
    },
    {
      itemCode: 'MOS0002',
      name: 'MX Master 3S Ergonomic',
      type: ItemCategoryType.DEVICE,
      description: 'Mouse ergonomis high-end untuk desainer/dev',
      currentStock: 4,
      categoryId: catMouse.id,
      brandId: brandLogitechMouse.id,
      locationId: mainOffice.id,
    },
    {
      itemCode: 'KBD0001',
      name: 'Keyboard Mechanical K835 TKL',
      type: ItemCategoryType.DEVICE,
      description: 'Keyboard mechanical switch red',
      currentStock: 8,
      categoryId: catKeyboard.id,
      brandId: brandLogitechKeyboard.id,
      locationId: warehouseIT.id,
    },
    {
      itemCode: 'PRN0001',
      name: 'Printer EcoTank L3210',
      type: ItemCategoryType.DEVICE,
      description: 'Printer multifungsi print scan copy',
      currentStock: 2,
      categoryId: catPrinter.id,
      brandId: brandEpsonPrinter.id,
      locationId: mainOffice.id,
    },
    {
      itemCode: 'TNT0001',
      name: 'Tinta Black 003 Epson',
      type: ItemCategoryType.BARANG,
      description: 'Botol Tinta hitam 65ml untuk series EcoTank',
      currentStock: 25,
      categoryId: catTinta.id,
      brandId: brandEpsonTinta.id,
      locationId: warehouseIT.id,
    },
    {
      itemCode: 'KBL0001',
      name: 'Kabel UTP Cat6 Unshielded 305m',
      type: ItemCategoryType.BARANG,
      description: 'Roll kabel LAN Cat6 indoor',
      currentStock: 3,
      categoryId: catKabel.id,
      brandId: brandBeldenKabel.id,
      locationId: serverRoom.id,
    },
  ];

  for (const itemData of itemsData) {
    const item = await prisma.item.upsert({
      where: { itemCode: itemData.itemCode },
      update: {},
      create: itemData,
    });

    // Initial Audit Trail Stock Log
    const existingLog = await prisma.stockLog.findFirst({
      where: { itemId: item.id },
    });

    if (!existingLog) {
      await prisma.stockLog.create({
        data: {
          itemId: item.id,
          locationId: item.locationId,
          mutation: item.currentStock,
          type: MutationType.IN,
          notes: 'Pencatatan Stok Awal Sistem (Initial Stock)',
        },
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
