'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Tags,
  Layers,
  MapPin,
  History,
  Boxes,
  UserCheck,
  FileText,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/items', label: 'Inventaris Stok', icon: Package },
  { href: '/handovers', label: 'Surat Serah Terima', icon: FileText },
  { href: '/categories', label: 'Kategori', icon: Tags },
  { href: '/brands', label: 'Merk / Brand', icon: Layers },
  { href: '/locations', label: 'Lokasi Storage', icon: MapPin },
  { href: '/officers', label: 'Petugas (Giver)', icon: UserCheck },
  { href: '/logs', label: 'Audit Trail (Log)', icon: History },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen sticky top-0 z-20 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
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

      {/* Navigation Links */}
      <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
          MENU UTAMA
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150',
                isActive
                  ? 'bg-[#b90051] text-white font-semibold shadow-sm shadow-[#b90051]/20'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium'
              )}
            >
              <Icon className={clsx('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-gray-500')} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-200 bg-gray-50/50 text-xs text-gray-500 flex items-center justify-between">
        <span className="font-medium text-[11px]">Localhost Engine</span>
        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold border border-emerald-200">
          ONLINE
        </span>
      </div>
    </aside>
  );
}
