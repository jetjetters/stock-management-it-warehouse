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
} from 'lucide-react';
import { clsx } from 'clsx';
import { Suspense } from 'react';

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
];

function SidebarContent() {
  const pathname = usePathname();

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
                  className={clsx(
                    'group flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition-all duration-150',
                    isActive
                      ? 'bg-[#b90051] text-white font-bold shadow-sm shadow-[#b90051]/20'
                      : 'text-gray-600 hover:text-[#b90051] hover:bg-[#fff0f4] font-medium'
                  )}
                >
                  <Icon
                    className={clsx(
                      'w-4 h-4 shrink-0 transition-colors',
                      isActive
                        ? 'text-white'
                        : 'text-gray-400 group-hover:text-[#b90051]'
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
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 z-20 select-none shrink-0 shadow-xs">
      {/* Brand Header */}
      <div className="p-4 border-b border-gray-200 flex items-center space-x-3 bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Pertamina Trans Kontinental Logo"
          className="h-9 w-auto object-contain flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-bold text-gray-900 text-sm leading-tight truncate">IT Warehouse</h1>
          <p className="text-[10px] text-gray-500 font-medium truncate">PTK Shore Base Tanjung Batu</p>
        </div>
      </div>

      {/* Navigation Links with Suspense */}
      <Suspense fallback={<div className="flex-1 p-4 text-xs text-gray-400">Memuat menu...</div>}>
        <SidebarContent />
      </Suspense>

      {/* Footer Info */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-[10px] text-gray-400 text-center select-none font-mono">
        IT Warehouse Management • 2026
      </div>
    </aside>
  );
}
