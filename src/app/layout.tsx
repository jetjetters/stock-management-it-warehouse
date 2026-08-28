import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';

export const metadata: Metadata = {
  title: 'IT Warehouse Stock Management & Opname',
  description: 'Sistem Pengelolaan Stok & Opname Inventaris Perangkat IT dan Consumables',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-[#f8fafc] text-slate-900 flex min-h-screen antialiased selection:bg-[#fae2ea] selection:text-[#b90051]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
