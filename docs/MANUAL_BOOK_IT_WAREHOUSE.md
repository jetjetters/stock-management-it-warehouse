# MANUAL BOOK IT WAREHOUSE STOCK MANAGEMENT & ASSET TRACKING SYSTEM

Sistem Pengelolaan Stok, Audit Trail Opname, dan Berita Acara Serah Terima Inventaris IT

---

## DAFTAR ISI

1. Ringkasan Sistem
   - 1.1 Tentang Aplikasi
   - 1.2 Fitur Unggulan Sistem
   - 1.3 Karakteristik & Spesifikasi Sistem
2. Arsitektur & Teknologi
   - 2.1 Stack Teknologi & Dependensi
   - 2.2 Pola Arsitektur Layer
3. Struktur Direktori Proyek
   - 3.1 Struktur Folder Utama
   - 3.2 Penjelasan Direktori Penting
4. Konfigurasi Environment & Database
   - 4.1 File .env (Environment Variables)
   - 4.2 Konfigurasi Database Supabase & Connection Pooling
   - 4.3 Setup Prisma ORM Client
5. Database & Relasi Schema
   - 5.1 Skema Data Prisma Komprehensif
   - 5.2 Daftar Entitas Tabel Database
   - 5.3 Menjalankan Migrasi & Seeding Data
6. Alur Bisnis & Rules Sistem
   - 6.1 Klasifikasi Kategori: DEVICE vs BARANG (Consumables)
   - 6.2 Aturan Emas Mutasi Stok & Audit Trail
   - 6.3 Otomatisasi Penomoran SKU Unik ([PREFIX][SEQUENCE])
   - 6.4 Alur Peminjaman, Pemakaian & Penyerahan Barang Resmi
7. Panduan Antarmuka Pengguna & Modul Sistem (User Guide)
   - 7.1 Dashboard Utama & Metrik Inventaris
   - 7.2 Manajemen Inventaris & Stok Opname
   - 7.3 Formulir Pendaftaran Unit Inventaris Baru
   - 7.4 Manajemen Master Kategori & Prefix SKU
   - 7.5 Modal Tambah & Edit Kategori
   - 7.6 Manajemen Master Merk / Brand
   - 7.7 Modal Tambah Merk Baru
   - 7.8 Manajemen Master Lokasi Storage
   - 7.9 Modal Tambah Lokasi Baru
   - 7.10 Audit Log & Riwayat Mutasi Stok
   - 7.11 Penerbitan Berita Acara Serah Terima Barang (Handover)
   - 7.12 Riwayat & Arsip Surat Serah Terima
   - 7.13 Manajemen Master Petugas Penyerah Resmi (Giver)
   - 7.14 Modal Tambah Petugas Penyerah
   - 7.15 Standar Operasional Prosedur (SOP) & FAQ
   - 7.16 Kustomisasi Tampilan & Identitas Sistem (White-labeling)
8. Panduan Instalasi & Menjalankan Sistem
   - 8.1 Persyaratan Sistem (System Requirements)
   - 8.2 Langkah Instalasi Lokal Langkah demi Langkah
   - 8.3 Menjalankan Development Server
9. Panduan Deployment
   - 9.1 Deployment ke Netlify Serverless Runtime
   - 9.2 Konfigurasi Database Production (Supabase)
   - 9.3 Checklist Pasca-Deployment
10. Keamanan & Integritas Data
    - 10.1 Validasi Ketat Skema Data (Zod Validation)
    - 10.2 Immutability Audit Trail
    - 10.3 Proteksi Data Relasional (Cascade & Foreign Key)
11. Troubleshooting & Masalah Umum
    - 11.1 Error Koneksi Database Supabase
    - 11.2 Error Prisma Client Out-of-Sync
    - 11.3 Error Duplikasi Serial Number (SN) / Prefix SKU
    - 11.4 Penanganan Cache Aset
12. Pemeliharaan & Prosedur Backup
    - 12.1 Backup Database Rutin
    - 12.2 Prosedur Pemulihan Data (Restore)
    - 12.3 Pembaruan Dependensi Berkala

---

## 1. RINGKASAN SISTEM

### 1.1 Tentang Aplikasi

**IT Warehouse Stock Management & Asset Tracking System** adalah aplikasi berbasis web modern yang dirancang khusus untuk mengelola seluruh siklus hidup inventaris perangkat keras IT (*Devices*) dan bahan pendukung habis pakai (*Consumables/Barang*) di lingkungan internal kantor dan gudang operasional (khususnya implementasi PTK Shore Base Tanjung Batu).

Sistem ini memecahkan berbagai permasalahan klasik operasional gudang IT konvensional seperti:
- Pencatatan manual berbasis spreadsheet yang rentan manipulasi data dan *human error*.
- Ketidakjelasan status kepemilikan aset kantor (apakah aset berstatus Milik IT internal atau unit Sewa dari pihak ketiga).
- Tidak adanya bukti serah terima formal yang terdokumentasi saat perangkat diserahkan kepada staf/departemen.
- Perubahan kuantitas stok barang tanpa jejak audit trail yang jelas (siapa yang mengubah, kapan, dan untuk keperluan apa).

### 1.2 Fitur Unggulan Sistem

