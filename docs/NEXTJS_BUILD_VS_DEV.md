# Panduan & Catatan Penggunaan `next build` vs `next dev`

Dokumen ini berisi penjelasan penting mengenai alur kerja pengembangan Next.js, kapan `next build` digunakan, serta penanganan masalah cache & error 404 pada berkas statis.

---

## 📌 1. Kapan `next build` Diperlukan?

Perintah `next build` berfungsi untuk mengompilasi seluruh aplikasi Next.js menjadi bundel produksi (*production build*) yang teroptimasi secara penuh.

### 🟢 Kondisi `next build` Wajib Digunakan:
1. **Deployment Produksi (Production Release)**:
   - Ketika aplikasi siap dirilis ke server produksi (**Vercel, Docker, VPS, AWS, GCP, dsb**).
   - Memproses minifikasi skrip, *tree-shaking*, penyesuaian aset statis, dan pre-rendering HTML.
2. **Pengujian Mode Produksi Lokal**:
   - Untuk menguji performa dan perilaku aplikasi dalam kondisi produksi di komputer lokal:
     ```bash
     npm run build
     npm run start
     ```
3. **CI/CD Pipeline (Automated Testing)**:
   - Dijalankan pada server CI/CD (seperti GitHub Actions) untuk memastikan aplikasi bebas dari error kompilasi sebelum digabungkan (*merge*).

---

## 🛑 2. Kapan `next build` Dihindari?

- **Saat Development Aktif (`npm run dev`)**:
  - `npm run dev` memiliki mekanisme *Fast Refresh / Hot Reloading*.
  - Menjalankan `next build` secara bersamaan saat dev server sedang aktif akan **menimpa direktori `.next`**, sehingga dev server kehilangan referensi *chunk* di memori yang mengakibatkan error **`404 Not Found`** pada browser untuk skrip JS/CSS.

---

## 🛠️ 3. Penanganan Error 404 / Webpack Cache Glitch

Jika terjadi error `404 Not Found` pada berkas `/_next/static/chunks/...` atau `PackFileCacheStrategy ENOENT`, lakukan langkah berikut:

### Langkah Pembersihan & Pemulihan:
1. Hentikan dev server di terminal (`Ctrl + C`).
2. Hapus folder cache `.next`:
   - **PowerShell (Windows)**:
     ```powershell
     Remove-Item -Recurse -Force .next
     ```
3. Jalankan kembali dev server secara bersih:
   ```bash
   npm run dev
   ```
4. Lakukan *Hard Refresh* pada browser (`Ctrl + Shift + R` atau `Ctrl + F5`).

---

## 🔍 4. Ringkasan Perintah

| Tujuan | Perintah | Catatan |
| :--- | :--- | :--- |
| **Pengembangan (Coding)** | `npm run dev` | Gunakan `npx tsc --noEmit` untuk cek tipe tanpa merusak `.next` |
| **Tes Produksi Lokal** | `npm run build && npm run start` | Menguji kecepatan & perilaku akhir produksi |
| **Rilis Produksi** | `npm run build` | Menghasilkan direktori `.next` produksi |

---
*Dokumen ini dibuat otomatis sebagai panduan standar operasional pengembangan tim.*
