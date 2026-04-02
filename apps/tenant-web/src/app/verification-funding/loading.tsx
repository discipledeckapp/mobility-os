import { RouteLoadingState } from '../../features/shared/route-state';

export default function VerificationFundingLoading() {
  return (
    <RouteLoadingState
      description="Load available verification credit, recent usage, and funding controls."
      eyebrow="Verification Credit"
      summaryCount={3}
      tableRows={5}
      title="Verification Credit"
    />
  );
}