- **Strict Audit Trail (Gold Rule):** Setiap penambahan, pengurangan, dan koreksi opname stok wajib menghasilkan log mutasi permanen dengan alasan terperinci.
- **Categorization Split (DEVICE vs BARANG):** Pemisahan tegas antara aset bernomor seri individual (Laptop, PC, Monitor, Printer, Mouse) dengan bahan habis pakai (Kabel LAN, Tinta Printer, Kertas).
- **Automated SKU Generator:** Pembuatan nomor identitas barang unik berbasis kode prefix kategori (contoh: `MOS0001`, `PRN0001`, `LPT0001`).
- **Dependent Dynamic Master Data:** Relasi cerdas antara Kategori, Merk/Brand, dan Lokasi Penyimpanan dengan kapabilitas penambahan instan secara inline melalui modal dialog.
- **Official Handover Document Generator:** Penerbitan Berita Acara Serah Terima Barang (BAST) berstandar resmi siap cetak format A4 lengkap dengan nomor surat, tanda tangan pihak pertama (giver), dan pihak kedua (receiver).
- **Multi-Theme Dynamic Engine:** Kustomisasi tema warna dinamis (Pertamina Signature, Ocean Blue, Emerald Forest, Royal Violet, Sunset Amber, dan Executive Dark) serta pengaturan logo aplikasi dan logo berita acara serah terima secara fleksibel.

### 1.3 Karakteristik & Spesifikasi Sistem

| Aspek | Spesifikasi |
| :--- | :--- |
| **Arsitektur Aplikasi** | Fullstack Next.js App Router (React Server Components + Server Actions) |
| **Bahasa Pemrograman** | TypeScript 5.x (Strict Type Safety) |
| **Styling & Desain** | Tailwind CSS + Radix UI Primitives + Lucide React Icons |
| **Basis Data** | PostgreSQL (Supabase Cloud Database dengan Supavisor Pooling) |
| **ORM Layer** | Prisma ORM 6.x |
| **Validasi Skema** | Zod + React Hook Form |
| **Runtime Target** | Node.js 18+ / Netlify Serverless Next.js Runtime |

---

## 2. ARSITEKTUR & TEKNOLOGI

### 2.1 Stack Teknologi & Dependensi

Sistem dibangun di atas fondasi teknologi web modern terkini:

```json
{
  "dependencies": {
    "next": "^14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@prisma/client": "^6.2.1",
    "zod": "^3.23.8",
    "react-hook-form": "^7.53.1",
    "@hookform/resolvers": "^3.9.1",
    "lucide-react": "^0.453.0",
    "tailwind-merge": "^2.5.4",
    "clsx": "^2.1.1"
  },
  "devDependencies": {
    "typescript": "^5.6.3",
    "tailwindcss": "^3.4.14",
    "prisma": "^6.2.1",
    "tsx": "^4.19.1",
    "postcss": "^8.4.47",
    "autoprefixer": "^10.4.20"
  }
}
```

### 2.2 Pola Arsitektur Layer

```
+------------------------------------------------------------------------+
|                          USER ACCESS LAYER                             |
|  - Web Browser / Desktop Client                                        |
|  - Print Mode Layout (Berita Acara Serah Terima Standar A4)            |
+------------------------------------------------------------------------+
                                   |
                                   v
+------------------------------------------------------------------------+
|                      PRESENTATION LAYER (Next.js)                      |
|  - App Router: /, /items, /categories, /brands, /locations, /handovers |
|  - Client Components: Dynamic Filtering, Tabs, Inline Creation Modals  |
|  - Providers: CustomizationProvider (Dynamic Multi-Theme Engine)       |
+------------------------------------------------------------------------+
                                   |
                                   v
+------------------------------------------------------------------------+
|                 ROUTING & SERVER ACTIONS LAYER (App Router)            |
|  - actions/items.ts       : CRUD Item, SKU Generator, Mutasi Stok      |
|  - actions/master-data.ts : CRUD Kategori, Merk, Lokasi, Petugas Giver |
|  - actions/handovers.ts   : Penerbitan & Pembatalan Surat Serah Terima |
|  - actions/config.ts      : Pengaturan Logo & Tema Warna Sistem        |
+------------------------------------------------------------------------+
                                   |
                                   v
+------------------------------------------------------------------------+
|                  BUSINESS LOGIC & VALIDATION LAYER                     |
|  - Zod Schema Validation: Input Payload & Form Strict Type Rules       |
|  - SKU Generator Engine: Inisial Prefix + 4 Digit Sequence Auto-pad   |
|  - Stock Mutation Engine: Deteksi Selisih (+IN, -OUT, ADJUSTMENT)     |
|  - Audit Log Creator: Pencatatan Log Otomatis di Setiap Mutasi         |
+------------------------------------------------------------------------+
                                   |
                                   v
+------------------------------------------------------------------------+
|                         DATA ACCESS LAYER (ORM)                        |
|  - Prisma ORM 6.x (Auto-generated Types & Relational Mapping)          |
+------------------------------------------------------------------------+
                                   |
                                   v
+------------------------------------------------------------------------+
|                         DATABASE STORAGE LAYER                         |
|  - PostgreSQL via Supabase Cloud (Supavisor Connection Pooling)        |
|  - Entitas: categories, brands, locations, items, stock_logs,          |
|             officers, handovers, handover_items, app_config            |
+------------------------------------------------------------------------+
```

---

## 3. STRUKTUR DIREKTORI PROYEK

### 3.1 Struktur Folder Utama

