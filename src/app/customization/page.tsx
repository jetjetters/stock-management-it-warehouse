import { getAppConfig } from '@/app/actions/config';
import { CustomizationClient } from '@/components/customization/customization-client';

export const metadata = {
  title: 'Kustomisasi Tampilan | IT Warehouse',
  description: 'Ubah logo aplikasi, logo serah terima, dan skema warna tampilan sistem',
};

export default async function CustomizationPage() {
  const initialConfig = await getAppConfig();

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <CustomizationClient initialConfig={initialConfig} />
    </div>
  );
}
