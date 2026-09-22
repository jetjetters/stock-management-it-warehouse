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