```
stock-management-it-warehouse/
├── .agent/                       # Konfigurasi panduan asisten dan desain
│   ├── AGENTS.md
│   ├── DESIGN.md
│   ├── GEMINI.md
│   └── PRODUCT_CONTEXT.md
├── docs/                         # Dokumentasi sistem & aset panduan
│   ├── ERD.svg                   # Diagram relasi entitas basis data
│   ├── images/                   # Tangkapan layar antarmuka pengguna
│   ├── NEXTJS_BUILD_VS_DEV.md
│   └── MANUAL_BOOK_IT_WAREHOUSE.md
├── prisma/                       # Konfigurasi ORM & migrasi basis data
│   ├── schema.prisma             # Skema Prisma utama
│   └── seed.ts                   # Data awal (seeder) master data
├── public/                       # Berkas aset statis publik (logo, gambar)
│   ├── logo.png
│   ├── pertamina-pl.png
│   └── favicon.ico
├── src/
│   ├── app/                      # Next.js App Router (Halaman & Rute)
│   │   ├── actions/              # Server Actions (Mutasi Data Backend)
│   │   │   ├── config.ts
│   │   │   ├── handovers.ts
│   │   │   ├── items.ts
│   │   │   └── master-data.ts
│   │   ├── brands/               # Modul Master Merk
│   │   ├── categories/           # Modul Master Kategori
│   │   ├── customization/        # Modul Kustomisasi Tampilan
│   │   ├── handovers/            # Modul Berita Acara Serah Terima
│   │   ├── items/                # Modul Inventaris & Stok Opname
│   │   ├── locations/            # Modul Master Lokasi Storage
│   │   ├── logs/                 # Modul Riwayat Audit Mutasi Stok
│   │   ├── officers/             # Modul Master Petugas Penyerah
│   │   ├── procedure/            # Modul Panduan SOP & FAQ Gudang IT
│   │   ├── globals.css           # CSS Global & Dynamic Theme Engine
│   │   ├── layout.tsx            # Root Layout Aplikasi
│   │   └── page.tsx              # Halaman Dashboard Utama
│   ├── components/               # Komponen Antarmuka Pengguna
│   │   ├── brands/
│   │   ├── categories/
│   │   ├── customization/
│   │   ├── handovers/
│   │   ├── items/
│   │   ├── layout/               # Navbar, Sidebar, TopLoadingBar
│   │   ├── locations/
│   │   ├── logs/
│   │   ├── officers/
│   │   ├── procedure/
│   │   ├── providers/            # CustomizationProvider
│   │   └── ui/                   # Modal konfirmasi, modal sukses, dsb.
│   └── lib/                      # Utilitas & Konfigurasi Bantuan
│       ├── color-utils.ts        # Kalkulasi kontras warna & tema
│       ├── config.ts             # Nilai konfigurasi bawaan sistem
│       └── db.ts                 # Instansiasi PrismaClient tunggal (Singleton)
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

### 3.2 Penjelasan Direktori Penting

- **`src/app/actions/`**: Berisi seluruh Server Actions Next.js yang menangani manipulasi data backend secara aman dan langsung terhubung dengan Prisma Client tanpa memerlukan boilerplate API route REST konvensional.
- **`src/components/`**: Berisi komponen antarmuka yang terisolasi rapi berdasarkan domain fungsionalitas (items, categories, brands, locations, handovers, dsb.).
- **`src/lib/db.ts`**: Menjamin koneksi Prisma Client bersifat tunggal (*singleton pattern*) agar tidak terjadi kehabisan koneksi (*connection exhaustion*) pada lingkungan serverless/development.

---

## 4. KONFIGURASI ENVIRONMENT & DATABASE

### 4.1 File .env (Environment Variables)

Aplikasi membutuhkan konfigurasi kredensial basis data PostgreSQL. Buat berkas `.env` pada direktori root proyek dengan format berikut:

```env
# Koneksi Database Supabase melalui Supavisor Connection Pooling (Port 6543)
DATABASE_URL="postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Koneksi Langsung ke Basis Data untuk Migrasi Prisma (Port 5432)
DIRECT_URL="postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Port Default Aplikasi (Opsional)
PORT=3000
```

> **CATATAN PENTING KEAMANAN:** Berkas `.env` berisi kredensial rahasia. Jangan pernah mengunggah (*commit*) berkas ini ke dalam repository publik Git. Gunakan berkas `.env.example` sebagai template referensi bersama tim.

### 4.2 Konfigurasi Database Supabase & Connection Pooling

Aplikasi dirancang untuk bekerja optimal dengan PostgreSQL yang di-hosting di Supabase:
- **`DATABASE_URL`**: Menggunakan port `6543` dengan parameter `?pgbouncer=true`. Konfigurasi ini menghubungkan aplikasi ke Supavisor (Connection Pooler) sehingga aman untuk query konkuren tinggi dan serverless runtime.
- **`DIRECT_URL`**: Menggunakan port `5432` untuk koneksi langsung (Direct Connection). Jalur ini khusus digunakan oleh CLI Prisma saat mengeksekusi `prisma db push` atau `prisma migrate`.

### 4.3 Setup Prisma ORM Client

Inisialisasi Prisma Client dikelola secara terpusat pada berkas `src/lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## 5. DATABASE & RELASI SCHEMA

### 5.1 Skema Data Prisma Komprehensif

