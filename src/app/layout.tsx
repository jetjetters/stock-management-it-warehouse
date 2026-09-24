import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { CustomizationProvider } from '@/components/providers/customization-provider';
import { getAppConfig } from '@/app/actions/config';
import { hexToRgb, adjustBrightness, getLuminance } from '@/lib/color-utils';

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
  const primaryRgb = hexToRgb(initialConfig.primaryColor || '#b90051');
  const hoverColor = adjustBrightness(initialConfig.primaryColor || '#b90051', -15);
  const gradFrom = adjustBrightness(initialConfig.primaryColor || '#b90051', 15);
  const gradTo = adjustBrightness(initialConfig.primaryColor || '#b90051', -25);
  const isDark =
    getLuminance(initialConfig.cardBackgroundColor || '#ffffff') < 0.45 ||
    getLuminance(initialConfig.backgroundColor || '#f8fafc') < 0.45;

  return (
    <html lang="id" className={isDark ? 'dark-theme' : undefined}>
      <head>
        <style
          id="theme-server-variables"
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --primary: ${initialConfig.primaryColor};
                --accent: ${initialConfig.primaryColor};
                --primary-hover: ${hoverColor};
                --primary-light: rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.12);
                --primary-border: rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.28);
                --primary-shadow: rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.25);
                --primary-gradient-from: ${gradFrom};
                --primary-gradient-via: ${initialConfig.primaryColor};
                --primary-gradient-to: ${gradTo};
                --background: ${initialConfig.backgroundColor};
                --card-bg: ${initialConfig.cardBackgroundColor};
                --card-border: ${initialConfig.cardBorderColor};
                --sidebar-bg: ${initialConfig.sidebarBackgroundColor};
              }
            `,
          }}
        />
      </head>
      <body className="flex min-h-screen antialiased" style={{ backgroundColor: 'var(--background)' }}>
        <CustomizationProvider initialConfig={initialConfig}>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0" style={{ backgroundColor: 'var(--background)' }}>
            <Navbar />
            <main className="flex-1 p-6 md:p-8" style={{ backgroundColor: 'var(--background)' }}>{children}</main>
          </div>
        </CustomizationProvider>
      </body>
    </html>
  );
}

