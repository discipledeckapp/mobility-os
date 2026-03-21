import { RouteLoadingState } from '../../features/shared/route-state';

export default function RemittanceLoading() {
  return (
    <RouteLoadingState
      description="Daily collections recording and reconciliation for transport operators."
      eyebrow="Collections"
      summaryCount={3}
      tableRows={6}
      title="Remittance"
    />
  );
}