Berikut adalah skema basis data lengkap yang didefinisikan pada `prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum ItemCategoryType {
  DEVICE
  BARANG
}

enum MutationType {
  IN
  OUT
  ADJUSTMENT
}

model Category {
  id          String           @id @default(uuid())
  name        String           @unique
  type        ItemCategoryType
  codePrefix  String           @unique
  
  brands      Brand[]
  items       Item[]

  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  @@map("categories")
}

model Brand {
  id          String   @id @default(uuid())
  name        String
  
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  
  items       Item[]

  createdAt   DateTime @default(now())

  @@unique([name, categoryId])
  @@map("brands")
}

model Location {
  id          String     @id @default(uuid())
  name        String     @unique
  description String?
  
  items       Item[]
  stockLogs   StockLog[]

  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@map("locations")
}

model Item {
  id              String           @id @default(uuid())
  serialNumber    String           @unique
  itemCode        String
  name            String
  type            ItemCategoryType
  description     String?
  status          String           @default("TERSEDIA")
  ownershipStatus String?          @default("MILIK_IT")

  categoryId      String
  category        Category         @relation(fields: [categoryId], references: [id])

  brandId         String
  brand           Brand            @relation(fields: [brandId], references: [id])

  locationId      String
  location        Location         @relation(fields: [locationId], references: [id])

  stockLogs       StockLog[]

  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  @@index([categoryId, brandId, locationId])
  @@index([itemCode])
  @@map("items")
}

model StockLog {
  id          String       @id @default(uuid())
  
  itemId      String
  item        Item         @relation(fields: [itemId], references: [id], onDelete: Cascade)

  locationId  String
  location    Location     @relation(fields: [locationId], references: [id])

  mutation    Int
  type        MutationType
  notes       String
  
  createdAt   DateTime     @default(now())

  @@index([itemId, createdAt])
  @@map("stock_logs")
}

model Officer {
  id        String   @id @default(uuid())
  name      String   @unique
  role      String?  @default("IT Staff")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("officers")
}

model Handover {
  id            String   @id @default(uuid())
  documentNo    String   @unique
  locationName  String   @default("PTK Shore Base Tanjung Batu")
  giverName     String
  recipientName String
  remarks       String?
  handoverDate  DateTime @default(now())
  
  items         HandoverItem[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("handovers")
}

model HandoverItem {
  id         String   @id @default(uuid())
  handoverId String
  handover   Handover @relation(fields: [handoverId], references: [id], onDelete: Cascade)
  
  itemId     String?
  deviceName String
  serialNo   String
  brandName  String
  recipient  String
  remarks    String?

  @@map("handover_items")
}

model AppConfig {
  id                     String   @id @default("default")
  appTitle               String   @default("IT Warehouse")
  appSubtitle            String   @default("PSTB")
  appLogo                String?
  handoverLogo           String?
  handoverTitle          String   @default("BERITA ACARA SERAH TERIMA BARANG")
  handoverLocation       String   @default("PTK Shore Base Tanjung Batu")
  primaryColor           String   @default("#b90051")
  backgroundColor        String   @default("#f8fafc")
  cardBackgroundColor    String   @default("#ffffff")
  cardBorderColor        String   @default("#e2e8f0")
  sidebarBackgroundColor String   @default("#ffffff")
  updatedAt              DateTime @updatedAt

  @@map("app_config")
}
```

### 5.2 Daftar Entitas Tabel Database

| Nama Tabel | Deskripsi Fungsi | Primary Key & Relasi Kunci |
| :--- | :--- | :--- |
| `categories` | Menyimpan jenis klasifikasi (Device vs Barang) dan inisial kode SKU unik | `id` (UUID), `codePrefix` (Unique) |
| `brands` | Menyimpan merk barang yang terikat pada kategori tertentu | `id` (UUID), Relasi ke `categories.id` (Cascade) |
| `locations` | Menyimpan daftar titik penyimpanan fisik aset / gudang storage | `id` (UUID), `name` (Unique) |
| `items` | Menyimpan identitas fisik per unit aset (SN, SKU, nama, tipe, status) | `id` (UUID), `serialNumber` (Unique), Relasi ke Kategori, Merk, Lokasi |
| `stock_logs` | Menyimpan histori permanen mutasi kuantitas stok (+/-) beserta alasan | `id` (UUID), Relasi ke `items.id` dan `locations.id` |
| `officers` | Menyimpan daftar nama staf IT yang berwenang sebagai penyerah resmi | `id` (UUID), `name` (Unique) |
| `handovers` | Menyimpan header surat Berita Acara Serah Terima Barang | `id` (UUID), `documentNo` (Unique) |
| `handover_items` | Menyimpan rincian item barang yang diserahkan dalam nomor BAST | `id` (UUID), Relasi ke `handovers.id` (Cascade) |
| `app_config` | Menyimpan konfigurasi identitas visual (logo, nama instansi, skema warna) | `id` = 'default' (Singleton Record) |

### 5.3 Menjalankan Migrasi & Seeding Data

Untuk sinkronisasi skema ke database dan mengisi data master awal:

```bash
# 1. Menghasilkan Prisma Client types
npx prisma generate

# 2. Mendorong skema ke database Supabase
npx prisma db push

# 3. Menjalankan data seeding awal (Master Kategori, Merk, Lokasi, Petugas)
npm run prisma:seed
```

---

## 6. ALUR BISNIS & RULES SISTEM

### 6.1 Klasifikasi Kategori: DEVICE vs BARANG (Consumables)

Sistem membedakan secara tegas dua jenis entitas inventaris:

1. **DEVICE (Perangkat Keras):**
   - Karakteristik: Perangkat berwujud fisik yang memiliki masa pakai panjang dan nilai investasi.
   - Contoh: Laptop, Desktop PC, Monitor, Printer, Scanner, Mouse, Keyboard.
   - **Aturan Khusus:** Wajib memiliki Nomor Seri individual unik (*Serial Number*). Memiliki parameter Status Kepemilikan (*Milik IT* internal vs *Sewa* dari pihak ketiga). Wajib dibuatkan Surat Berita Acara saat diserahkan.
2. **BARANG (Consumables / Bahan Habis Pakai):**
   - Karakteristik: Bahan penunjang operasional kantor yang dapat habis digunakan.
   - Contoh: Kabel UTP RJ45, Konektor, Tinta Printer, Ribbon, Kertas HVS.
   - **Aturan Khusus:** Serial number bersifat opsional (dapat berupa nomor batch lot atau kode identitas generik). Status kepemilikan tidak berlaku (selalu milik perusahaan).

