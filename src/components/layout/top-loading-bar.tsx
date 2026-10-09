'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCustomization } from '@/components/providers/customization-provider';

export function TopLoadingBar(): React.JSX.Element | null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { config } = useCustomization();
  const [progress, setProgress] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // When pathname or searchParams change, navigation finished
  useEffect(() => {
    if (isVisible) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Listen to link clicks across the document
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent): void => {
      // Only handle standard left click without modifier keys
      if (
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        event.defaultPrevented
      ) {
        return;
      }

      const target = (event.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Ignore external or non-navigational links
      if (
        target.target === '_blank' ||
        target.hasAttribute('download') ||
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        href.startsWith('javascript:')
      ) {
        return;
      }

      // Ignore click if navigating to exact same current URL
      const currentPathWithSearch = window.location.pathname + window.location.search;
      if (href === currentPathWithSearch) {
        return;
      }

      // Start loading bar immediately on click
      setIsVisible(true);
      setProgress(25);
    };

    document.addEventListener('click', handleAnchorClick, true);
    return () => document.removeEventListener('click', handleAnchorClick, true);
  }, []);

  // Incrementally advance progress while loading
  useEffect(() => {
    if (!isVisible || progress >= 100) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) return prev;
        if (prev >= 65) return prev + 2;
        if (prev >= 40) return prev + 6;
        return prev + 12;
      });
    }, 180);

    // Safety timeout: auto reset after 8 seconds in case navigation is cancelled
    const safetyTimeout = setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 8000);

    return () => {
      clearInterval(interval);
      clearTimeout(safetyTimeout);
    };
  }, [isVisible, progress]);

  if (!isVisible) return null;

  const barColor = config?.primaryColor || '#b90051';

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-[3px] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          backgroundColor: barColor,
          boxShadow: `0 0 10px ${barColor}, 0 0 5px ${barColor}`,
        }}
      />
    </div>
  );
}
