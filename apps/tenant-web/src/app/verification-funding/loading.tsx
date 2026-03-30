import { RouteLoadingState } from '../../features/shared/route-state';

export default function VerificationFundingLoading() {
  return (
    <RouteLoadingState
      description="Track verification funding, available credit, and company-paid verification readiness."
      eyebrow="Verification Funding"
      summaryCount={3}
      tableRows={5}
      title="Verification funding"
    />
  );
}
