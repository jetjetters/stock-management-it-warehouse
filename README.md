# IT Warehouse Management & Stock Taking System

Sistem Manajemen Inventaris & Stock Opname Gudang IT berbasis localhost. Sistem ini dirancang untuk mengelola inventaris perangkat IT (*Devices*) dan bahan habis pakai (*Consumables/Barang*), otomatisasi penomoran kode SKU unik, serta pencatatan mutasi stok secara *real-time* berbasis **Audit Trail**.

---

## 🛠️ Teknologi yang Digunakan

- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Styling**: Tailwind CSS & Lucide React Icons
- **Database**: SQLite (Local Zero-Config)
- **ORM**: Prisma ORM v6
- **Forms & Validation**: React Hook Form, Zod Validation

---

## ✨ Fitur Utama

1. **Pemisahan Klasifikasi Inventaris**:
   - **DEVICE (Perangkat Physical Asset)**: Mouse, Keyboard, Laptop, Printer, Monitor, dll.
   - **BARANG (Consumables)**: Tinta Printer, Kabel UTP Cat6, Connector RJ45, Paper, dll.

2. **Otomatisasi Penomoran SKU**:
   - Penomoran otomatis berbasis Prefix Kategori dengan format **`[PREFIX][4_DIGIT_SEQUENCE]`** (Contoh: `MOS0001`, `PRN0001`, `TNT0001`).
   - Preview kode SKU baru secara *real-time* saat memilih kategori.

3. **Master Data Dinamis & Dependent Dropdowns**:
   - Dropdown Merk/Brand ter-filter otomatis sesuai Kategori yang dipilih.
   - Fitur pembuatan Merk/Brand baru secara langsung (*inline creation*) dari modal item.
   - Pos Lokasi Storage fleksibel (`Warehouse IT`, `Main Office`, `Server Room`, `Rack A1`).

4. **Stock Opname Adjustment & Audit Trail**:
   - Form penyesuaian opname fisik dengan otomatisasi deteksi selisih kuantitas (`IN` / `OUT`).
   - Log historis mutasi stok tidak dapat diubah (immutable) sesuai format audit:
     `DD-MM-YYYY: [Kode Item] dari [Lokasi] [Aktivitas/Keterangan] ([+|-][Jumlah])`

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

4. **Inisialisasi Database SQLite & Tipe Prisma**:
   ```bash
   # Generasi tipe Prisma Client
   npx prisma generate

   # Buat tabel dan skema database SQLite
   npx prisma db push
   ```

5. **Isi Data Awal / Seed Demo Data**:
   ```bash
   npm run prisma:seed
   ```
   *Perintah ini akan menambahkan data sampel Kategori (Mouse, Keyboard, Printer, Tinta, Kabel), Merk (Logitech, Epson, Belden), Lokasi Storage, serta item inventaris beserta log audit awalnya.*

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
├── .agent/               # Spesifikasi desain & konteks produk
├── prisma/
│   ├── schema.prisma     # Skema database Prisma (Category, Brand, Location, Item, StockLog)
│   ├── seed.ts           # Script seeding data demo awal
│   └── dev.db            # Database SQLite lokal (diabaikan oleh git)
├── src/
│   ├── app/
│   │   ├── actions/      # Server Actions (Items, Master Data, Audit Logs)
│   │   ├── items/        # Halaman Inventaris & Opname
│   │   ├── categories/   # Halaman Master Kategori & Prefix SKU
│   │   ├── brands/       # Halaman Master Merk / Brand
│   │   ├── locations/    # Halaman Master Lokasi Storage
│   │   ├── logs/         # Halaman Complete Audit Trail
│   │   ├── globals.css   # Theme & styling global
│   │   ├── layout.tsx    # Layout utama (Sidebar + Navbar)
│   │   └── page.tsx      # Dashboard Utama & Analytics Center
│   ├── components/       # Component UI & Modals (Item, Opname, Mutasi, Master Data)
│   └── lib/
│       ├── db.ts         # Singleton client instance Prisma
│       └── sku.ts        # Helper logika otomatisasi SKU
├── .env                  # Environment database
├── .gitignore            # Pengabaian secrets & build artifacts
├── package.json          # Dependency & script npm
└── README.md             # Dokumentasi panduan proyek
```

---

## 📊 Perintah Utility Database

- **Inspeksi Data via Prisma Studio GUI**:
  ```bash
  npx prisma studio
  ```
  *(Membuka GUI database browser di `http://localhost:5555`)*

- **Reset Database & Re-seed**:
  ```bash
  npx prisma db push --force-reset
  npm run prisma:seed
  ```

---

## ⚠️ Troubleshooting & Solusi Prisma Validation Error

Jika saat menjalankan aplikasi mengalami **Prisma Validation Error** atau `PrismaClientValidationError`, ikuti langkah-langkah perbaikan berikut:

### 1. Masalah File `.env` Mismatch atau Belum Ada
Pastikan file `.env` sudah ada di root proyek dan berisi:
```env
DATABASE_URL="file:./dev.db"
```

### 2. Prisma Client Belum Ter-generate Sesuai OS
Jika proyek baru di-clone di laptop lain, jalankan perintah berikut untuk menginisialisasi ulang Prisma Client & Skema Database:
```bash
# Regenerasi Prisma Client
npx prisma generate

# Pindahkan/Sinkronkan skema ke database SQLite
npx prisma db push
```

### 3. Skema Database SQLite Out of Sync / Rusak
Jika tabel atau skema tidak cocok dengan data awal, lakukan reset database dan jalankan ulang seeding:
```bash
# Force reset database lokal
npx prisma db push --force-reset

# Isi ulang data awal / demo data
npm run prisma:seed
```

### 4. Nilai Enum Tidak Sesuai (Case Sensitivity)
Pada skema Prisma SQLite, enum `ItemCategoryType` (`DEVICE`, `BARANG`) dan `MutationType` (`IN`, `OUT`, `ADJUSTMENT`) bersifat **Strict Case-Sensitive (Huruf Kapital)**. Pastikan input data tidak menggunakan huruf kecil (`device` atau `barang`).

### 5. Perintah Seed Menggunakan `npm run` (Bukan `npx run`)
Gunakan perintah **`npm run prisma:seed`** atau **`npx prisma db seed`**.
*Catatan: Jangan gunakan `npx run prisma:seed`, karena `npx` akan mencoba menginstall paket npm bernama `run` yang bukan merupakan skrip proyek.*


