'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Tags,
  Layers,
  MapPin,
  Package,
  PlusCircle,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Monitor,
  Boxes,
  Send,
  Plus,
  Compass,
  FileText,
  ShieldCheck,
} from 'lucide-react';

type FaqItem = {
  question: string;
  answer: string;
};

const faqs: FaqItem[] = [
  {
    question: 'Mengapa pilihan Merk tidak muncul saat saya mau menginput barang baru?',
    answer:
      'Dropdown Merk bergantung secara langsung pada Kategori yang dipilih. Pastikan Anda telah memilih Kategori terlebih dahulu. Jika kategori sudah dipilih namun pilihan Merk masih kosong, artinya belum ada merk yang didaftarkan untuk kategori tersebut. Silakan buat merk baru di menu "Merk / Brand > Tambah Merk Baru".',
  },
  {
    question: 'Bagaimana cara menginput banyak unit sekaligus (Multi-SN) untuk model barang yang sama?',
    answer:
      'Pada halaman "Tambah Unit (SN Baru)", Anda cukup memilih Kategori, Merk, Lokasi, dan Nama Barang satu kali. Kemudian klik tombol "+ Tambah Unit Lainnya" untuk menambahkan baris Serial Number (SN) baru sebanyak unit yang ingin didaftarkan. Sistem akan otomatis membuat data unik untuk masing-masing SN.',
  },
  {
    question: 'Kapan kolom Status Kepemilikan (Milik IT / Sewa) wajib diisi?',
    answer:
      'Status Kepemilikan eksklusif muncul saat Anda memilih kategori berjenis "DEVICE" (seperti Laptop, PC, Printer, Scanner, Monitor). Pilih "MILIK IT" untuk aset inventaris permanen perusahaan, atau pilih "SEWA" untuk perangkat rental dari pihak ketiga/vendor.',
  },
  {
    question: 'Bagaimana alur resmi ketika barang diserahkan ke pengguna / PIC divisi lain?',
    answer:
      'Setelah unit terdaftar di Inventaris Stok, buka menu "Surat Serah Terima > Form Serah Terima (PDF)". Pilih unit barang, tentukan PIC penerima dan Petugas penyerah, lalu simpan. Sistem akan menghasilkan dokumen resmi PDF Berita Acara Serah Terima Barang IT bertanda tangan.',
  },
  {
    question: 'Bagaimana jika barang berpindah lokasi rak atau gedung penyimpanan?',
    answer:
      'Buka halaman "Daftar Inventaris Stok", temukan barang yang bersangkutan, lalu klik tombol "Mutasi Lokasi". Pilih pos storage baru dan simpan. Seluruh riwayat mutasi akan tercatat otomatis di menu "Audit Trail (Log)".',
  },
];