### 6.2 Aturan Emas Mutasi Stok & Audit Trail

Stok barang pada sistem **TIDAK PERNAH DIUBAH SECARA IMPLISIT**. Setiap perubahan kuantitas wajib melalui pencatatan mutasi formal:
- **Tipe `IN` (Penambahan):** Pengadaan barang baru, donasi unit, atau pengembalian barang dari peminjam.
- **Tipe `OUT` (Pengurangan):** Pemakaian unit untuk operasional, peminjaman barang ke departemen lain, atau disposal barang rusak.
- **Tipe `ADJUSTMENT` (Koreksi Opname):** Penyesuaian angka stok hasil perhitungan fisik langsung di gudang dengan mencantumkan alasan selisih.

### 6.3 Otomatisasi Penomoran SKU Unik ([PREFIX][SEQUENCE])

Format kode barang unik dibuat secara otomatis dengan aturan:
`[KODE_PREFIX][4_DIGIT_ANGKA]`
- Contoh Kategori Mouse dengan prefix `MOS` -> SKU pertama: `MOS0001`, selanjutnya: `MOS0002`.
- Contoh Kategori Printer dengan prefix `PRN` -> SKU pertama: `PRN0001`.
- Contoh Kategori Tinta dengan prefix `TNT` -> SKU pertama: `TNT0001`.

Jika nama kategori atau prefix diedit di kemudian hari, generator SKU selanjutnya akan melanjutkan urutan nomor terakhir tanpa merusak kode barang lama yang telah diterbitkan.

### 6.4 Alur Peminjaman, Pemakaian & Penyerahan Barang Resmi

1. Staf IT mendaftarkan unit barang ke dalam sistem.
2. Saat barang berpindah tangan atau diserahkan ke pengguna akhir (*end-user*), staf IT menerbitkan **Berita Acara Serah Terima Barang**.
3. Sistem secara otomatis mencatat nama pihak penyerah resmi (*giver*) dan rincian pihak penerima (*receiver*).
4. Status unit diperbarui menjadi `DIGUNAKAN` atau `DIPINJAM`, dan sistem mencatat riwayat mutasi stok `OUT`.
5. Dokumen berita acara dapat langsung dicetak format A4 untuk ditandatangani basah oleh kedua belah pihak sebagai bukti audit resmi.

---

## 7. PANDUAN ANTARMUKA PENGGUNA & MODUL SISTEM (USER GUIDE)

Berikut adalah panduan lengkap navigasi dan penggunaan setiap halaman fitur aplikasi disertai tangkapan layar antarmuka:

---

### 7.1 Dashboard Utama & Metrik Inventaris

Halaman ringkasan eksekutif yang menampilkan statistik inventaris secara *real-time*, ringkasan aset milik kantor vs sewa, tombol aksi cepat, serta 5 riwayat mutasi stok terkini.

![Tampilan Dashboard Utama](images/hal-dashboard.png)

**Langkah & Informasi Antarmuka:**
1. **Kartu Metrik Utama:** Menampilkan Total Inventaris, Total Perangkat (Device), Total Consumable (Barang), Aset Milik IT, Unit Sewa, dan Total Lokasi Storage.
2. **Pintasan Aksi Cepat:** Tombol langsung menuju Tambah Unit, Cetak Surat Serah Terima, Kelola Kategori, Merk, Lokasi, dan Petugas.
3. **Tabel 5 Log Mutasi Terakhir:** Menampilkan pantauan audit mutasi terbaru secara instan.

---

### 7.2 Manajemen Inventaris & Stok Opname

Pusat kendali seluruh unit barang tersimpan. Mendukung dua mode tampilan: **Mode Berkelompok (Grouped by Category)** untuk pengawasan ringkas per jenis barang, dan **Mode Rinci Tabular** untuk audit teknis menyeluruh.

![Tampilan Halaman Inventaris](images/hal-inventaris-stok.png)

**Fitur Navigasi:**
1. **Tab Filter Cepat:** Memfilter tampilan antara SEMUA INVENTARIS, PERANGKAT (DEVICE), dan CONSUMABLES (BARANG).
2. **Filter Kepemilikan:** Memisahkan perangkat MILIK IT dan unit SEWA.
3. **Filter Lokasi & Status:** Menyaring barang berdasarkan posisi gudang penyimpanan dan kondisi ketersediaan.
4. **Expandable Serial Number Row:** Mengklik tombol rincian unit akan menampilkan seluruh Serial Number (SN) fisik yang terdaftar pada model tersebut.
5. **Tombol Aksi per Baris:** Tersedia tombol Edit Info Barang, Edit Stok Opname (+ / -), Cetak Form Serah Terima, dan Hapus Item.

---

### 7.3 Formulir Pendaftaran Unit Inventaris Baru

Formulir penambahan aset baru dengan integrasi *dependent dropdown* cerdas.

![Formulir Tambah Unit Inventaris](images/hal-tambahunit.png)

**Langkah Pengisian:**
1. Masukkan **Nama Barang / Model Spesifik** (contoh: *ThinkPad E14 Gen 4*).
2. Pilih **Kategori Master** (misal: *Laptop*). Sistem otomatis mengunci klasifikasi *DEVICE*.
3. Pilih **Merk / Brand** (dropdown otomatis menampilkan merk yang relevan dengan kategori terpilih).
4. Pilih **Lokasi Storage** tempat barang disimpan pertama kali.
5. Untuk jenis *DEVICE*, tentukan **Status Kepemilikan** (*MILIK IT* atau *SEWA*).
6. Masukkan **Serial Number (SN)** fisik unit.
7. Klik **Simpan Unit Inventaris**. Sistem akan otomatis men-generate kode SKU unik.

---

