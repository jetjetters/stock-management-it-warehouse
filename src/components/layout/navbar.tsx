'use client';

import { Server, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Navbar() {
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };
    updateTime();
  }, []);

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3 text-slate-400 text-sm">
        <Clock className="w-4 h-4 text-blue-400" />
        <span>{timeString || 'Stock Taking System'}</span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700/60 text-xs text-slate-300">
          <Server className="w-3.5 h-3.5 text-emerald-400" />
          <span>Prisma DB (Local)</span>
        </div>
      </div>
    </header>
  );
}
