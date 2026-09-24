'use client';

import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCustomization } from '@/components/providers/customization-provider';

export function Navbar() {
  const { config } = useCustomization();
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
    <header
      className="h-16 backdrop-blur-md border-b px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 select-none transition-colors duration-200"
      style={{
        backgroundColor: config.cardBackgroundColor ? `${config.cardBackgroundColor}f0` : 'rgba(255, 255, 255, 0.95)',
        borderColor: config.cardBorderColor || '#e2e8f0',
      }}
    >
      <div className="flex items-center space-x-2.5 text-gray-700 text-sm font-medium">
        <Clock className="w-4 h-4" style={{ color: config.primaryColor }} />
        <span>{timeString || config.appTitle || 'IT Warehouse System'}</span>
      </div>
    </header>
  );
}

