import { ControlPlaneShell } from '../../features/shared/control-plane-shell';
import { listFeatureFlags, listTenants } from '../../lib/api-control-plane';
import { FeatureFlagsPanel } from './feature-flags-panel';

export default async function FeatureFlagsPage() {
  const [flags, tenants] = await Promise.all([listFeatureFlags(), listTenants()]);

  return (
    <ControlPlaneShell
      description="Inspect global flags and scoped overrides used to govern rollout across organisations, plans, and country profiles."
      eyebrow="Controls"
      title="Feature flags"
    >
      <FeatureFlagsPanel flags={flags} tenants={tenants} />
    </ControlPlaneShell>
  );
}
