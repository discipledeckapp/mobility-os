import { connection } from 'next/server';
import { ControlPlaneShell } from '../../features/shared/control-plane-shell';
import { listPlatformSettings } from '../../lib/api-control-plane';
import { requirePlatformSession } from '../../lib/require-platform-session';
import { PlatformSettingsPanel } from './platform-settings-panel';

export default async function PlatformSettingsPage() {
  await connection();

  const token = await requirePlatformSession();
  const settings = await listPlatformSettings(token).catch(() => []);

  return (
    <ControlPlaneShell
      description="Manage platform-wide verification routing and billing policy through governed settings instead of hidden backend state."
      eyebrow="Governance"
      title="Platform settings"
    >
      <PlatformSettingsPanel settings={settings} />
    </ControlPlaneShell>
  );
}
