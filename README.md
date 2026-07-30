# 📦 IT Warehouse Management & Stock Taking System

Sistem Manajemen Inventaris, Stock Opname, dan Tracking Unit **Serial Number (SN)** Gudang IT berbasis localhost. Sistem ini dirancang untuk mengelola inventaris perangkat IT (*Devices*) dan bahan habis pakai (*Consumables/Barang*), otomatisasi penomoran kode SKU unik, pemantauan unit individual via Serial Number, serta pencatatan mutasi stok secara *real-time* berbasis **Audit Trail**.

---

## 🛠️ Teknologi yang Digunakan

- **Framework**: Next.js 14+ (App Router, Server Actions, TypeScript)
- **Styling & UI**: Tailwind CSS & Lucide React Icons
- **Database**: SQLite (Local Zero-Config File Database)
- **ORM**: Prisma ORM v6
- **Forms & Validation**: React Hook Form & Zod Validation

---

## ✨ Fitur Utama

1. **Pendaftaran Unit Serial Number (SN) & Bulk Entry**:
   - Pencatatan barang secara spesifik menggunakan **Serial Number (SN)** unik per unit fisik.
   - Fitur **Bulk SN Input**: Memungkinkan pendaftaran banyak unit sekaligus dalam satu form dengan memisahkan Serial Number menggunakan koma atau baris baru.

2. **Pemisahan Klasifikasi Inventaris**:
   - **`DEVICE` (Perangkat Physical Asset)**: Mouse, Keyboard, Laptop, Printer, Monitor, dll.
   - **`BARANG` (Consumables)**: Tinta Printer, Kabel UTP Cat6, Connector RJ45, Paper, dll.

3. **Otomatisasi Penomoran SKU**:
   - Penomoran otomatis berbasis *Prefix Category* dengan format **`[PREFIX][4_DIGIT_SEQUENCE]`** (Contoh: `MOS0001`, `KBD0001`, `PRN0001`, `TNT0001`).
   - Preview kode SKU baru secara *real-time* saat memilih kategori di form penambahan barang.

4. **Master Data Dinamis & Dependent Dropdowns**:
   - Dropdown Merk/Brand ter-filter otomatis sesuai Kategori yang dipilih.
   - Pembuatan Merk/Brand baru secara langsung (*inline creation*) dari modal tanpa meninggalkan form.
   - Pos Lokasi Storage yang fleksibel dan terpusat (`Warehouse IT`, `Main Office`, `Server Room`, `Rack A1`).

5. **Tampilan Stok Terkelompok (Grouped Stock View)**:
   - Pengelompokan unit otomatis berdasarkan Kategori, Brand, Lokasi, dan Nama Barang.
   - Informasi kuantitas ringkas: **Total Stok** dan **Stok Tersedia (Available)** dengan daftar detail unit SN yang dapat di-expand.

6. **Mutasi Lokasi & Perubahan Status Unit**:
   - **Transfer Lokasi**: Pemindahan posisi unit SN dari satu lokasi ke lokasi lain disertai catatan alasan mutasi.
   - **Update Status Unit**: Manajemen status fisik (`TERSEDIA`, `TERPAKAI`, `RUSAK`, `KELUAR`) yang secara otomatis mencatat dampaknya ke log audit mutasi.

7. **Audit Trail Mutasi Stok (Immutable Log)**:
   - Seluruh aktivitas penambahan (`IN`), pengurangan (`OUT`), maupun penyesuaian lokasi/status (`ADJUSTMENT`) dicatat secara otomatis ke tabel audit trail `StockLog`.
   - Format rekaman log transparan: mencatat kode item, lokasi, tanggal, jenis mutasi, dan keterangan lengkap.

8. **Dashboard Analytics Center**:
   - Ringkasan statistik real-time: Total Unit SN, Jumlah Devices, Jumlah Barang Consumables, Unit Tersedia, dan Unit Rusak.
   - Widget aktivitas mutasi stok terbaru dan unit barang yang baru didaftarkan.

---

## 📐 Skema Database (Prisma Schema)

Sistem menggunakan model relasional berikut:

- **`Category`**: Mengelola nama kategori (`Mouse`, `Printer`, `Tinta`), tipe (`DEVICE` atau `BARANG`), dan prefix SKU (`MOS`, `PRN`, `TNT`).
- **`Brand`**: Merk barang yang terikat pada Kategori spesifik (`Logitech`, `Epson`, `Belden`).
- **`Location`**: Area atau posisi penyimpanan inventaris (`Warehouse IT`, `Main Office`, `Server Room`).
- **`Item`**: Unit barang individu dengan `serialNumber` (unik), `itemCode` (SKU), `name`, `type`, `status` (`TERSEDIA`, `TERPAKAI`, `RUSAK`, `KELUAR`), serta relasi ke Category, Brand, dan Location.
- **`StockLog`**: Catatan riwayat mutasi stok (`IN`, `OUT`, `ADJUSTMENT`) dengan kolom `mutation` (+/-), `locationId`, `notes`, dan `createdAt`.

---

## 🚀 Panduan Setup & Instalasi

