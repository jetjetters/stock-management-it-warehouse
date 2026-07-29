import { PrismaClient, ItemCategoryType, MutationType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding IT Warehouse database with SN units...');

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

  // 4. Create Physical SN Item Units & Stock Logs
  const itemsUnits = [
    // Mouse Logitech at Warehouse IT
    {
      serialNumber: 'SN-LOGI-MOS-001',
      itemCode: 'MOS0001',
      name: 'Mouse Wireless M170',
      type: ItemCategoryType.DEVICE,
      status: 'TERSEDIA',
      description: 'Mouse wireless standar kantor',
      categoryId: catMouse.id,
      brandId: brandLogitechMouse.id,
      locationId: warehouseIT.id,
    },
    {
      serialNumber: 'SN-LOGI-MOS-002',
      itemCode: 'MOS0001',
      name: 'Mouse Wireless M170',
      type: ItemCategoryType.DEVICE,
      status: 'TERSEDIA',
      description: 'Mouse wireless standar kantor',
      categoryId: catMouse.id,
      brandId: brandLogitechMouse.id,
      locationId: warehouseIT.id,
    },
    {
      serialNumber: 'SN-LOGI-MOS-003',
      itemCode: 'MOS0001',
      name: 'Mouse Wireless M170',
      type: ItemCategoryType.DEVICE,
      status: 'TERPAKAI',
      description: 'Dipakai staff operasional',
      categoryId: catMouse.id,
      brandId: brandLogitechMouse.id,
      locationId: mainOffice.id,
    },
    // Mouse MX Master 3S at Main Office
    {
      serialNumber: 'SN-MX3S-99102',
      itemCode: 'MOS0002',
      name: 'MX Master 3S Ergonomic',
      type: ItemCategoryType.DEVICE,
      status: 'TERPAKAI',
      description: 'Mouse ergonomis dev team',
      categoryId: catMouse.id,
      brandId: brandLogitechMouse.id,
      locationId: mainOffice.id,
    },
    {
      serialNumber: 'SN-MX3S-99103',
      itemCode: 'MOS0002',
      name: 'MX Master 3S Ergonomic',
      type: ItemCategoryType.DEVICE,
      status: 'TERSEDIA',
      description: 'Unit cadangan VIP',
      categoryId: catMouse.id,
      brandId: brandLogitechMouse.id,
      locationId: warehouseIT.id,
    },

    // Keyboards
    {
      serialNumber: 'SN-KBD-8801',
      itemCode: 'KBD0001',
      name: 'Keyboard Mechanical K835 TKL',
      type: ItemCategoryType.DEVICE,
      status: 'TERSEDIA',
      description: 'Switch Red TKL',
      categoryId: catKeyboard.id,
      brandId: brandLogitechKeyboard.id,
      locationId: warehouseIT.id,
    },
    {
      serialNumber: 'SN-KBD-8802',
      itemCode: 'KBD0001',
      name: 'Keyboard Mechanical K835 TKL',
      type: ItemCategoryType.DEVICE,
      status: 'TERSEDIA',
      description: 'Switch Red TKL',
      categoryId: catKeyboard.id,
      brandId: brandLogitechKeyboard.id,
      locationId: warehouseIT.id,
    },

    // Printers
    {
      serialNumber: 'SN-EPS-PRN-001',
      itemCode: 'PRN0001',
      name: 'Printer EcoTank L3210',
      type: ItemCategoryType.DEVICE,
      status: 'TERPAKAI',
      description: 'Printer resepsionis',
      categoryId: catPrinter.id,
      brandId: brandEpsonPrinter.id,
      locationId: mainOffice.id,
    },

    // Tinta Printer (Consumable SN units)
    {
      serialNumber: 'SN-TNT-BLK-101',
      itemCode: 'TNT0001',
      name: 'Tinta Black 003 Epson',
      type: ItemCategoryType.BARANG,
      status: 'TERSEDIA',
      description: 'Botol Tinta 65ml',
      categoryId: catTinta.id,
      brandId: brandEpsonTinta.id,
      locationId: warehouseIT.id,
    },
    {
      serialNumber: 'SN-TNT-BLK-102',
      itemCode: 'TNT0001',
      name: 'Tinta Black 003 Epson',
      type: ItemCategoryType.BARANG,
      status: 'TERSEDIA',
      description: 'Botol Tinta 65ml',
      categoryId: catTinta.id,
      brandId: brandEpsonTinta.id,
      locationId: warehouseIT.id,
    },

    // Kabel UTP
    {
      serialNumber: 'SN-KBL-BLD-01',
      itemCode: 'KBL0001',
      name: 'Kabel UTP Cat6 Unshielded 305m',
      type: ItemCategoryType.BARANG,
      status: 'TERSEDIA',
      description: 'Roll cable 305m indoor',
      categoryId: catKabel.id,
      brandId: brandBeldenKabel.id,
      locationId: serverRoom.id,
    },
  ];

  for (const uData of itemsUnits) {
    const item = await prisma.item.upsert({
      where: { serialNumber: uData.serialNumber },
      update: {},
      create: uData,
    });

    const existingLog = await prisma.stockLog.findFirst({
      where: { itemId: item.id },
    });

    if (!existingLog) {
      await prisma.stockLog.create({
        data: {
          itemId: item.id,
          locationId: item.locationId,
          mutation: 1,
          type: MutationType.IN,
          notes: `Registrasi Awal Unit SN: ${item.serialNumber}`,
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