### 7.4 Manajemen Master Kategori & Prefix SKU

Halaman untuk mengelola klasifikasi jenis inventaris (Device vs Barang) dan menentukan kode awalan penomoran SKU otomatis.

![Halaman Daftar Kategori](images/hal-daftarcategory.png)

**Fitur:**
- Kartu kategori dengan kode prefix SKU yang jelas (contoh: `[KBL]`, `[KBD]`, `[LPT]`, `[MOS]`).
- Badge jenis klasifikasi (`DEVICE` vs `BARANG`).
- Accordion **Daftar Barang** untuk melihat ringkasan item yang bernaung di bawah kategori tersebut.
- Tombol Tambah Kategori Baru, Edit, dan Hapus.

---

### 7.5 Modal Tambah & Edit Kategori

Dialog pop-up untuk membuat kategori baru tanpa meninggalkan halaman kerja.

![Modal Tambah Kategori](images/hal-tambahcategory.png)

**Parameter Form:**
1. **Nama Kategori:** Nama kategori inventaris (contoh: *Monitor Desktop*).
2. **Klasifikasi Tipe:** Pilihan radio button tegas antara *DEVICE (Aset Perangkat)* atau *BARANG (Consumables)*.
3. **Inisial Prefix Kode SKU:** Maksimal 6 karakter huruf kapital unik (contoh: *MON*).

---

### 7.6 Manajemen Master Merk / Brand

Halaman pengelolaan data merk dagang produsen aset. Merk terikat langsung ke kategori induknya untuk menjaga kerapian data.

![Halaman Daftar Merk](images/hal-brand.png)

**Informasi Antarmuka:**
- Menampilkan nama merk dan kategori induk yang menaunginya (contoh: *Logitech* di bawah *Mouse*).
- Menampilkan metrik jumlah total item yang menggunakan merk tersebut.
- Dropdown rincian item barang per merk.

---

### 7.7 Modal Tambah Merk Baru

Dialog pembuatan merk baru dengan pemetaan kategori induk.

![Modal Tambah Merk](images/hal-tambahbrand.png)

**Parameter Form:**
1. **Nama Merk:** Contoh: *Lenovo*, *HP*, *Epson*, *Belden*.
2. **Kategori Induk:** Memilih kategori yang berhak menggunakan merk ini.

---

### 7.8 Manajemen Master Lokasi Storage

Halaman pengelolaan titik lokasi fisik penyimpanan barang di seluruh area gedung/gudang.

![Halaman Daftar Lokasi](images/hal-lokasi.png)

**Fitur:**
- Kartu informasi nama lokasi dan deskripsi ruang/rak.
- Metrik jumlah total item yang tersimpan di lokasi tersebut.
- Metrik jumlah riwayat audit mutasi stok yang terjadi di lokasi tersebut.
- Accordion daftar item barang per lokasi.

---

### 7.9 Modal Tambah Lokasi Baru

Dialog penambahan titik lokasi storage gudang baru.

![Modal Tambah Lokasi](images/hal-tambahloc.png)

**Parameter Form:**
1. **Nama Lokasi:** Contoh: *Warehouse IT*, *Server Room Lt.2*, *Rack A-01*.
2. **Deskripsi Ruang:** Informasi petunjuk fisik ruang penyimpanan (opsional).

---

### 7.10 Audit Log & Riwayat Mutasi Stok

Buku besar digital (*digital ledger*) yang mencatat setiap peristiwa pergerakan stok secara permanen dan tidak dapat diubah-ubah (*immutable*).

![Halaman Audit Log Mutasi Stok](images/hal-auditlog.png)

**Elemen Informasi:**
- **Waktu & Tanggal Kejadian:** Waktu pencatatan mutasi secara presisi.
- **Nama Item & SKU:** Identitas unit barang yang bermutasi.
- **Lokasi Penyimpanan:** Posisi storage fisik tempat mutasi terjadi.
- **Tipe Mutasi & Nilai:** Badge warna hijau untuk `IN (+X)`, merah untuk `OUT (-X)`, dan kuning untuk `ADJUSTMENT`.
- **Catatan / Alasan Aktivitas:** Penjelasan kontekstual (contoh: *"Pengadaan 10 unit dari vendor"*, *"Dipinjam staf operasional"*).

---

### 7.11 Penerbitan Berita Acara Serah Terima Barang (Handover)

Formulir resmi pembuatan dokumen Berita Acara Serah Terima Barang (BAST) antar pihak.

![Formulir Buat Surat Serah Terima](images/hal-buatsurat.png)

**Langkah Penerbitan:**
1. **Nomor Dokumen:** Sistem mengisi nomor otomatis atau dapat disesuaikan manual.
2. **Lokasi Penyerahan:** Contoh: *PTK Shore Base Tanjung Batu*.
3. **Pihak Pertama (Penyerah / Giver):** Dipilih dari master data Petugas Resmi IT.
4. **Pihak Kedua (Penerima / Receiver):** Memasukkan Nama Penerima, Jabatan/Departemen, dan Institusi/Perusahaan.
5. **Daftar Barang yang Diserahkan:** Memilih unit barang dari inventaris atau memasukkan serial number yang diserahkan.
6. Klik **Terbitkan Berita Acara**.

---

### 7.12 Riwayat & Arsip Surat Serah Terima

Daftar seluruh dokumen Berita Acara yang telah berhasil diterbitkan ke dalam sistem.

![Daftar Riwayat Serah Terima](images/hal-list-serahterima.png)

**Fitur:**
- Pencarian surat berdasarkan nomor BAST atau nama pihak penerima.
- Tombol **Lihat Dokumen / Cetak PDF:** Membuka tampilan cetak bersih A4 berstandar resmi siap cetak ke printer fisik atau disimpan sebagai PDF digital.
- Tombol Hapus/Batalkan Dokumen.

