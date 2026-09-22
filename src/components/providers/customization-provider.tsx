'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppConfigData, DEFAULT_CONFIG, updateAppConfig, resetAppConfig } from '@/app/actions/config';

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
  root.style.setProperty('--primary', config.primaryColor);
  root.style.setProperty('--accent', config.primaryColor);
  root.style.setProperty('--background', config.backgroundColor);
  root.style.setProperty('--card-bg', config.cardBackgroundColor);
  root.style.setProperty('--card-border', config.cardBorderColor);

  // Apply background to body
  document.body.style.backgroundColor = config.backgroundColor;
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
