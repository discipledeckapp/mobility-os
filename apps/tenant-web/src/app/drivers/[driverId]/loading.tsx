import { DetailPageLoadingState } from '@mobility-os/ui';
import { TenantAppShell } from '../../../features/shared/tenant-app-shell';

export default function DriverDetailsLoading() {
  return (
    <TenantAppShell
      description="Driver identity, review state, risk signals, assignments, and remittance context."
      eyebrow="Operators"
      title="Driver record"
    >
      <DetailPageLoadingState
        description="Loading driver identity evidence, verification state, assignment history, and organisation context."
        sidebarDescription="Preparing review status, remittance summary, documents, and the verification workspace."
        sidebarTitle="Loading driver operations context"
        title="Loading driver details"
      />
    </TenantAppShell>
  );
}