export function ProcedureClient() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Banner Header */}
      <div className="bg-gradient-to-br from-[#b90051] via-[#a00045] to-[#730030] text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-72 h-72 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide">
            <Compass className="w-4 h-4 text-rose-200" />
            <span>SOP & PANDUAN PENGGUNA IT WAREHOUSE</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Prosedur & Alur Standar Input Inventaris Barang
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-rose-100/90 leading-relaxed">
            Ikuti tata cara pengisian data master secara berurutan agar penomoran SKU, relasi merk,
            lokasi penyimpanan, dan pelacakan unit Serial Number (SN) tercatat secara rapi dan akurat.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/items/new"
              className="px-5 py-3 bg-white text-[#b90051] hover:bg-rose-50 font-bold rounded-xl text-xs sm:text-sm shadow-md transition flex items-center space-x-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#b90051]" />
              <span>Mulai Input Unit Barang Sekarang</span>
            </Link>

            <Link
              href="/items"
              className="px-5 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl text-xs sm:text-sm backdrop-blur-md border border-white/20 transition flex items-center space-x-2 cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>Lihat Daftar Stok Tersedia</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hirarki Data Section (Visual Tree Map) */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center space-x-2.5">
            <Layers className="w-5 h-5 text-[#b90051]" />
            <span>Struktur Hirarki Relasi Data Master</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Sistem inventaris dibangun dengan relasi berjenjang. Pahami hirarki berikut sebelum mengisi formulir:
          </p>
        </div>

        {/* 4 Connected Cards Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Card 1: Kategori */}
          <div className="bg-[#fce7ee] border-2 border-[#f5b8cc] rounded-2xl p-5 space-y-3 relative group hover:border-[#b90051] transition">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-full bg-[#b90051] text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <Tags className="w-5 h-5 text-[#b90051]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Kategori Barang</h3>
              <p className="text-[11px] text-gray-600 mt-1">
                Klasifikasi utama jenis aset (<strong>DEVICE</strong> atau <strong>BARANG</strong>) dan penentuan inisial prefix kode SKU (misal: <code>[MOS]</code> untuk Mouse).
              </p>
            </div>
            <div className="pt-2 border-t border-[#f0a8bf]/70 flex justify-between items-center text-[10.5px]">
              <span className="font-semibold text-[#b90051]">Prasyarat Awal</span>
              <Link href="/categories" className="font-bold text-gray-900 hover:text-[#b90051] underline">
                Kelola Kategori →
              </Link>
            </div>
          </div>

          {/* Card 2: Merk / Brand */}
          <div className="bg-[#fce7ee] border-2 border-[#f5b8cc] rounded-2xl p-5 space-y-3 relative group hover:border-[#b90051] transition">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-full bg-[#b90051] text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <Layers className="w-5 h-5 text-[#b90051]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Merk / Brand</h3>
              <p className="text-[11px] text-gray-600 mt-1">
                Produsen perangkat yang <strong>terhubung langsung</strong> dengan kategori induknya (misal: Merk <em>Logitech</em> terikat pada kategori <em>Mouse</em>).
              </p>
            </div>
            <div className="pt-2 border-t border-[#f0a8bf]/70 flex justify-between items-center text-[10.5px]">
              <span className="font-semibold text-[#b90051]">Wajib Ada</span>
              <Link href="/brands" className="font-bold text-gray-900 hover:text-[#b90051] underline">
                Kelola Merk →
              </Link>
            </div>
          </div>

          {/* Card 3: Lokasi Storage */}
          <div className="bg-[#fce7ee] border-2 border-[#f5b8cc] rounded-2xl p-5 space-y-3 relative group hover:border-[#b90051] transition">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-full bg-[#b90051] text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <MapPin className="w-5 h-5 text-[#b90051]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Lokasi Storage</h3>
              <p className="text-[11px] text-gray-600 mt-1">
                Pos area fisik penyimpanan unit barang (contoh: <em>Warehouse IT</em>, <em>Server Room</em>, <em>Rak A1</em>).
              </p>
            </div>
            <div className="pt-2 border-t border-[#f0a8bf]/70 flex justify-between items-center text-[10.5px]">
              <span className="font-semibold text-[#b90051]">Area Fisik</span>
              <Link href="/locations" className="font-bold text-gray-900 hover:text-[#b90051] underline">
                Kelola Lokasi →
              </Link>
            </div>
          </div>

          {/* Card 4: Unit Barang */}
          <div className="bg-[#b90051] text-white rounded-2xl p-5 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-full bg-white text-[#b90051] text-xs font-bold flex items-center justify-center">
                4
              </span>
              <Package className="w-5 h-5 text-rose-200" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Unit Barang (SN)</h3>
              <p className="text-[11px] text-rose-100 mt-1">
                Data final inventaris yang menggabungkan <strong>Kategori + Merk + Lokasi + Nama Model + Serial Number (SN)</strong> unik.
              </p>
            </div>
            <div className="pt-2 border-t border-white/20 flex justify-between items-center text-[10.5px]">
              <span className="font-semibold text-rose-200">Hasil Akhir</span>
              <Link href="/items/new" className="font-bold text-white hover:underline">
                Form Input →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Step SOP Detailed Roadmap */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-[#b90051]" />
            <span>Tahapan Prosedur Input Barang Lengkap</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Ikuti 3 tahapan standar operasional prosedur di bawah ini:
          </p>
        </div>

        {/* Step 1: Persiapan Master Data */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-2xl bg-[#fae2ea] text-[#b90051] font-extrabold text-base flex items-center justify-center shrink-0">
              01
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#b90051] tracking-wider uppercase">TAHAP PERTAMA</span>
              <h3 className="text-lg font-bold text-gray-900">Persiapan Master Data (Prasyarat)</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Sebelum menginput unit barang, pastikan master data pendukung telah tersedia di sistem.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Substep 1.1 */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">1. Master Kategori</span>
                <Tags className="w-4 h-4 text-[#b90051]" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Tentukan tipe klasifikasi:
                <br />• <strong>DEVICE</strong>: Untuk aset perangkat keras (laptop, mouse, printer).
                <br />• <strong>BARANG</strong>: Untuk barang habis pakai (kabel, tinta, konektor).
                <br />Masukkan juga prefix SKU (contoh: <code>MOS</code>).
              </p>
              <Link
                href="/categories/new"
                className="inline-flex items-center space-x-1 text-xs font-bold text-[#b90051] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Kategori Baru</span>
              </Link>
            </div>

            {/* Substep 1.2 */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">2. Master Merk / Brand</span>
                <Layers className="w-4 h-4 text-[#b90051]" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Daftarkan merk produsen dan <strong>pilih kategori yang menaunginya</strong>.
                Contoh: Merk <em>Logitech</em> dihubungkan ke kategori <em>Mouse</em> dan <em>Keyboard</em>.
              </p>
              <Link
                href="/brands/new"
                className="inline-flex items-center space-x-1 text-xs font-bold text-[#b90051] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Merk Baru</span>
              </Link>
            </div>

            {/* Substep 1.3 */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">3. Master Lokasi Storage</span>
                <MapPin className="w-4 h-4 text-[#b90051]" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Tentukan pos penyimpanan fisik barang di area kerja (misal: <em>Warehouse IT Tanjung Batu</em>, <em>Rak A1</em>, atau <em>Pos IT 7</em>).
              </p>
              <Link
                href="/locations/new"
                className="inline-flex items-center space-x-1 text-xs font-bold text-[#b90051] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Lokasi Baru</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Step 2: Formulir Tambah Unit Barang */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-2xl bg-[#fae2ea] text-[#b90051] font-extrabold text-base flex items-center justify-center shrink-0">
              02
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#b90051] tracking-wider uppercase">TAHAP KEDUA</span>
              <h3 className="text-lg font-bold text-gray-900">Pengisian Formulir Tambah Unit Barang (SN Baru)</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Buka halaman <strong>Tambah Unit (SN Baru)</strong> dan ikuti panduan kolom formulir berikut:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-[#fce7ee]/60 border border-[#f5b8cc] rounded-2xl space-y-2.5">
              <h4 className="text-xs font-bold text-gray-900 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#b90051]" />
                <span>1. Pilih Kategori & Merk</span>
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Pilih Kategori barang terlebih dahulu. Sistem akan menyaring daftar Merk yang tersedia sesuai kategori tersebut.
              </p>
            </div>

            <div className="p-4 bg-[#fce7ee]/60 border border-[#f5b8cc] rounded-2xl space-y-2.5">
              <h4 className="text-xs font-bold text-gray-900 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#b90051]" />
                <span>2. Tentukan Pos Lokasi Storage</span>
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Pilih pos penyimpanan fisik awal tempat barang ini diletakkan pertama kali.
              </p>
            </div>

            <div className="p-4 bg-[#fce7ee]/60 border border-[#f5b8cc] rounded-2xl space-y-2.5">
              <h4 className="text-xs font-bold text-gray-900 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#b90051]" />
                <span>3. Status Kepemilikan (Khusus DEVICE)</span>
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Jika kategori berjenis Device, pilih status aset:
                <br />• <strong>Milik IT</strong>: Aset inventaris internal tetap.
                <br />• <strong>Sewa</strong>: Perangkat sewa/rental pihak vendor.
              </p>
            </div>

            <div className="p-4 bg-[#fce7ee]/60 border border-[#f5b8cc] rounded-2xl space-y-2.5">
              <h4 className="text-xs font-bold text-gray-900 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#b90051]" />
                <span>4. Masukkan Serial Number (Multi-SN)</span>
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Tulis Serial Number fisik unit. Klik <em>&quot;+ Tambah Unit Lainnya&quot;</em> jika Anda ingin mendaftarkan banyak unit SN sekaligus. Kode SKU akan terbentuk otomatis.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/items/new"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#b90051] hover:bg-[#a00045] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buka Formulir Tambah Unit Barang →</span>
            </Link>
          </div>
        </div>

        {/* Step 3: Verifikasi & Serah Terima */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-2xl bg-[#fae2ea] text-[#b90051] font-extrabold text-base flex items-center justify-center shrink-0">
              03
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#b90051] tracking-wider uppercase">TAHAP KETIGA</span>
              <h3 className="text-lg font-bold text-gray-900">Verifikasi Stok & Penyerahan Barang (BAST)</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Setelah tersimpan, barang siap dikelola, diaudit, atau diserahkan ke pengguna:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <h4 className="text-xs font-bold text-gray-900 flex items-center space-x-2">
                <Package className="w-4 h-4 text-[#b90051]" />
                <span>Cek di Daftar Inventaris Stok</span>
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Gunakan filter kategori, merk, atau lokasi untuk memverifikasi unit yang baru ditambahkan. Anda juga dapat melakukan Stok Opname dan Mutasi Lokasi.
              </p>
              <Link href="/items" className="inline-block text-xs font-bold text-[#b90051] hover:underline pt-1">
                Buka Inventaris Stok →
              </Link>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <h4 className="text-xs font-bold text-gray-900 flex items-center space-x-2">
                <Send className="w-4 h-4 text-[#b90051]" />
                <span>Buat Surat Serah Terima (PDF)</span>
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Saat barang diserahkan kepada PIC/User, buat berita acara serah terima resmi yang otomatis mencetak dokumen PDF lengkap dengan tanda tangan digital.
              </p>
              <Link href="/handovers/new" className="inline-block text-xs font-bold text-[#b90051] hover:underline pt-1">
                Buat Serah Terima Baru →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table: DEVICE vs BARANG */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-[#b90051]" />
            <span>Perbedaan Tipe Inventaris: DEVICE vs BARANG (Consumable)</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Gunakan tabel perbandingan ini untuk menentukan kategori yang tepat saat mendaftarkan item:
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#b90051] text-white font-bold uppercase tracking-wider">
                <th className="py-3 px-4 rounded-tl-xl">Kriteria</th>
                <th className="py-3 px-4">PERANGKAT (DEVICE)</th>
                <th className="py-3 px-4 rounded-tr-xl">CONSUMABLE (BARANG)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50/80 transition">
                <td className="py-3 px-4 font-bold text-gray-900">Contoh Barang</td>
                <td className="py-3 px-4 text-gray-700">Laptop, PC Desktop, Monitor, Printer, Scanner, Mouse, Keyboard</td>
                <td className="py-3 px-4 text-gray-700">Kabel UTP LAN, RJ45 Connector, Tinta/Ribbon Printer, Velcro, Baterai</td>
              </tr>
              <tr className="hover:bg-gray-50/80 transition">
                <td className="py-3 px-4 font-bold text-gray-900">Pelacakan Serial Number (SN)</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    Wajib SN Fisik per Unit
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium">
                    Opsional / Batch Lot SN
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50/80 transition">
                <td className="py-3 px-4 font-bold text-gray-900">Status Kepemilikan</td>
                <td className="py-3 px-4 text-[#b90051] font-bold">
                  Wajib ditentukan (Milik IT vs Sewa)
                </td>
                <td className="py-3 px-4 text-gray-400 font-medium">
                  Tidak Berlaku
                </td>
              </tr>
              <tr className="hover:bg-gray-50/80 transition">
                <td className="py-3 px-4 font-bold text-gray-900">Surat Serah Terima (PDF)</td>
                <td className="py-3 px-4 text-emerald-700 font-semibold">
                  ✓ Wajib Berita Acara saat diserahkan
                </td>
                <td className="py-3 px-4 text-gray-600">
                  ✓ Dapat dicatat dalam form serah terima
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ & Troubleshooting Section */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center space-x-2.5">
            <HelpCircle className="w-5 h-5 text-[#b90051]" />
            <span>Pertanyaan Umum & Solusi Kendala (FAQ)</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Jawaban atas pertanyaan yang sering ditemui saat mengelola data inventaris IT:
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="border border-gray-200 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-gray-50/60 hover:bg-[#fce7ee]/30 transition cursor-pointer"
                >
                  <span className="font-bold text-gray-900 text-xs sm:text-sm pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#b90051] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="p-4 sm:p-5 bg-white border-t border-gray-100 text-xs sm:text-sm text-gray-600 leading-relaxed animate-in fade-in duration-150">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA Box */}
      <div className="bg-gradient-to-r from-[#fce7ee] via-rose-50 to-[#fce7ee] border-2 border-[#f5b8cc] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-sm">
        <div className="space-y-1">
          <h3 className="font-bold text-gray-900 text-base sm:text-lg">
            Siap Menambahkan Barang ke Inventaris?
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">
            Gunakan form terpadu untuk mendaftarkan satu atau banyak unit Serial Number sekaligus.
          </p>
        </div>

        <Link
          href="/items/new"
          className="px-6 py-3 bg-[#b90051] hover:bg-[#a00045] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-[#b90051]/20 transition flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <span>Buka Form Tambah Unit</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
