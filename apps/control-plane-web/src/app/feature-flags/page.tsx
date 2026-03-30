import { connection } from 'next/server';
import { ControlPlaneShell } from '../../features/shared/control-plane-shell';
import { ControlPlaneDataNotice } from '../../features/shared/control-plane-page-patterns';
import { listFeatureFlags, listTenants } from '../../lib/api-control-plane';
import { FeatureFlagsPanel } from './feature-flags-panel';

export default async function FeatureFlagsPage() {
  await connection();

  const [flagsResult, tenantsResult] = await Promise.allSettled([listFeatureFlags(), listTenants()]);
  const flags = flagsResult.status === 'fulfilled' ? flagsResult.value : [];
  const tenants = tenantsResult.status === 'fulfilled' ? tenantsResult.value : [];
  const dataWarnings: string[] = [];
  if (flagsResult.status !== 'fulfilled') dataWarnings.push('Feature flag registry could not be loaded.');
  if (tenantsResult.status !== 'fulfilled') dataWarnings.push('Organisation labels could not be resolved.');

  return (
    <ControlPlaneShell
      description="Inspect global flags and scoped overrides used to govern rollout across organisations, plans, and country profiles."
      eyebrow="Controls"
      title="Feature flags"
    >
      {dataWarnings.length > 0 ? (
        <div className="mb-6">
          <ControlPlaneDataNotice
            description={dataWarnings.join(' ')}
            title="Feature flags loaded with partial platform data"
          />
        </div>
      ) : null}
      <FeatureFlagsPanel flags={flags} tenants={tenants} />
    </ControlPlaneShell>
  );
}
