# 📦 IT Warehouse Management & Stock Taking System

Sistem Manajemen Inventaris, Stock Opname, dan Tracking Unit **Serial Number (SN)** Gudang IT berbasis localhost. Sistem ini dirancang untuk mengelola inventaris perangkat IT (*Devices*) dan bahan habis pakai (*Consumables/Barang*), otomatisasi penomoran kode SKU unik, pemantauan unit individual via Serial Number, serta pencatatan mutasi stok secara *real-time* berbasis **Audit Trail**.

---

## 🛠️ Tech Stack (Teknologi yang Digunakan)

Sistem ini dibangun menggunakan arsitektur modern Next.js App Router full-stack TypeScript dengan komposit teknologi berikut:

| Layer | Teknologi | Peran & Deskripsi |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14+** (App Router) | Framework React Full-Stack dengan Server Actions & Server Components untuk performa tinggi tanpa REST API terpisah. |
| **Bahasa Pemrograman** | **TypeScript 5.6** | Pengetikan statis (*static typing*) pada seluruh lapisan kode client & server untuk mencegah runtime error. |
| **UI Components & Styling** | **Tailwind CSS v3** & **Lucide React** | Utility-first CSS framework untuk styling responsif & modern visual icon system. |
| **Forms & Validasi** | **React Hook Form v7** & **Zod v3** | Manajemen state formulir ringan dengan validasi skema tipe data ketat pada modal input. |
| **Database** | **Supabase (PostgreSQL)** | Cloud Relational Database gratis dengan Supavisor Connection Pooling & high availability. |
| **Hosting & Deployment** | **Netlify** (Free Tier) | Platform deployment serverless Next.js App Router dengan automated SSL & edge network. |
| **ORM Layer** | **Prisma ORM v6.2** | Type-safe ORM untuk sinkronisasi skema database, pemutakhiran relasi data, dan *seed data*. |
| **State & Cache Invalidation** | **Next.js `revalidatePath`** | Sinkronisasi data real-time dan pembaruan cache otomatis pada seluruh halaman setelah aksi server (*mutations*). |

---

## 📌 Use Case Diagram

Diagram Use Case berikut menggambarkan seluruh interaksi **IT Warehouse Admin / Staff** dengan fitur-fitur utama di dalam sistem:

```mermaid
graph TD
    User(("👤 IT Warehouse Admin / Staff"))

    subgraph Modul_Dashboard ["1. Dashboard Analytics Center"]
        UC1["Melihat Ringkasan Statistik Inventaris"]
        UC2["Melihat Recent Stock Activity & Item Terdaftar"]
    end

    subgraph Modul_Inventaris ["2. Manajemen Inventaris & Unit Serial Number"]
        UC3["Melihat Grouped Stock & Detail Unit SN"]
        UC4["Mencari & Memfilter Inventaris"]
        UC5["Pendaftaran Unit SN Baru (Single & Bulk Entry)"]
        UC6["Otomatisasi Penomoran Kode SKU"]
        UC7["Edit Informasi Detail Unit SN"]
        UC8["Mutasi Lokasi Storage Unit"]
        UC9["Update Status Unit (TERSEDIA/TERPAKAI/RUSAK/KELUAR)"]
        UC10["Hapus Unit SN & Hapus Log Terkait"]
    end

    subgraph Modul_MasterData ["3. Manajemen Master Data"]
        UC11["Kelola Master Kategori (Device / Barang & SKU Prefix)"]
        UC12["Kelola Master Merk / Brand (Terikat Kategori & Inline Form)"]
        UC13["Kelola Master Lokasi Storage (Warehouse, Office, Server Room)"]
    end

    subgraph Modul_AuditLog ["4. Audit Trail & Mutasi Stok"]
        UC14["Melihat Complete History Log Mutasi Stok"]
        UC15["Memfilter Log Mutasi (Berdasarkan Lokasi, Tipe IN/OUT/ADJUSTMENT)"]
    end

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC7
    User --> UC8
    User --> UC9
    User --> UC10
    User --> UC11
    User --> UC12
    User --> UC13
    User --> UC14
    User --> UC15

    UC5 ..> UC6 : "<<include>>"
```

### Deskripsi Ringkas Use Case Per Modul:

1. **Dashboard Analytics Center**:
   - **Melihat Ringkasan Statistik**: Menampilkan metrik total unit SN, total perangkat Device, total bahan habis pakai (Consumables/Barang), stok tersedia, dan unit rusak.
   - **Recent Activity Log**: Memantau daftar aktivitas transaksi stok dan barang baru yang terdaftar secara real-time.

2. **Manajemen Inventaris & Unit Serial Number (SN)**:
   - **Grouped Stock View**: Mengelompokkan barang berdasarkan nama, kategori, brand, dan lokasi dengan opsi rincian unit Serial Number (SN).
   - **Pendaftaran Bulk SN**: Memungkinkan pendaftaran sekaligus banyak unit SN via pemisah koma atau baris baru (*newline*).
   - **Auto SKU Generator**: Otomatis membuat kode SKU format `[PREFIX][4_DIGIT]` sesuai kategori yang dipilih.
   - **Mutasi Lokasi Storage**: Memindahkan unit dari satu pos lokasi ke pos lokasi lain disertai catatan audit.
   - **Update Status Unit**: Mengubah status fisik unit (`TERSEDIA`, `TERPAKAI`, `RUSAK`, `KELUAR`) yang berdampak langsung pada kalkulasi stok & audit log.

