'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export type AppConfigData = {
  id: string;
  appTitle: string;
  appSubtitle: string;
  appLogo: string | null;
  handoverLogo: string | null;
  handoverTitle: string;
  handoverLocation: string;
  primaryColor: string;
  backgroundColor: string;
  cardBackgroundColor: string;
  cardBorderColor: string;
  sidebarBackgroundColor: string;
};

export const DEFAULT_CONFIG: AppConfigData = {
  id: 'default',
  appTitle: 'IT Warehouse',
  appSubtitle: 'PSTB',
  appLogo: '/logo.png',
  handoverLogo: '/pertamina-pl.png',
  handoverTitle: 'BERITA ACARA SERAH TERIMA BARANG',
  handoverLocation: 'PTK Shore Base Tanjung Batu',
  primaryColor: '#b90051',
  backgroundColor: '#f8fafc',
  cardBackgroundColor: '#ffffff',
  cardBorderColor: '#e2e8f0',
  sidebarBackgroundColor: '#ffffff',
};

export async function getAppConfig(): Promise<AppConfigData> {
  try {
    const config = await prisma.appConfig.findUnique({
      where: { id: 'default' },
    });

    if (!config) {
      return DEFAULT_CONFIG;
    }

    return {
      id: config.id,
      appTitle: config.appTitle || DEFAULT_CONFIG.appTitle,
      appSubtitle: config.appSubtitle || DEFAULT_CONFIG.appSubtitle,
      appLogo: config.appLogo || DEFAULT_CONFIG.appLogo,
      handoverLogo: config.handoverLogo || DEFAULT_CONFIG.handoverLogo,
      handoverTitle: config.handoverTitle || DEFAULT_CONFIG.handoverTitle,
      handoverLocation: config.handoverLocation || DEFAULT_CONFIG.handoverLocation,
      primaryColor: config.primaryColor || DEFAULT_CONFIG.primaryColor,
      backgroundColor: config.backgroundColor || DEFAULT_CONFIG.backgroundColor,
      cardBackgroundColor: config.cardBackgroundColor || DEFAULT_CONFIG.cardBackgroundColor,
      cardBorderColor: config.cardBorderColor || DEFAULT_CONFIG.cardBorderColor,
      sidebarBackgroundColor: config.sidebarBackgroundColor || DEFAULT_CONFIG.sidebarBackgroundColor,
    };
  } catch (error) {
    console.error('Failed to get app config:', error);
    return DEFAULT_CONFIG;
  }
}

export async function updateAppConfig(data: Partial<AppConfigData>): Promise<AppConfigData> {
  const current = await getAppConfig();

  const updated = await prisma.appConfig.upsert({
    where: { id: 'default' },
    update: {
      appTitle: data.appTitle ?? current.appTitle,
      appSubtitle: data.appSubtitle ?? current.appSubtitle,
      appLogo: data.appLogo !== undefined ? data.appLogo : current.appLogo,
      handoverLogo: data.handoverLogo !== undefined ? data.handoverLogo : current.handoverLogo,
      handoverTitle: data.handoverTitle ?? current.handoverTitle,
      handoverLocation: data.handoverLocation ?? current.handoverLocation,
      primaryColor: data.primaryColor ?? current.primaryColor,
      backgroundColor: data.backgroundColor ?? current.backgroundColor,
      cardBackgroundColor: data.cardBackgroundColor ?? current.cardBackgroundColor,
      cardBorderColor: data.cardBorderColor ?? current.cardBorderColor,
      sidebarBackgroundColor: data.sidebarBackgroundColor ?? current.sidebarBackgroundColor,
    },
    create: {
      id: 'default',
      appTitle: data.appTitle ?? DEFAULT_CONFIG.appTitle,
      appSubtitle: data.appSubtitle ?? DEFAULT_CONFIG.appSubtitle,
      appLogo: data.appLogo !== undefined ? data.appLogo : DEFAULT_CONFIG.appLogo,
      handoverLogo: data.handoverLogo !== undefined ? data.handoverLogo : DEFAULT_CONFIG.handoverLogo,
      handoverTitle: data.handoverTitle ?? DEFAULT_CONFIG.handoverTitle,
      handoverLocation: data.handoverLocation ?? DEFAULT_CONFIG.handoverLocation,
      primaryColor: data.primaryColor ?? DEFAULT_CONFIG.primaryColor,
      backgroundColor: data.backgroundColor ?? DEFAULT_CONFIG.backgroundColor,
      cardBackgroundColor: data.cardBackgroundColor ?? DEFAULT_CONFIG.cardBackgroundColor,
      cardBorderColor: data.cardBorderColor ?? DEFAULT_CONFIG.cardBorderColor,
      sidebarBackgroundColor: data.sidebarBackgroundColor ?? DEFAULT_CONFIG.sidebarBackgroundColor,
    },
  });

  revalidatePath('/', 'layout');
  revalidatePath('/customization');
  revalidatePath('/handovers');

  return {
    id: updated.id,
    appTitle: updated.appTitle,
    appSubtitle: updated.appSubtitle,
    appLogo: updated.appLogo,
    handoverLogo: updated.handoverLogo,
    handoverTitle: updated.handoverTitle,
    handoverLocation: updated.handoverLocation,
    primaryColor: updated.primaryColor,
    backgroundColor: updated.backgroundColor,
    cardBackgroundColor: updated.cardBackgroundColor,
    cardBorderColor: updated.cardBorderColor,
    sidebarBackgroundColor: updated.sidebarBackgroundColor,
  };
}

export async function resetAppConfig(): Promise<AppConfigData> {
  const reset = await prisma.appConfig.upsert({
    where: { id: 'default' },
    update: {
      appTitle: DEFAULT_CONFIG.appTitle,
      appSubtitle: DEFAULT_CONFIG.appSubtitle,
      appLogo: DEFAULT_CONFIG.appLogo,
      handoverLogo: DEFAULT_CONFIG.handoverLogo,
      handoverTitle: DEFAULT_CONFIG.handoverTitle,
      handoverLocation: DEFAULT_CONFIG.handoverLocation,
      primaryColor: DEFAULT_CONFIG.primaryColor,
      backgroundColor: DEFAULT_CONFIG.backgroundColor,
      cardBackgroundColor: DEFAULT_CONFIG.cardBackgroundColor,
      cardBorderColor: DEFAULT_CONFIG.cardBorderColor,
      sidebarBackgroundColor: DEFAULT_CONFIG.sidebarBackgroundColor,
    },
    create: {
      ...DEFAULT_CONFIG,
    },
  });

  revalidatePath('/', 'layout');
  revalidatePath('/customization');
  revalidatePath('/handovers');

  return DEFAULT_CONFIG;
}