### 1. Prasyarat Sistem
- **Node.js**: v18.0.0 atau yang lebih baru (Disarankan Node.js v20/v22 LTS)
- **NPM**: v9.0.0 atau yang lebih baru

### 2. Langkah Instalasi

1. **Clone repository & masuk ke direktori proyek**:
   ```bash
   git clone <URL_REPOSITORY_ANDA>
   cd stock-management-it-warehouse
   ```

2. **Install seluruh dependensi proyek**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**:
   Pastikan file `.env` sudah tersedia di root proyek dengan konfigurasi SQLite:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

4. **Inisialisasi Database SQLite & Tipe Prisma Client**:
   ```bash
   # Generasi Prisma Client
   npm run prisma:generate

   # Buat tabel dan skema database SQLite lokal
   npm run prisma:push
   ```

5. **Isi Data Awal / Seed Demo Data**:
   ```bash
   npm run prisma:seed
   ```
   *Perintah ini akan memasukkan data awal Kategori (Mouse, Keyboard, Printer, Tinta, Kabel), Merk (Logitech, Epson, Belden), Lokasi Storage, serta beberapa sampel unit fisik lengkap dengan Serial Number dan Log Mutasi awal.*

---

## 🖥️ Cara Menjalankan Aplikasi

### Mode Pengembangan (Development)

Jalankan perintah berikut di terminal:
```bash
npm run dev
```

Buka browser Anda dan akses aplikasi di:
👉 **[http://localhost:3000](http://localhost:3000)**

---

### Mode Produksi (Production Build)

Untuk membuat build produksi dan menjalankannya:
```bash
# 1. Build aplikasi
npm run build

# 2. Jalankan server produksi
npm run start
```

---

## 📂 Struktur Direktori Proyek

```text
├── .agent/               # Spesifikasi desain & konteks produk (DESIGN.md, PRODUCT_CONTEXT.md, dll)
├── prisma/
│   ├── schema.prisma     # Skema Prisma (Category, Brand, Location, Item, StockLog)
│   ├── seed.ts           # Script seeding data demo awal (Unit SN & Master Data)
│   └── dev.db            # Database SQLite lokal (otomatis dibuat & diabaikan oleh git)
├── src/
│   ├── app/
│   │   ├── actions/      # Server Actions Next.js (items.ts, master-data.ts, logs.ts)
│   │   ├── items/        # Halaman Inventaris, Management Unit SN & Opname
│   │   ├── categories/   # Halaman Master Kategori & Prefix SKU
│   │   ├── brands/       # Halaman Master Merk / Brand
│   │   ├── locations/    # Halaman Master Lokasi Storage
│   │   ├── logs/         # Halaman Complete Audit Trail Mutasi Stok
│   │   ├── globals.css   # Theme & styling Tailwind global
│   │   ├── layout.tsx    # Root Layout (Sidebar Navigation + Header)
│   │   └── page.tsx      # Dashboard Utama & Analytics Center
│   ├── components/       # Component UI (Item Modal, Status Modal, Mutasi Modal, Master Data Form)
│   └── lib/
│       ├── db.ts         # Singleton client instance Prisma Client
│       └── sku.ts        # Helper logika generator otomatisasi SKU
├── .env                  # File environment konfigurasi database
├── .gitignore            # Pengabaian secrets & build artifacts
├── package.json          # Dependency & script npm
└── README.md             # Dokumentasi panduan proyek
```

---

## 📊 Perintah Utility Database & Scripts

| Command | Keterangan |
| :--- | :--- |
| `npm run dev` | Menjalankan Next.js dev server pada `http://localhost:3000` |
| `npm run prisma:generate` | Memperbarui tipe Prisma Client setelah perubahan skema |
| `npm run prisma:push` | Menyinkronkan `schema.prisma` ke database SQLite (`dev.db`) |
| `npm run prisma:seed` | Mengisi data master awal dan unit sampel Serial Number |
| `npx prisma studio` | Membuka GUI database browser di `http://localhost:5555` |
| `npx prisma db push --force-reset` | Melakukan reset total database SQLite jika skema rusak |

---

## ⚠️ Troubleshooting & FAQ

### 1. Error `PrismaClientValidationError` atau Schema Out of Sync
Jika saat menjalankan aplikasi mengalami error Prisma Client, pastikan untuk menggenerate ulang client dan menyinkronkan database:
```bash
npm run prisma:generate
npm run prisma:push
```

### 2. Memperbaiki Serial Number Duplikat
Sistem menerapkan batasan **Unique** pada `serialNumber`. Jika menambahkan unit baru dengan Serial Number yang sudah ada di database, sistem akan menolak dan memberikan pesan peringatan detail Serial Number yang berbenturan.

### 3. Reset Database & Re-Seed
Jika ingin menghapus seluruh data percobaan dan kembali ke data awal:
```bash
npx prisma db push --force-reset
npm run prisma:seed
```

### 4. Nilai Enum Case-Sensitive
Enum `ItemCategoryType` (`DEVICE`, `BARANG`) dan `MutationType` (`IN`, `OUT`, `ADJUSTMENT`) pada skema Prisma bersifat **Strict Case-Sensitive (Huruf Kapital)**.
