import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { CustomizationProvider } from '@/components/providers/customization-provider';
import { getAppConfig } from '@/app/actions/config';

export const metadata: Metadata = {
  title: 'IT Warehouse Stock Management & Opname',
  description: 'Sistem Pengelolaan Stok & Opname Inventaris Perangkat IT dan Consumables',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialConfig = await getAppConfig();

  return (
    <html lang="id">
      <body className="text-slate-900 flex min-h-screen antialiased">
        <CustomizationProvider initialConfig={initialConfig}>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Navbar />
            <main className="flex-1 p-6 md:p-8">{children}</main>
          </div>
        </CustomizationProvider>
      </body>
    </html>
  );
}