3. **Manajemen Master Data**:
   - **Master Kategori**: Pengelolaan jenis barang dengan atribusi `type` (`DEVICE` vs `BARANG`) dan inisial `codePrefix`.
   - **Master Brand**: Pengelolaan merk barang yang difilter secara fleksibel sesuai kategori terkait (*dependent dropdown*).
   - **Master Lokasi Storage**: Pengelolaan pos area penyimpan (*Warehouse IT*, *Main Office*, *Server Room*, dll).

4. **Audit Trail & Log Mutasi**:
   - **Immutable Log Record**: Pencatatan riwayat transaksi penambahan (`IN`), pengurangan (`OUT`), dan penyesuaian lokasi/status (`ADJUSTMENT`).

---

## 🗄️ Entity Relationship Diagram (ERD)

Berikut adalah diagram keterhubungan antar entitas (**ERD**) yang digunakan dalam skema database sistem:

```mermaid
erDiagram
    Category ||--o{ Brand : "memiliki (1:N)"
    Category ||--o{ Item : "mengelompokkan (1:N)"
    Brand ||--o{ Item : "memproduksi (1:N)"
    Location ||--o{ Item : "menyimpan (1:N)"
    Location ||--o{ StockLog : "mencatat_lokasi (1:N)"
    Item ||--o{ StockLog : "menghasilkan_log (1:N)"

    Category {
        String id PK "UUID"
        String name UK "Nama Kategori (Mouse, Printer, dll)"
        ItemCategoryType type "Enum: DEVICE | BARANG"
        String codePrefix UK "Prefix Kode SKU (MOS, PRN, TNT)"
        DateTime createdAt "Waktu Dibuat"
        DateTime updatedAt "Waktu Diperbarui"
    }

    Brand {
        String id PK "UUID"
        String name "Nama Merk (Logitech, Epson, Dell)"
        String categoryId FK "Relasi ke Category"
        DateTime createdAt "Waktu Dibuat"
    }

    Location {
        String id PK "UUID"
        String name UK "Nama Lokasi Storage (Warehouse, Office)"
        String description "Keterangan Tambahan"
        DateTime createdAt "Waktu Dibuat"
        DateTime updatedAt "Waktu Diperbarui"
    }

    Item {
        String id PK "UUID"
        String serialNumber UK "Serial Number unik unit fisik"
        String itemCode "Kode SKU unik (MOS0001)"
        String name "Nama Spesifik Barang"
        ItemCategoryType type "Enum: DEVICE | BARANG"
        String status "Status: TERSEDIA | TERPAKAI | RUSAK | KELUAR"
        String description "Deskripsi/Catatan Unit"
        String categoryId FK "Relasi ke Category"
        String brandId FK "Relasi ke Brand"
        String locationId FK "Relasi ke Location"
        DateTime createdAt "Waktu Dibuat"
        DateTime updatedAt "Waktu Diperbarui"
    }

    StockLog {
        String id PK "UUID"
        String itemId FK "Relasi ke Item Unit"
        String locationId FK "Relasi ke Location"
        Int mutation "Kuantitas Perubahan (+1, -1, 0)"
        MutationType type "Enum: IN | OUT | ADJUSTMENT"
        String notes "Catatan/Keterangan Mutasi"
        DateTime createdAt "Waktu Log Dibuat"
    }
```

### Rincian Relasi & Integritas Entitas:

- **`Category` ➔ `Brand`**: Relasi 1-to-N (*Cascade Delete*). Satu kategori memiliki banyak pilihan merk.
- **`Category` ➔ `Item`**: Relasi 1-to-N. Menentukan tipe aset (`DEVICE`/`BARANG`) dan prefix SKU dari unit barang.
- **`Brand` ➔ `Item`**: Relasi 1-to-N. Menghubungkan unit barang ke merk terdaftar.
- **`Location` ➔ `Item`**: Relasi 1-to-N. Menentukan posisi storage fisik tempat unit disimpan.
- **`Item` ➔ `StockLog`**: Relasi 1-to-N (*Cascade Delete*). Setiap perubahan lokasi, penambahan, atau status unit menghasilkan rekaman histori di audit trail.
- **`Location` ➔ `StockLog`**: Relasi 1-to-N. Menandai lokasi terkait pada saat transaksi mutasi dilakukan.

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

