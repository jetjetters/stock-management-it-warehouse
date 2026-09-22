'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FileText,
  Send,
  Tags,
  Layers,
  MapPin,
  UserCheck,
  History,
  Plus,
  BookOpen,
  Palette,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Suspense } from 'react';
import { useCustomization } from '@/components/providers/customization-provider';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavSection = {
  sectionTitle: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    sectionTitle: 'MENU UTAMA',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/procedure', label: 'Prosedur Input Barang', icon: BookOpen },
      { href: '/logs', label: 'Audit Trail (Log)', icon: History },
    ],
  },
  {
    sectionTitle: 'INVENTARIS STOK',
    items: [
      { href: '/items', label: 'Daftar Inventaris Stok', icon: Package },
      { href: '/items/new', label: 'Tambah Unit (SN Baru)', icon: PlusCircle },
    ],
  },
  {
    sectionTitle: 'SURAT SERAH TERIMA',
    items: [
      { href: '/handovers', label: 'Daftar Serah Terima', icon: FileText },
      { href: '/handovers/new', label: 'Form Serah Terima (PDF)', icon: Send },
    ],
  },
  {
    sectionTitle: 'KATEGORI',
    items: [
      { href: '/categories', label: 'Daftar Kategori', icon: Tags },
      { href: '/categories/new', label: 'Tambah Kategori', icon: Plus },
    ],
  },
  {
    sectionTitle: 'MERK / BRAND',
    items: [
      { href: '/brands', label: 'Daftar Merk / Brand', icon: Layers },
      { href: '/brands/new', label: 'Tambah Merk Baru', icon: Plus },
    ],
  },
  {
    sectionTitle: 'LOKASI STORAGE',
    items: [
      { href: '/locations', label: 'Daftar Lokasi', icon: MapPin },
      { href: '/locations/new', label: 'Tambah Lokasi Baru', icon: Plus },
    ],
  },
  {
    sectionTitle: 'PETUGAS (GIVER)',
    items: [
      { href: '/officers', label: 'Daftar Petugas', icon: UserCheck },
      { href: '/officers/new', label: 'Tambah Petugas Baru', icon: Plus },
    ],
  },
  {
    sectionTitle: 'KUSTOMISASI',
    items: [
      { href: '/customization', label: 'Kustomisasi Tampilan', icon: Palette },
    ],
  },
];

function SidebarContent() {
  const pathname = usePathname();
  const { config } = useCustomization();

  const isItemActive = (itemHref: string) => {
    if (pathname === itemHref) {
      return true;
    }

    // Sub-routes match (excluding /new routes which have their own nav buttons)
    if (itemHref === '/items' && pathname.startsWith('/items/') && pathname !== '/items/new') {
      return true;
    }
    if (itemHref === '/categories' && pathname.startsWith('/categories/') && pathname !== '/categories/new') {
      return true;
    }
    if (itemHref === '/brands' && pathname.startsWith('/brands/') && pathname !== '/brands/new') {
      return true;
    }
    if (itemHref === '/locations' && pathname.startsWith('/locations/') && pathname !== '/locations/new') {
      return true;
    }
    if (itemHref === '/officers' && pathname.startsWith('/officers/') && pathname !== '/officers/new') {
      return true;
    }
    if (itemHref === '/handovers' && pathname.startsWith('/handovers/') && pathname !== '/handovers/new') {
      return true;
    }
    if (itemHref === '/customization' && pathname.startsWith('/customization')) {
      return true;
    }

    return false;
  };

  return (
    <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
      {navSections.map((section, idx) => (
        <div key={idx} className="space-y-1">
          {/* Section Header */}
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 select-none">
            {section.sectionTitle}
          </div>

          {/* Section Items */}
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={
                    isActive
                      ? {
                          backgroundColor: config.primaryColor,
                          boxShadow: `0 2px 8px ${config.primaryColor}33`,
                        }
                      : undefined
                  }
                  className={clsx(
                    'group flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition-all duration-150',
                    isActive
                      ? 'text-white font-bold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 font-medium'
                  )}
                >
                  <Icon
                    className={clsx(
                      'w-4 h-4 shrink-0 transition-colors',
                      isActive
                        ? 'text-white'
                        : 'text-gray-400 group-hover:text-gray-700'
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function Sidebar() {
  const { config } = useCustomization();

  return (
    <aside
      className="w-64 border-r border-gray-200 flex flex-col h-screen sticky top-0 z-20 select-none shrink-0 shadow-xs transition-colors duration-150"
      style={{ backgroundColor: config.sidebarBackgroundColor || '#ffffff' }}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-gray-200 flex items-center space-x-3 bg-white/60 backdrop-blur-xs">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={config.appLogo || '/logo.png'}
          alt={config.appTitle || 'App Logo'}
          className="h-9 w-auto object-contain flex-shrink-0 max-w-[48px]"
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-bold text-gray-900 text-sm leading-tight truncate">
            {config.appTitle || 'IT Warehouse'}
          </h1>
          <p className="text-[10px] text-gray-500 font-medium truncate">
            {config.appSubtitle || 'PSTB'}
          </p>
        </div>
      </div>

      {/* Navigation Links with Suspense */}
      <Suspense fallback={<div className="flex-1 p-4 text-xs text-gray-400">Memuat menu...</div>}>
        <SidebarContent />
      </Suspense>

      {/* Footer Info */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-[10px] text-gray-400 text-center select-none font-mono">
        {config.appTitle || 'IT Warehouse'} • 2026
      </div>
    </aside>
  );
}

