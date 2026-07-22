import { getStockLogs } from '@/app/actions/logs';
import { getLocations } from '@/app/actions/master-data';
import { LogsClient } from '@/components/logs/logs-client';

export const revalidate = 0;

export default async function LogsPage() {
  const [logs, locations] = await Promise.all([
    getStockLogs(),
    getLocations(),
  ]);

  return <LogsClient initialLogs={logs} locations={locations} />;
}