---

### 7.13 Manajemen Master Petugas Penyerah Resmi (Giver)

Pengelolaan data staf internal IT yang memiliki otorisasi resmi untuk menyerahkan aset perusahaan kepada pengguna lain.

![Daftar Petugas Surat](images/hal-petugassurat.png)

**Informasi Antarmuka:**
- Daftar nama petugas penyerah.
- Jabatan/Peran staf (*IT Staff*, *IT Lead*, *Warehouse Officer*).
- Status hak akses resmi penyerahan barang (*Penyerah Resmi*).

---

### 7.14 Modal Tambah Petugas Penyerah

Dialog penambahan staf baru sebagai petugas penyerah resmi.

![Modal Tambah Petugas](images/hal-tambahpetugas.png)

**Parameter Form:**
1. **Nama Lengkap Petugas:** Nama lengkap beserta gelar jika relevan.
2. **Jabatan / Role:** Jabatan fungsional staf dalam organisasi IT.

---

### 7.15 Standar Operasional Prosedur (SOP) & FAQ

Halaman panduan operasional terpadu yang memuat alur kerja standar pengelolaan inventaris gudang IT, tabel perbandingan hak akses, serta tanya-jawab seputar inventaris.

![Halaman Prosedur & SOP](images/hal-prosedur.png)

**Konten Utama:**
- Banner Prosedur Utama Penerimaan, Pengeluaran, dan Audit Opname Fisik.
- Tabel Perbandingan Kriteria: DEVICE vs BARANG (Consumable).
- Accordion FAQ Interaktif yang membahas troubleshooting operasional sehari-hari.

---

### 7.16 Kustomisasi Tampilan & Identitas Sistem (White-labeling)

Modul kustomisasi visual untuk mengubah identitas branding sistem sesuai instansi Anda.

![Halaman Kustomisasi Tampilan](images/hal-kustomisasi.png)

**Kemampuan Kustomisasi:**
1. **Unggah Logo Aplikasi:** Logo sistem pada sidebar dan navigasi atas (format PNG/JPG maks 1MB).
2. **Unggah Logo BAST:** Logo resmi instansi yang muncul di kop surat Berita Acara Serah Terima.
3. **Preset Skema Tema:** Tersedia 6 tema warna siap pakai:
   - *Pertamina Signature* (Merah Marun & Light Rose)
   - *Ocean Blue* (Biru Langit & Cyan)
   - *Emerald Forest* (Hijau Zamrud & Mint)
   - *Royal Violet* (Ungu Elegan & Lavender)
   - *Sunset Amber* (Emas Hangat & Amber)
   - *Executive Dark* (Sleek Dark Navy & Royal Blue)
4. **Custom Color Picker:** Penyesuaian heksadesimal mandiri untuk Primary Color, Background, Card Background, dan Sidebar Background dengan kalkulasi kontras warna otomatis.

---

## 8. PANDUAN INSTALASI & MENJALANKAN SISTEM

### 8.1 Persyaratan Sistem (System Requirements)

- **Operating System:** Windows 10/11, macOS, atau Linux (Ubuntu 20.04+)
- **Node.js:** Versi 18.18.0 atau lebih tinggi (disarankan Node.js 20 LTS atau Node.js 22+)
- **NPM:** Versi 9.x atau lebih tinggi
- **Koneksi Internet:** Diperlukan untuk mengakses basis data PostgreSQL Supabase Cloud
- **Web Browser:** Google Chrome, Microsoft Edge, Mozilla Firefox, atau Safari versi terbaru

### 8.2 Langkah Instalasi Lokal Langkah demi Langkah

Jalankan perintah berikut pada terminal PowerShell atau Bash:

```bash
# 1. Clone repositori ke komputer lokal
git clone https://github.com/Jetro/stock-management-it-warehouse.git
cd stock-management-it-warehouse

# 2. Instal seluruh dependensi paket Node.js
npm install

# 3. Buat dan konfigurasikan file .env
cp .env.example .env
# Edit berkas .env dan masukkan koneksi DATABASE_URL dan DIRECT_URL Supabase Anda

# 4. Generate Prisma Client
npx prisma generate

# 5. Sinkronisasi skema basis data
npx prisma db push

# 6. Jalankan seeder master data awal (opsional jika basis data masih kosong)
npm run prisma:seed
```

### 8.3 Menjalankan Development Server

Untuk menjalankan server pengembangan lokal:

```bash
npm run dev
```

Aplikasi akan berjalan dan dapat diakses melalui peramban web pada alamat:
`http://localhost:3000`

> **PERINGATAN ATURAN PENGEMBANGAN:** Jangan menjalankan perintah `npm run build` selama server dev sedang aktif atau dalam proses pengembangan aktif, karena proses pembersihan build Next.js dapat menghapus aset CSS sementara pada dev server.

---

## 9. PANDUAN DEPLOYMENT

### 9.1 Deployment ke Netlify Serverless Runtime

Proyek ini telah dikonfigurasi dengan plugin `@netlify/plugin-nextjs` dan berkas `netlify.toml` untuk deployment instan dengan biaya nol (*zero-cost serverless*):

1. **Hubungkan Repositori ke Netlify:**
   - Buka dashboard Netlify (`app.netlify.com`).
   - Pilih **Add new site** > **Import an existing project** > Pilih repositori GitHub ini.
2. **Atur Build Settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
3. **Konfigurasi Environment Variables di Netlify:**
   - Masuk ke menu **Site configuration** > **Environment variables**.
   - Tambahkan variabel:
     - `DATABASE_URL` (Connection pooler Supabase port 6543)
     - `DIRECT_URL` (Direct connection Supabase port 5432)
