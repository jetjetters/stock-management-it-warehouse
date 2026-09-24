'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { updateAppConfig, resetAppConfig } from '@/app/actions/config';
import { AppConfigData, DEFAULT_CONFIG } from '@/lib/config';

import { hexToRgb, adjustBrightness, getLuminance } from '@/lib/color-utils';

type CustomizationContextType = {
  config: AppConfigData;
  setLocalConfig: (data: Partial<AppConfigData>) => void;
  saveConfig: (data: Partial<AppConfigData>) => Promise<boolean>;
  resetToDefault: () => Promise<boolean>;
  isSaving: boolean;
};

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined);

function applyThemeVariables(config: AppConfigData): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const primary = config.primaryColor || '#b90051';
  const primaryRgb = hexToRgb(primary);
  const hoverColor = adjustBrightness(primary, -15);
  const gradFrom = adjustBrightness(primary, 15);
  const gradTo = adjustBrightness(primary, -25);

  root.style.setProperty('--primary', primary);
  root.style.setProperty('--accent', primary);
  root.style.setProperty('--primary-hover', hoverColor);
  root.style.setProperty('--primary-light', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.12)`);
  root.style.setProperty('--primary-border', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.28)`);
  root.style.setProperty('--primary-shadow', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.25)`);
  root.style.setProperty('--primary-gradient-from', gradFrom);
  root.style.setProperty('--primary-gradient-via', primary);
  root.style.setProperty('--primary-gradient-to', gradTo);

  const bg = config.backgroundColor || '#f8fafc';
  const cardBg = config.cardBackgroundColor || '#ffffff';
  const cardBorder = config.cardBorderColor || '#e2e8f0';
  const sidebarBg = config.sidebarBackgroundColor || '#ffffff';

  root.style.setProperty('--background', bg);
  root.style.setProperty('--card-bg', cardBg);
  root.style.setProperty('--card-border', cardBorder);
  root.style.setProperty('--sidebar-bg', sidebarBg);

  // Apply directly to body element
  document.body.style.backgroundColor = bg;

  // Dark mode / contrast calculation
  const cardLum = getLuminance(cardBg);
  const bgLum = getLuminance(bg);
  const sidebarLum = getLuminance(sidebarBg);
  const isDark = cardLum < 0.45 || bgLum < 0.45;
  const isSidebarDark = sidebarLum < 0.45;

  // Sidebar hover background: darker than sidebar in dark theme, subtle light tint in light theme
  const sidebarHoverBg = isSidebarDark
    ? (sidebarLum < 0.02 ? 'rgba(255, 255, 255, 0.08)' : adjustBrightness(sidebarBg, -45))
    : 'rgba(0, 0, 0, 0.05)';
  root.style.setProperty('--sidebar-hover-bg', sidebarHoverBg);

  if (isSidebarDark) {
    root.classList.add('dark-sidebar');
  } else {
    root.classList.remove('dark-sidebar');
  }

  if (isDark) {
    root.classList.add('dark-theme');
    root.style.setProperty('--table-header-bg', 'rgba(255, 255, 255, 0.05)');
    root.style.setProperty('--foreground', '#f8fafc');
  } else {
    root.classList.remove('dark-theme');
    root.style.setProperty('--table-header-bg', 'rgba(0, 0, 0, 0.02)');
    root.style.setProperty('--foreground', '#0f172a');
  }
}

export function CustomizationProvider({
  initialConfig,
  children,
}: {
  initialConfig: AppConfigData;
  children: React.ReactNode;
}) {
  const [config, setConfig] = useState<AppConfigData>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Check if client has cached config
    const cached = localStorage.getItem('it_warehouse_config');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setConfig((prev) => ({ ...prev, ...parsed }));
        applyThemeVariables({ ...initialConfig, ...parsed });
        return;
      } catch (e) {
        console.error('Failed to parse cached config', e);
      }
    }
    applyThemeVariables(initialConfig);
  }, [initialConfig]);

  const setLocalConfig = (data: Partial<AppConfigData>) => {
    setConfig((prev) => {
      const next = { ...prev, ...data };
      applyThemeVariables(next);
      return next;
    });
  };

  const saveConfig = async (data: Partial<AppConfigData>): Promise<boolean> => {
    try {
      setIsSaving(true);
      const nextConfig = { ...config, ...data };
      setLocalConfig(data);

      localStorage.setItem('it_warehouse_config', JSON.stringify(nextConfig));
      await updateAppConfig(data);
      return true;
    } catch (error) {
      console.error('Failed to save config:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefault = async (): Promise<boolean> => {
    try {
      setIsSaving(true);
      localStorage.removeItem('it_warehouse_config');
      setConfig(DEFAULT_CONFIG);
      applyThemeVariables(DEFAULT_CONFIG);
      await resetAppConfig();
      return true;
    } catch (error) {
      console.error('Failed to reset config:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CustomizationContext.Provider
      value={{
        config,
        setLocalConfig,
        saveConfig,
        resetToDefault,
        isSaving,
      }}
    >
      {children}
    </CustomizationContext.Provider>
  );
}

export function useCustomization(): CustomizationContextType {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error('useCustomization must be used within a CustomizationProvider');
  }
  return context;
}
