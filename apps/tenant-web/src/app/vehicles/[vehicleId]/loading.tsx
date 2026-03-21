import { DetailPageLoadingState } from '@mobility-os/ui';
import { TenantAppShell } from '../../../features/shared/tenant-app-shell';

export default function VehicleDetailsLoading() {
  return (
    <TenantAppShell
      description="Vehicle identification, valuation, assignment history, and VIN context."
      eyebrow="Assets"
      title="Vehicle record"
    >
      <DetailPageLoadingState
        description="Loading vehicle identity, valuation, assignment summary, and VIN-linked context."
        sidebarDescription="Preparing valuation summary, assignment history, maintenance context, and editable vehicle fields."
        sidebarTitle="Loading vehicle operations context"
        title="Loading vehicle details"
      />
    </TenantAppShell>
  );
}
