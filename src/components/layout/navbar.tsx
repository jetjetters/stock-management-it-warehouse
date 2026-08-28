'use client';

import { Clock } from 'lucide-react';
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
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-gray-200 px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 select-none">
      <div className="flex items-center space-x-2.5 text-gray-700 text-sm font-medium">
        <Clock className="w-4 h-4 text-[#b90051]" />
        <span>{timeString || 'IT Warehouse System'}</span>
      </div>
    </header>
  );
}