4. **Deploy Site:**
   - Klik **Deploy site**. Netlify akan membangun bundle serverless dan menyediakan URL produksi beralamat HTTPS otomatis.

### 9.2 Konfigurasi Database Production (Supabase)

Untuk basis data produksi di Supabase:
- Aktifkan fitur **Connection Pooling** di menu *Project Settings* > *Database* > *Connection Pooling*.
- Pilih mode **Transaction** untuk operasi pooler.
- Pastikan IP Network Allowlist (jika diaktifkan) mengizinkan koneksi dari serverless edge network Netlify (`0.0.0.0/0`).

### 9.3 Checklist Pasca-Deployment

- [ ] Variabel `DATABASE_URL` dan `DIRECT_URL` terisi valid di dashboard hosting.
- [ ] Berhasil membuka halaman Dashboard utama tanpa pesan kegagalan koneksi basis data.
- [ ] Menguji pendaftaran satu unit barang baru di halaman `/items/new`.
- [ ] Menguji penerbitan satu Berita Acara Serah Terima di halaman `/handovers/new`.
- [ ] Memastikan fitur print layout pada BAST berfungsi rapi dan bersih.
- [ ] Menguji penggantian logo instansi pada menu `/customization`.

---

## 10. KEAMANAN & INTEGRITAS DATA

### 10.1 Validasi Ketat Skema Data (Zod Validation)

Seluruh data input yang masuk melalui modal atau formulir divalidasi lapis ganda di sisi client dan server menggunakan skema Zod:
- Pencegahan nilai string kosong untuk entitas unik (*codePrefix*, *serialNumber*, *documentNo*).
- Sanitasi teks otomatis huruf kapital pada prefix SKU (`toUpperCase()`).
- Validasi rentang angka mutasi stok untuk mencegah kuantitas bernilai negatif yang tidak terdefinisi.

### 10.2 Immutability Audit Trail

Tabel `StockLog` dirancang dengan prinsip *append-only*. Sistem tidak menyediakan tombol antarmuka untuk mengedit atau menghapus baris log mutasi secara sepihak. Setiap koreksi kesalahan perhitungan stok wajib dilakukan melalui pencatatan mutasi baru bertipe `ADJUSTMENT`.

### 10.3 Proteksi Data Relasional (Cascade & Foreign Key)

Integritas relasi antar tabel dilindungi oleh konstrain basis data PostgreSQL:
- Menghapus kategori master yang memiliki merk terkait akan memicu tindakan *Cascade* atau diproteksi jika terdapat item yang masih aktif menggunakannya.
- Setiap riwayat mutasi stok terikat langsung dengan ID barang dan ID lokasi penyimpanan melalui *Foreign Key Constraints*.

---

## 11. TROUBLESHOOTING & MASALAH UMUM

### 11.1 Error Koneksi Database Supabase

- **Penyebab:** Kredensial URL salah atau batas koneksi terlampaui (*max connections reached*).
- **Solusi:** Pastikan `DATABASE_URL` menggunakan port pooler `6543` dengan ekstensi parameter `?pgbouncer=true`. Periksa status kuota koneksi pada dashboard Supabase Database Health.

### 11.2 Error Prisma Client Out-of-Sync

- **Gejala:** Muncul pesan error seperti `Property 'ownershipStatus' does not exist on type...`.
- **Penyebab:** Prisma client belum di-generate ulang setelah pembaruan berkas skema.
- **Solusi:** Jalankan perintah `npx prisma generate` lalu restart server Next.js.

### 11.3 Error Duplikasi Serial Number (SN) / Prefix SKU

- **Gejala:** Gagal menyimpan item dengan pesan `Unique constraint failed on the fields: (serialNumber)`.
- **Penyebab:** Unit dengan Serial Number fisik tersebut sudah pernah didaftarkan sebelumnya di sistem.
- **Solusi:** Gunakan fitur pencarian di halaman Inventaris untuk memeriksa riwayat unit dengan nomor seri tersebut, atau periksa kembali kebenaran fisik SN yang tertera pada badan perangkat.

### 11.4 Penanganan Cache Aset

- **Gejala:** Tampilan warna tema atau logo baru belum berubah setelah disimpan di menu kustomisasi.
- **Solusi:** Lakukan *Hard Reload* pada peramban web dengan menekan kombinasi tombol `Ctrl + Shift + R` (Windows) atau `Cmd + Shift + R` (Mac).

---

## 12. PEMELIHARAAN & PROSEDUR BACKUP

### 12.1 Backup Database Rutin

Disarankan melakukan pencadangan data (*dump*) PostgreSQL secara berkala:

```bash
# Backup langsung via pg_dump CLI
pg_dump "postgres://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres" -F c -b -v -f "it_warehouse_backup_$(date +%Y%m%d).dump"
```

Selain itu, Supabase menyediakan pencadangan harian otomatis (*Daily Automated Backups*) pada tab *Database* > *Backups*.

### 12.2 Prosedur Pemulihan Data (Restore)

Jika terjadi insiden data yang memerlukan pemulihan:

```bash
pg_restore -d "postgres://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres" -v "it_warehouse_backup_YYYYMMDD.dump"
```

### 12.3 Pembaruan Dependensi Berkala

Lakukan audit dependensi secara teratur untuk memastikan stabilitas dan keamanan modul:

```bash
# Memeriksa dependensi yang usang
npm outdated

# Menjalankan audit keamanan paket npm
npm audit
```

---

*Manual Book IT Warehouse Management System — Hak Cipta Internal Sistem Gudang IT.*