3. **Konfigurasi Environment (Supabase)**:
   Buat atau sesuaikan file `.env` di root proyek dengan kredensial PostgreSQL dari project [Supabase](https://supabase.com) Anda (lihat template pada [`.env.example`](file:///c:/Users/Jetro/Documents/GitHub/stock-management-it-warehouse/.env.example)):
   ```env
   # 1. DATABASE_URL: Transaction Pooler via Supavisor (Port 6543)
   DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[YOUR-REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

   # 2. DIRECT_URL: Direct Connection / Session Mode (Port 5432)
   DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[YOUR-REGION].pooler.supabase.com:5432/postgres"
   ```

4. **Inisialisasi Database Supabase & Tipe Prisma Client**:
   ```bash
   # Generasi Prisma Client
   npm run prisma:generate

   # Dorong (push) skema tabel ke cloud database Supabase PostgreSQL
   npm run prisma:push
   ```

5. **Isi Data Awal / Seed Demo Data ke Supabase**:
   ```bash
   npm run prisma:seed
   ```
   *Perintah ini akan memasukkan data awal Kategori (Mouse, Keyboard, Printer, Tinta, Kabel), Merk (Logitech, Epson, Belden), Lokasi Storage, Petugas, serta unit sampel lengkap dengan Serial Number dan Log Mutasi awal langsung ke database Supabase.*

---

## 🚀 Panduan Deploy Gratis ke Netlify

Proyek ini sudah dilengkapi dengan konfigurasi [`netlify.toml`](file:///c:/Users/Jetro/Documents/GitHub/stock-management-it-warehouse/netlify.toml) yang mengoptimalkan runtime Next.js 14 App Router.

### Langkah-langkah Deploy:
1. **Push Branch ke Repository GitHub**:
   Pastikan branch `deploy-netlify-supabase` sudah di-push ke GitHub:
   ```bash
   git add .
   git commit -m "feat: configure Supabase PostgreSQL and Netlify deployment"
   git push origin deploy-netlify-supabase
   ```

2. **Hubungkan ke Netlify**:
   - Buka [Netlify Dashboard](https://app.netlify.com/) dan login.
   - Klik **"Add new site"** > **"Import an existing project"**.
   - Pilih **GitHub**, lalu pilih repository `stock-management-it-warehouse`.
   - Pilih Branch to deploy: `deploy-netlify-supabase`.

3. **Konfigurasi Build Settings**:
   Netlify akan otomatis mendeteksi pengaturan dari `netlify.toml`:
   - **Build command**: `prisma generate && next build`
   - **Publish directory**: `.next`

4. **Tambahkan Environment Variables di Netlify**:
   Masuk ke **Site configuration** > **Environment variables** > **Add a variable**, lalu masukkan:
   - `DATABASE_URL`: *(Connection string Supabase Port 6543 pooler)*
   - `DIRECT_URL`: *(Connection string Supabase Port 5432 direct)*

5. **Deploy Site**:
   - Klik **"Deploy site"**.
   - Netlify akan menginstal dependensi, menghasilkan Prisma Client, membangun Next.js App Router, dan menerbitkan web app Anda ke URL `https://[nama-aplikasi].netlify.app`.

---

## 🖥️ Cara Menjalankan Aplikasi di Lokal

### Mode Pengembangan (Development)

Jalankan perintah berikut di terminal:
```bash
npm run dev
```

Buka browser Anda dan akses aplikasi di:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📂 Struktur Direktori Proyek

```text
├── .agent/               # Spesifikasi desain & konteks produk (DESIGN.md, PRODUCT_CONTEXT.md, dll)
├── prisma/
│   ├── schema.prisma     # Skema Prisma PostgreSQL (Category, Brand, Location, Item, StockLog, Handover)
│   └── seed.ts           # Script seeding data demo awal ke Supabase
├── src/
│   ├── app/
│   │   ├── actions/      # Server Actions Next.js (items.ts, master-data.ts, logs.ts, handovers.ts, officers.ts)
│   │   ├── items/        # Halaman Inventaris, Management Unit SN & Opname
│   │   ├── categories/   # Halaman Master Kategori & Prefix SKU
│   │   ├── brands/       # Halaman Master Merk / Brand
│   │   ├── locations/    # Halaman Master Lokasi Storage
│   │   ├── logs/         # Halaman Complete Audit Trail Mutasi Stok
│   │   ├── officers/     # Halaman Master Petugas / Penanggung Jawab
│   │   ├── handovers/    # Halaman Berita Acara Serah Terima Barang (Form & Cetak PDF)
│   │   ├── globals.css   # Theme & styling Tailwind global
│   │   ├── layout.tsx    # Root Layout (Sidebar Navigation + Header)
│   │   └── page.tsx      # Dashboard Utama & Analytics Center
│   ├── components/       # Component UI (Modal, Client Views, Form)
│   └── lib/
│       ├── db.ts         # Singleton client instance Prisma Client
│       └── sku.ts        # Helper logika generator otomatisasi SKU
├── netlify.toml          # Konfigurasi automated build & runtime Netlify Next.js
├── .env.example          # Template kredensial Supabase PostgreSQL
├── .env                  # File environment lokal
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
| `npm run prisma:push` | Menyinkronkan `schema.prisma` ke cloud database Supabase PostgreSQL |
| `npm run prisma:seed` | Mengisi data master awal dan unit sampel Serial Number ke Supabase |
| `npx prisma studio` | Membuka GUI database browser di `http://localhost:5555` |
| `npx prisma db push --force-reset` | Melakukan reset total database Supabase jika skema perlu direset ulang |

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
